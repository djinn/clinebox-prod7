# Model Configuration

## Default Models

| Gateway ID                | Provider    | Model               |
|---------------------------|-------------|---------------------|
| gateway-openai-gpt4o      | openai      | gpt-4o              |
| gateway-anthropic-sonnet  | anthropic   | claude-sonnet-4     |
| gateway-google-gemini     | google      | gemini-2.5-pro      |
| gateway-openrouter-sonnet | openrouter  | anthropic/claude-sonnet-4 |

## Provider Model Lists

### OpenAI
- gpt-4o
- gpt-4o-mini
- gpt-4-turbo
- o3-mini

### Anthropic
- claude-sonnet-4
- claude-haiku-3-5
- claude-opus-4

### Google
- gemini-2.5-pro
- gemini-2.0-flash

### OpenRouter
- anthropic/claude-sonnet-4
- openai/gpt-4o
- google/gemini-2.5-pro

### DeepSeek
- deepseek-v4-flash
- deepseek-v4-pro

### OpenRouter (DeepSeek models)
- deepseek/deepseek-chat
- deepseek/deepseek-r1

### Cline API
- cline-sonnet
- cline-haiku

## Configuration

All model traffic routes through Cloudflare AI Gateway by default.
Direct model calls are disabled by default (`CLINEBOX_ALLOW_DIRECT_MODEL_CALLS=false`).
