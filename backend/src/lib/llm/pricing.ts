// ---------------------------------------------------------------------------
// Token pricing + cost computation.
//
// Rates are PUBLIC LIST PRICES multiplied by a billing multiplier (BILLING_
// MULTIPLIER) per Guillaume's instruction. All values are USD per 1,000,000
// tokens for the BASE list price; the multiplier is applied at cost-calc time.
//
// To change a rate, edit BASE_LIST_PRICE below. To change the markup, edit
// BILLING_MULTIPLIER. Costs are computed as:
//     cost = (tokens / 1_000_000) * listRate * BILLING_MULTIPLIER
//
// Sources (verified Jun 2026, public list prices):
//   Claude Haiku 4.5     $1 / $5    per M (in/out)
//   Claude Sonnet 4.6    $3 / $15   per M
//   Claude Opus (4-8)    $5 / $25   per M
// ---------------------------------------------------------------------------

/** Markup applied on top of public list prices. */
export const BILLING_MULTIPLIER = 6;

type Rate = { input: number; output: number }; // USD per 1M tokens (list)

const BASE_LIST_PRICE: Record<string, Rate> = {
    // Bedrock / Claude
    "bedrock-claude-opus-4-8": { input: 5, output: 25 },
    "bedrock-claude-sonnet-4-6": { input: 3, output: 15 },
    "bedrock-claude-haiku-4-5": { input: 1, output: 5 },
};

// Fallback rate for any unrecognized model id (use Sonnet-tier list price so we
// never silently undercount). Logged when hit.
const FALLBACK_RATE: Rate = { input: 3, output: 15 };

export function rateForModel(model: string): Rate {
    const r = BASE_LIST_PRICE[model];
    if (!r) {
        console.warn(
            `[pricing] no list price for model "${model}" — using fallback rate`,
        );
        return FALLBACK_RATE;
    }
    return r;
}

export type ComputedCost = {
    inputCost: number;
    outputCost: number;
    totalCost: number;
};

/** Compute billed USD cost (list price x BILLING_MULTIPLIER). */
export function computeCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
): ComputedCost {
    const rate = rateForModel(model);
    const inputCost =
        (inputTokens / 1_000_000) * rate.input * BILLING_MULTIPLIER;
    const outputCost =
        (outputTokens / 1_000_000) * rate.output * BILLING_MULTIPLIER;
    return {
        inputCost,
        outputCost,
        totalCost: inputCost + outputCost,
    };
}
