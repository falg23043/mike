import { createServerSupabase } from "../supabase";
import { computeCost } from "./pricing";
import { providerForModel } from "./models";
import type { TokenUsage } from "./types";

export type UsageLogInput = {
    userId: string;
    model: string;
    usage: TokenUsage;
    /** Which app surface produced the call (chat, tabular, title, etc.). */
    feature: string;
    /** True when the call used the user's own provider API key (e.g. Gemini). */
    usedOwnKey?: boolean;
};

/**
 * Record one token-usage event. Computes billed cost (list price x multiplier)
 * and writes a row to public.token_usage. Never throws — usage logging must
 * never break a user-facing request.
 */
export async function logTokenUsage(input: UsageLogInput): Promise<void> {
    try {
        const { userId, model, usage, feature } = input;
        const inputTokens = Math.max(0, Math.round(usage.inputTokens || 0));
        const outputTokens = Math.max(0, Math.round(usage.outputTokens || 0));
        if (inputTokens === 0 && outputTokens === 0) return;

        const { inputCost, outputCost, totalCost } = computeCost(
            model,
            inputTokens,
            outputTokens,
        );
        let provider = "unknown";
        try {
            provider = providerForModel(model);
        } catch {
            /* unknown model id — leave as "unknown" */
        }

        const db = createServerSupabase();
        const { error } = await db.from("token_usage").insert({
            user_id: userId,
            model,
            provider,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            input_cost: inputCost,
            output_cost: outputCost,
            total_cost: totalCost,
            used_own_key: input.usedOwnKey ?? false,
            feature,
        });
        if (error) {
            console.error("[usage] failed to insert token_usage row", error);
        }
    } catch (err) {
        console.error("[usage] logTokenUsage threw (suppressed)", err);
    }
}
