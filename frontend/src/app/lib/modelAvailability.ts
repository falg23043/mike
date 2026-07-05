import { SETTINGS_MODELS, type ModelOption } from "../components/assistant/ModelToggle";
import type { ApiKeyState } from "@/app/lib/mikeApi";

export type ModelProvider = "bedrock";

export function getModelProvider(modelId: string): ModelProvider | null {
    const model = SETTINGS_MODELS.find((m) => m.id === modelId);
    if (!model) return null;
    return modelGroupToProvider(model.group);
}

export function isModelAvailable(
    modelId: string,
    _apiKeys: ApiKeyState,
): boolean {
    // All models are Bedrock, which is always available via server-side
    // AWS credentials.
    return getModelProvider(modelId) !== null;
}

export function isProviderAvailable(
    _provider: ModelProvider,
    _apiKeys: ApiKeyState,
): boolean {
    return true; // bedrock — always available via server-side credentials
}

export function providerLabel(_provider: ModelProvider): string {
    return "AWS Bedrock (Claude)";
}

export function modelGroupToProvider(
    _group: ModelOption["group"],
): ModelProvider {
    return "bedrock";
}
