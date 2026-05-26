# AI Gateway Configuration

## Requirement

All model traffic must route through Cloudflare AI Gateway by default.
Direct model calls are disabled by default.

## Why AI Gateway?

AI Gateway provides:
- Logging and audit trails
- Spend visibility
- Central governance
- Request inspection
- Future provider failover
- Centralized model routing

Without a gateway, every container becomes its own billing leak.

## Gateway URL Structure

### OpenAI
```
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai
```

### Anthropic
```
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/anthropic
```

### DeepSeek
DeepSeek uses its own API directly (OpenAI-compatible):
```
https://api.deepseek.com
```
DeepSeek does not route through the Cloudflare AI Gateway — it connects directly to `api.deepseek.com` using an OpenAI-compatible interface. The API key format is `sk-...`.

### OpenRouter
```
https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openrouter
```

## Required Variables

```
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_AI_GATEWAY_ID
CLINEBOX_MODEL_PROVIDER
CLINEBOX_MODEL_NAME
CLINEBOX_ALLOW_DIRECT_MODEL_CALLS=false
```
