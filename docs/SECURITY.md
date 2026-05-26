# Security Model

## Threat Model

Cline executes shell commands. That is the point and the risk.

The failure mode is pretending this is "safe by default".

## Security Requirements

### Never

- Expose public shell
- Expose arbitrary ports
- Log secrets
- Proxy unrestricted traffic

### Always

- Validate ports
- Validate providers
- Validate models
- Sanitize shell parameters
- Isolate workspace state

## Secret Management

All API keys and tokens must be stored as Cloudflare Secrets:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `OPENROUTER_API_KEY`
- `CLINE_API_KEY`
- `GITHUB_TOKEN`

Secrets must:
- Remain in Cloudflare Secrets
- Never appear in logs
- Never appear in API responses
- Never appear in HTML output

## Proxy Rules

Default allowed ports: 3000, 5173, 8000, 8787

Never expose:
- SSH (port 22)
- Docker daemon (port 2375/2376)
- Arbitrary localhost services
