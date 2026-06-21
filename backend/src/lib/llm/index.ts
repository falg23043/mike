import { streamBedrock, completeBedrockText } from "./bedrock";
import { streamGemini, completeGeminiText } from "./gemini";
import { providerForModel } from "./models";
import { logTokenUsage } from "./usage";
import type {
    StreamChatParams,
    StreamChatResult,
    CompleteTextResult,
    UserApiKeys,
} from "./types";

export * from "./types";
export * from "./models";
export { computeCost, BILLING_MULTIPLIER, rateForModel } from "./pricing";
export { logTokenUsage } from "./usage";

/**
 * Optional accounting context. When provided, the call's token usage is logged
 * to public.token_usage automatically. Omit for internal/uncounted calls.
 */
export type UsageContext = {
    userId: string;
    feature: string;
    usedOwnKey?: boolean;
};

export async function streamChatWithTools(
    params: StreamChatParams & { usageContext?: UsageContext },
): Promise<StreamChatResult> {
    const provider = providerForModel(params.model);
    const result =
        provider === "bedrock"
            ? await streamBedrock(params)
            : await streamGemini(params);
    if (params.usageContext) {
        await logTokenUsage({
            userId: params.usageContext.userId,
            model: params.model,
            usage: result.usage,
            feature: params.usageContext.feature,
            usedOwnKey:
                params.usageContext.usedOwnKey ??
                (provider === "gemini" && !!params.apiKeys?.gemini),
        });
    }
    return result;
}

export async function completeText(params: {
    model: string;
    systemPrompt?: string;
    user: string;
    maxTokens?: number;
    apiKeys?: UserApiKeys;
    usageContext?: UsageContext;
}): Promise<string> {
    const provider = providerForModel(params.model);
    const result: CompleteTextResult =
        provider === "bedrock"
            ? await completeBedrockText(params)
            : await completeGeminiText(params);
    if (params.usageContext) {
        await logTokenUsage({
            userId: params.usageContext.userId,
            model: params.model,
            usage: result.usage,
            feature: params.usageContext.feature,
            usedOwnKey:
                params.usageContext.usedOwnKey ??
                (provider === "gemini" && !!params.apiKeys?.gemini),
        });
    }
    return result.text;
}
