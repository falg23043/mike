import type { Provider } from "./types";

// ---------------------------------------------------------------------------
// Bedrock model ID map — logical ID → real Bedrock cross-region inference ID
// ---------------------------------------------------------------------------
export const BEDROCK_MODEL_ID_MAP: Record<string, string> = {
    "bedrock-claude-opus-4-8":   "us.anthropic.claude-opus-4-8",
    "bedrock-claude-sonnet-4-6": "us.anthropic.claude-sonnet-4-6",
    "bedrock-claude-haiku-4-5":  "us.anthropic.claude-haiku-4-5-20251001-v1:0",
};

// Main-chat tier — user picks one of these per message.
export const BEDROCK_MAIN_MODELS = [
    "bedrock-claude-opus-4-8",
    "bedrock-claude-sonnet-4-6",
] as const;

export const GEMINI_MAIN_MODELS = [
    "gemini-3.1-pro-preview",
    "gemini-3-flash-preview",
] as const;

// Low-tier — used for title generation and lightweight extractions.
export const BEDROCK_LOW_MODELS = ["bedrock-claude-haiku-4-5"] as const;

export const GEMINI_LOW_MODELS = ["gemini-3.1-flash-lite-preview"] as const;

export const DEFAULT_MAIN_MODEL    = "bedrock-claude-opus-4-8";
export const DEFAULT_TABULAR_MODEL = "bedrock-claude-haiku-4-5";
export const DEFAULT_TITLE_MODEL   = "bedrock-claude-haiku-4-5";

const ALL_MODELS = new Set<string>([
    ...BEDROCK_MAIN_MODELS,
    ...GEMINI_MAIN_MODELS,
    ...BEDROCK_LOW_MODELS,
    ...GEMINI_LOW_MODELS,
]);

// ---------------------------------------------------------------------------
// Provider inference
// ---------------------------------------------------------------------------

export function providerForModel(model: string): Provider {
    if (model.startsWith("bedrock-")) return "bedrock";
    if (model.startsWith("gemini"))   return "gemini";
    throw new Error(`Unknown model id: ${model}`);
}

export function resolveModel(id: string | null | undefined, fallback: string): string {
    if (id && ALL_MODELS.has(id)) return id;
    return fallback;
}
