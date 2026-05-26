// ClineBox Validation
// Input validation for setup wizard and API endpoints.

import {
  ALLOWED_PORTS,
  ALLOWED_PROVIDERS,
  ALLOWED_TEMPLATES,
  ALLOWED_SIZE_PROFILES,
} from "./config";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePort(port: number): ValidationResult {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { valid: false, error: "Port must be an integer between 1 and 65535" };
  }

  if (!(ALLOWED_PORTS as readonly number[]).includes(port)) {
    return {
      valid: false,
      error: `Port ${port} is not allowed. Allowed ports: ${ALLOWED_PORTS.join(", ")}`,
    };
  }

  return { valid: true };
}

export function validateProvider(provider: string): ValidationResult {
  if (!provider) {
    return { valid: false, error: "Provider is required" };
  }

  if (!(ALLOWED_PROVIDERS as readonly string[]).includes(provider)) {
    return {
      valid: false,
      error: `Invalid provider '${provider}'. Allowed: ${ALLOWED_PROVIDERS.join(", ")}`,
    };
  }

  return { valid: true };
}

export function validateTemplate(template: string): ValidationResult {
  if (!template) {
    return { valid: false, error: "Template is required" };
  }

  if (!(ALLOWED_TEMPLATES as readonly string[]).includes(template)) {
    return {
      valid: false,
      error: `Invalid template '${template}'. Allowed: ${ALLOWED_TEMPLATES.join(", ")}`,
    };
  }

  return { valid: true };
}

export function validateSizeProfile(profile: string): ValidationResult {
  if (!profile) {
    return { valid: false, error: "Size profile is required" };
  }

  if (!(ALLOWED_SIZE_PROFILES as readonly string[]).includes(profile)) {
    return {
      valid: false,
      error: `Invalid size profile '${profile}'. Allowed: ${ALLOWED_SIZE_PROFILES.join(", ")}`,
    };
  }

  return { valid: true };
}

export function validateAccountId(id: string): ValidationResult {
  if (!id || id.length < 10) {
    return { valid: false, error: "Invalid Cloudflare Account ID" };
  }

  if (!/^[a-f0-9]+$/i.test(id)) {
    return { valid: false, error: "Account ID must be hexadecimal" };
  }

  return { valid: true };
}

export function validateGatewayId(id: string): ValidationResult {
  if (!id || id.length < 3) {
    return { valid: false, error: "Invalid AI Gateway ID" };
  }

  return { valid: true };
}

export function validateApiKey(key: string): ValidationResult {
  if (!key || key.length < 8) {
    return { valid: false, error: "API key appears invalid (too short)" };
  }

  return { valid: true };
}

export function validateGitRepo(url: string): ValidationResult {
  if (!url) {
    // Optional field
    return { valid: true };
  }

  if (!url.startsWith("https://github.com/")) {
    return {
      valid: false,
      error: "Only GitHub HTTPS URLs are supported",
    };
  }

  return { valid: true };
}

export function validateWorkspaceName(name: string): ValidationResult {
  if (!name || name.length < 1) {
    return { valid: false, error: "Workspace name is required" };
  }

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name)) {
    return {
      valid: false,
      error:
        "Workspace name must start and end with lowercase alphanumeric, and may contain hyphens",
    };
  }

  if (name.length > 63) {
    return { valid: false, error: "Workspace name must be 63 characters or fewer" };
  }

  return { valid: true };
}
