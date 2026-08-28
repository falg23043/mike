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

const MAX_TOKENS = 64000;

// Single source of truth for the tool-use round cap. Imported by the chat
// prompt builder so the number the model is TOLD always matches the number
// the loop actually enforces (they drifted 10 vs 20 once and caused premature
// stops). Change here, and both the prompt and the loop stay in sync.
export const MAX_TOOL_ROUNDS = 20;

// How many times we'll nudge a model that ends its turn with no closing text
// after already running tools (premature empty finish) before giving up.
const MAX_EMPTY_FINISH_NUDGES = 1;

// Output effort for adaptive thinking (Bedrock output_config.effort).
// Overridable via env WITHOUT a code change; default "high" preserves prior
// behavior. An invalid value falls back to "high" with a one-time warning so a
// typo can never reach Bedrock. Resolved once at module load.
const VALID_EFFORTS = new Set(["high", "medium", "low"]);
const THINKING_EFFORT: string = (() => {
    const raw = (process.env.BEDROCK_THINKING_EFFORT ?? "high").toLowerCase();
    if (VALID_EFFORTS.has(raw)) return raw;
    console.warn(
        `[bedrock] invalid BEDROCK_THINKING_EFFORT="${process.env.BEDROCK_THINKING_EFFORT}", falling back to "high"`,
    );
    return "high";
})();

function client(): AnthropicBedrock {
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION ?? "ca-central-1";
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

// --- Diagnostics helpers (Phase-1: evidence for transient-vs-request-shape) ---

// Rough input-size estimate for failure logs. COUNTS ONLY — never logs message
// content (PII rule). ~4 chars/token is the usual ballpark.
function approxInputTokens(messages: NativeMessage[]): number {
    let chars = 0;
    for (const m of messages) {
        if (typeof m.content === "string") chars += m.content.length;
        else for (const b of m.content) chars += JSON.stringify(b).length;
    }
    return Math.round(chars / 4);
}

// Best-effort read of a response header off an SDK error, tolerating both
// Headers-like (.get) and plain-object header bags.
function errHeader(err: unknown, key: string): string | null {
    const headers = (err as { headers?: unknown })?.headers;
    if (!headers) return null;
    try {
        const getter = (headers as { get?: unknown }).get;
        if (typeof getter === "function") {
            return (
                (headers as { get: (k: string) => string | null }).get(key) ??
                null
            );
        }
        const rec = headers as Record<string, string>;
        return rec[key] ?? rec[key.toLowerCase()] ?? null;
    } catch {
        return null;
    }
}

// AWS request id for correlating with CloudWatch / AWS support.
function errRequestId(err: unknown): string | null {
    return (
        (err as { $metadata?: { requestId?: string } })?.$metadata
            ?.requestId ??
        errHeader(err, "x-amzn-requestid") ??
        errHeader(err, "x-amzn-RequestId") ??
        (err as { request_id?: string })?.request_id ??
        null
    );
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
    const maxIter = params.maxIterations ?? MAX_TOOL_ROUNDS;
    const bedrock = client();
    const region = process.env.AWS_REGION ?? "ca-central-1";
    const bedrockModelId = resolveBedrockModelId(model);
    const claudeTools = toClaudeTools(tools);

    const messages: NativeMessage[] = toNativeMessages(params.messages);
    let fullText = "";
    let inputTokens = 0;
    let outputTokens = 0;
    let toolsExecutedTotal = 0;
    // Set true the moment the model finishes a turn WITHOUT requesting more
    // tools (a natural finish). If the loop instead exits by exhausting
    // maxIter, this stays false — meaning we were cut off mid-tool-use.
    let completedNaturally = false;
    // Counts premature empty finishes we've already nudged this response.
    let emptyFinishNudges = 0;
    const runStart = Date.now();

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
                      output_config: { effort: THINKING_EFFORT },
                  } as unknown as Record<string, unknown>)
                : {}),
        });

        let sawThinking = false;
        const iterStart = Date.now();
        let streamEventCount = 0;
        let textDeltaCount = 0;
        let thinkingDeltaCount = 0;

        stream.on("streamEvent", (event) => {
            streamEventCount++;
            if (process.env.LOG_RAW_LLM_STREAM !== "true") return;
            const line = JSON.stringify(event);
            console.log("[bedrock raw stream]", line);
            fs.appendFile(RAW_STREAM_LOG_PATH, line + "\n", () => {});
        });

        stream.on("text", (delta) => {
            textDeltaCount++;
            callbacks.onContentDelta?.(delta);
        });
        if (enableThinking) {
            stream.on("thinking", (delta) => {
                sawThinking = true;
                thinkingDeltaCount++;
                callbacks.onReasoningDelta?.(delta);
            });
        }

        let final;
        try {
            final = await stream.finalMessage();
        } catch (err) {
            const name = (err as { name?: string })?.name ?? "";
            const isAbort =
                name === "AbortError" || name === "APIUserAbortError";
            if (!isAbort) {
                console.error(
                    "[bedrock stream-fail]",
                    JSON.stringify({
                        iter,
                        ms: Date.now() - iterStart,
                        streamEvents: streamEventCount,
                        textDeltas: textDeltaCount,
                        thinkingDeltas: thinkingDeltaCount,
                        toolsExecutedPriorIters: toolsExecutedTotal,
                        model: bedrockModelId,
                        region,
                        enableThinking: !!enableThinking,
                        effort: enableThinking ? THINKING_EFFORT : null,
                        approxInputTokens: approxInputTokens(messages),
                        errName: name || null,
                        errClass:
                            (err as { constructor?: { name?: string } })
                                ?.constructor?.name ?? null,
                        status:
                            (err as { status?: number })?.status ??
                            (err as { $metadata?: { httpStatusCode?: number } })
                                ?.$metadata?.httpStatusCode ??
                            null,
                        requestId: errRequestId(err),
                        xShouldRetry: errHeader(err, "x-should-retry"),
                        retryAfter:
                            errHeader(err, "retry-after") ??
                            errHeader(err, "retry-after-ms"),
                    }),
                );
            }
            throw err;
        }
        if (sawThinking) callbacks.onReasoningBlockEnd?.();
        const usage = (final as { usage?: { input_tokens?: number; output_tokens?: number } }).usage;
        if (usage) {
            inputTokens += usage.input_tokens ?? 0;
            outputTokens += usage.output_tokens ?? 0;
        }
        const stopReason = final.stop_reason;
        const assistantBlocks = final.content as ContentBlock[];

        const toolCalls: NormalizedToolCall[] = [];
        let turnText = "";
        for (const block of assistantBlocks) {
            if (block.type === "text") {
                const txt = (block as { text: string }).text;
                if (typeof txt === "string") {
                    fullText += txt;
                    turnText += txt;
                }
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
            // Premature empty finish: the model ended its turn (not a
            // tool_use stop) but produced no closing text, AFTER already
            // running tools this response. That's the "did all the prep,
            // then stopped right before the edit / with a blank answer"
            // failure. Nudge it once to actually finish — tools stay ENABLED
            // (unlike the cap-hit wrap-up below, which disables tools to
            // force a summary). Here we want it to complete the work.
            const producedClosingText = turnText.trim().length > 0;
            if (
                !producedClosingText &&
                toolsExecutedTotal > 0 &&
                runTools &&
                emptyFinishNudges < MAX_EMPTY_FINISH_NUDGES
            ) {
                emptyFinishNudges++;
                // Keep message history valid: append this (empty) assistant
                // turn as a non-empty placeholder, then the user nudge.
                messages.push({
                    role: "assistant",
                    content: [{ type: "text", text: "…" }],
                });
                messages.push({
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "You ended your turn without completing the requested change and without giving a final answer. Continue now: perform the remaining edits using the available tools, then provide a short summary of what you changed.",
                        },
                    ],
                });
                continue;
            }
            // Finish-decision log (docs/tool-loop-premature-stop.md's top
            // evidence gap): every natural finish, whether or not it looks
            // healthy, so the next occurrence has data instead of guesswork.
            console.log(
                "[bedrock finish]",
                JSON.stringify({
                    stopReason,
                    hadClosingText: producedClosingText,
                    toolRounds: iter + 1,
                    toolsExecutedTotal,
                    ms: Date.now() - runStart,
                    model: bedrockModelId,
                }),
            );
            completedNaturally = true;
            break;
        }

        const results = await runTools(toolCalls);
        toolsExecutedTotal += toolCalls.length;

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

    // If the loop ran out of iterations while the model was still calling
    // tools, it never got to produce its closing answer — historically this
    // surfaced as a "task done but blank response". Make one final call with
    // tools disabled (tool_choice=none) so the model must reply in text,
    // using every tool_result already appended to `messages`.
    const stoppedEarly = !completedNaturally;
    if (stoppedEarly) {
        const wrapUpStream = bedrock.messages.stream({
            model: bedrockModelId,
            system: systemPrompt,
            messages: messages as Anthropic.MessageParam[],
            // Keep tools defined so the tool_use/tool_result history stays
            // valid, but forbid new tool calls to force a text answer.
            ...(claudeTools.length
                ? {
                      tools: claudeTools as unknown as Anthropic.Tool[],
                      tool_choice: { type: "none" as const },
                  }
                : {}),
            max_tokens: MAX_TOKENS,
            // Thinking intentionally left off: this is a summarization turn.
        });

        wrapUpStream.on("text", (delta) => {
            callbacks.onContentDelta?.(delta);
        });

        let wrapUp;
        try {
            wrapUp = await wrapUpStream.finalMessage();
        } catch (err) {
            const name = (err as { name?: string })?.name ?? "";
            const isAbort =
                name === "AbortError" || name === "APIUserAbortError";
            if (!isAbort) {
                console.error(
                    "[bedrock wrap-up-fail]",
                    JSON.stringify({
                        toolsExecutedPriorIters: toolsExecutedTotal,
                        model: bedrockModelId,
                        region,
                        approxInputTokens: approxInputTokens(messages),
                        errName: name || null,
                        errClass:
                            (err as { constructor?: { name?: string } })
                                ?.constructor?.name ?? null,
                        status:
                            (err as { status?: number })?.status ??
                            (err as { $metadata?: { httpStatusCode?: number } })
                                ?.$metadata?.httpStatusCode ??
                            null,
                        requestId: errRequestId(err),
                        xShouldRetry: errHeader(err, "x-should-retry"),
                        retryAfter:
                            errHeader(err, "retry-after") ??
                            errHeader(err, "retry-after-ms"),
                    }),
                );
            }
            throw err;
        }

        const wrapUsage = (
            wrapUp as {
                usage?: { input_tokens?: number; output_tokens?: number };
            }
        ).usage;
        if (wrapUsage) {
            inputTokens += wrapUsage.input_tokens ?? 0;
            outputTokens += wrapUsage.output_tokens ?? 0;
        }
        for (const block of wrapUp.content as ContentBlock[]) {
            if (block.type === "text") {
                const txt = (block as { text: string }).text;
                if (typeof txt === "string") fullText += txt;
            }
        }
    }

    return { fullText, usage: { inputTokens, outputTokens }, stoppedEarly };
}

export async function completeBedrockText(params: {
    model: string;
    systemPrompt?: string;
    user: string;
    maxTokens?: number;
}): Promise<import("./types").CompleteTextResult> {
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
    const usage = (resp as { usage?: { input_tokens?: number; output_tokens?: number } }).usage;
    return {
        text,
        usage: {
            inputTokens: usage?.input_tokens ?? 0,
            outputTokens: usage?.output_tokens ?? 0,
        },
    };
}

export type { NormalizedToolResult };
