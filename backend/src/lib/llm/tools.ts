import type { OpenAIToolSchema } from "./types";

// ---------------------------------------------------------------------------
// Tool-schema adapters
// ---------------------------------------------------------------------------
// Callers hand us OpenAI-style tool definitions. Provider-specific converters
// live here so the rest of the code never has to think about it.

export type ClaudeTool = {
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
};

export function toClaudeTools(tools: OpenAIToolSchema[]): ClaudeTool[] {
    return tools.map((t) => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: normalizeSchema(t.function.parameters),
    }));
}

// ---------------------------------------------------------------------------
// Schema normalization
// ---------------------------------------------------------------------------
// The OpenAI tool schemas in the codebase already use plain JSON-Schema-lite
// shape. Claude accepts that shape. We only sanitise a couple of edge cases:
// we make sure arrays have `items` and objects have `properties`.

function normalizeSchema(schema: unknown): Record<string, unknown> {
    if (!schema || typeof schema !== "object") {
        return { type: "object", properties: {} };
    }
    const s = schema as Record<string, unknown>;
    const type = s.type;
    const out: Record<string, unknown> = { ...s };

    if (type === "object") {
        const props = (s.properties as Record<string, unknown>) ?? {};
        const normProps: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(props)) {
            normProps[k] = normalizeSchema(v);
        }
        out.properties = normProps;
    }
    if (type === "array" && s.items) {
        out.items = normalizeSchema(s.items);
    }
    return out;
}
