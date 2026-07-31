import { streamBedrock, completeBedrockText } from "./bedrock";
export { MAX_TOOL_ROUNDS } from "./bedrock";
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
    providerForModel(params.model);
    const result = await streamBedrock(params);
    if (params.usageContext) {
        await logTokenUsage({
            userId: params.usageContext.userId,
            model: params.model,
            usage: result.usage,
            feature: params.usageContext.feature,
            usedOwnKey: params.usageContext.usedOwnKey ?? false,
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
    providerForModel(params.model);
    const result: CompleteTextResult = await completeBedrockText(params);
    if (params.usageContext) {
        await logTokenUsage({
            userId: params.usageContext.userId,
            model: params.model,
            usage: result.usage,
            feature: params.usageContext.feature,
            usedOwnKey: params.usageContext.usedOwnKey ?? false,
        });
    }
    return result.text;
}
