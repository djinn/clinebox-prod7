// ClineBox Model Profiles
// Maps gateway model IDs to provider and model names.

export interface ModelProfile {
  provider: string;
  model: string;
}

export const MODEL_PROFILES: Record<string, ModelProfile> = {
  "gateway-openai-gpt4o": {
    provider: "openai",
    model: "gpt-4o",
  },

  "gateway-anthropic-sonnet": {
    provider: "anthropic",
    model: "claude-sonnet-4",
  },

  "gateway-google-gemini": {
    provider: "google",
    model: "gemini-2.5-pro",
  },

  "gateway-deepseek-v4-flash": {
    provider: "deepseek",
    model: "deepseek-v4-flash",
  },

  "gateway-deepseek-v4-pro": {
    provider: "deepseek",
    model: "deepseek-v4-pro",
  },

  "gateway-openrouter-sonnet": {
    provider: "openrouter",
    model: "anthropic/claude-sonnet-4",
  },
};

export const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o3-mini"],
  anthropic: [
    "claude-sonnet-4",
    "claude-haiku-3-5",
    "claude-opus-4",
  ],
  google: ["gemini-2.5-pro", "gemini-2.0-flash"],
  deepseek: [
    "deepseek-v4-flash",
    "deepseek-v4-pro",
  ],
  openrouter: [
    "anthropic/claude-sonnet-4",
    "openai/gpt-4o",
    "google/gemini-2.5-pro",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-r1",
  ],
  cline: ["cline-sonnet", "cline-haiku"],
};

export function getGatewayUrl(
  accountId: string,
  gatewayId: string,
  provider: string
): string | null {
  const base = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}`;

  switch (provider) {
    case "openai":
      return `${base}/openai`;
    case "anthropic":
      return `${base}/anthropic`;
    case "deepseek":
      return `https://api.deepseek.com`;
    case "openrouter":
      return `${base}/openrouter`;
    default:
      return null;
  }
}

export function getGatewayBaseUrlVar(
  provider: string
): string | null {
  switch (provider) {
    case "openai":
      return "OPENAI_BASE_URL";
    case "anthropic":
      return "ANTHROPIC_BASE_URL";
    case "deepseek":
      return "DEEPSEEK_BASE_URL";
    case "openrouter":
      return "OPENROUTER_BASE_URL";
    default:
      return null;
  }
}
