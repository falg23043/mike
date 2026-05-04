import AnthropicBedrock from "@anthropic-ai/bedrock-sdk";
import type Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import type {
    StreamChatParams,
    StreamChatResult,
    NormalizedToolCall,
    NormalizedToolResult,
} from "./types";
import { BEDROCK_MODEL_ID_MAP } from "./models";
import { toClaudeTools } from "./tools";

const RAW_STREAM_LOG_PATH = path.resolve(
    process.cwd(),
    "bedrock-raw-stream.log",
);

type ContentBlock =
    | { type: "text"; text: string }
    | { type: "tool_use"; id: string; name: string; input: unknown }
    | { type: string; [key: string]: unknown };

type NativeMessage = {
    role: "user" | "assistant";
    content: string | ContentBlock[];
};

const MAX_TOKENS = 16384;

function client(): AnthropicBedrock {
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION ?? "us-east-1";
    if (accessKey && secretKey) {
        return new AnthropicBedrock({
            awsAccessKey: accessKey,
            awsSecretKey: secretKey,
            awsRegion: region,
        });
    }
    // Fall back to AWS credential provider chain (IAM role, ~/.aws/credentials, etc.)
    return new AnthropicBedrock({ awsRegion: region });
}

function resolveBedrockModelId(logicalId: string): string {
    return BEDROCK_MODEL_ID_MAP[logicalId] ?? logicalId;
}

function toNativeMessages(
    messages: StreamChatParams["messages"],
): NativeMessage[] {
    return messages.map((m) => ({ role: m.role, content: m.content }));
}

export async function streamBedrock(
    params: StreamChatParams,
): Promise<StreamChatResult> {
    const {
        model,
        systemPrompt,
        tools = [],
        callbacks = {},
        runTools,
        enableThinking,
    } = params;
    const maxIter = params.maxIterations ?? 10;
    const bedrock = client();
    const bedrockModelId = resolveBedrockModelId(model);
    const claudeTools = toClaudeTools(tools);

    const messages: NativeMessage[] = toNativeMessages(params.messages);
    let fullText = "";

    for (let iter = 0; iter < maxIter; iter++) {
        const stream = bedrock.messages.stream({
            model: bedrockModelId,
            system: systemPrompt,
            messages: messages as Anthropic.MessageParam[],
            tools: claudeTools.length
                ? (claudeTools as unknown as Anthropic.Tool[])
                : undefined,
            max_tokens: MAX_TOKENS,
            ...(enableThinking
                ? ({
                      thinking: { type: "adaptive" },
                      output_config: { effort: "high" },
                  } as unknown as Record<string, unknown>)
                : {}),
        });

        let sawThinking = false;

        stream.on("streamEvent", (event) => {
            const line = JSON.stringify(event);
            console.log("[bedrock raw stream]", line);
            fs.appendFile(RAW_STREAM_LOG_PATH, line + "\n", () => {});
        });

        stream.on("text", (delta) => {
            callbacks.onContentDelta?.(delta);
        });
        if (enableThinking) {
            stream.on("thinking", (delta) => {
                sawThinking = true;
                callbacks.onReasoningDelta?.(delta);
            });
        }

        const final = await stream.finalMessage();
        if (sawThinking) callbacks.onReasoningBlockEnd?.();
        const stopReason = final.stop_reason;
        const assistantBlocks = final.content as ContentBlock[];

        const toolCalls: NormalizedToolCall[] = [];
        for (const block of assistantBlocks) {
            if (block.type === "text") {
                const txt = (block as { text: string }).text;
                if (typeof txt === "string") fullText += txt;
            } else if (block.type === "tool_use") {
                const tu = block as {
                    id: string;
                    name: string;
                    input: unknown;
                };
                const call: NormalizedToolCall = {
                    id: tu.id,
                    name: tu.name,
                    input: (tu.input as Record<string, unknown>) ?? {},
                };
                callbacks.onToolCallStart?.(call);
                toolCalls.push(call);
            }
        }

        if (stopReason !== "tool_use" || !toolCalls.length || !runTools) {
            break;
        }

        const results = await runTools(toolCalls);

        messages.push({ role: "assistant", content: assistantBlocks });
        messages.push({
            role: "user",
            content: results.map((r) => ({
                type: "tool_result",
                tool_use_id: r.tool_use_id,
                content: r.content,
            })),
        });
    }

    return { fullText };
}

export async function completeBedrockText(params: {
    model: string;
    systemPrompt?: string;
    user: string;
    maxTokens?: number;
}): Promise<string> {
    const bedrock = client();
    const bedrockModelId = resolveBedrockModelId(params.model);
    const resp = await bedrock.messages.create({
        model: bedrockModelId,
        max_tokens: params.maxTokens ?? 512,
        system: params.systemPrompt,
        messages: [{ role: "user", content: params.user }],
    });
    const text = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
    return text;
}

export type { NormalizedToolResult };
