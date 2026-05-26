// ClineBox Configuration
// Environment variable keys and defaults.

export const ENV_VARS = {
  // Cloudflare
  CLOUDFLARE_ACCOUNT_ID: "CLOUDFLARE_ACCOUNT_ID",
  CLOUDFLARE_AI_GATEWAY_ID: "CLOUDFLARE_AI_GATEWAY_ID",

  // ClineBox
  CLINEBOX_WORKSPACE: "CLINEBOX_WORKSPACE",
  CLINEBOX_IDLE_TIMEOUT: "CLINEBOX_IDLE_TIMEOUT",
  CLINEBOX_ALLOW_DIRECT_MODEL_CALLS: "CLINEBOX_ALLOW_DIRECT_MODEL_CALLS",
  CLINEBOX_MODEL_PROVIDER: "CLINEBOX_MODEL_PROVIDER",
  CLINEBOX_MODEL_NAME: "CLINEBOX_MODEL_NAME",

  // Provider API Keys
  OPENAI_API_KEY: "OPENAI_API_KEY",
  ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY",
  GOOGLE_API_KEY: "GOOGLE_API_KEY",
  DEEPSEEK_API_KEY: "DEEPSEEK_API_KEY",
  OPENROUTER_API_KEY: "OPENROUTER_API_KEY",
  CLINE_API_KEY: "CLINE_API_KEY",
  GITHUB_TOKEN: "GITHUB_TOKEN",
} as const;

export const DEFAULTS = {
  TEMPLATE: "node",
  MODEL: "gateway-anthropic-sonnet",
  IDLE_TIMEOUT: "2h",
  ALLOW_DIRECT_MODEL_CALLS: "false",
  WORKSPACE: "/workspace",
  CONTAINER_PORT: 8788,
  HEALTH_PORT: 8788,
} as const;

export const ALLOWED_PORTS = [3000, 5173, 8000, 8787] as const;

export const ALLOWED_PROVIDERS = [
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "openrouter",
  "cline",
] as const;

export const ALLOWED_TEMPLATES = [
  "node",
  "python",
  "go",
  "rust",
  "zig",
  "blank",
] as const;

export const ALLOWED_SIZE_PROFILES = [
  "small",
  "standard",
  "large",
] as const;
