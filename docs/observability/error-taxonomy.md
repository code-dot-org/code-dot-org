# AI Gateway Error Taxonomy

Canonical error categories used by the AI Gateway and its clients. Both the
code-dot-org client (Phase 1) and the ai-gateway service (Phase 2) use these
names so dashboards and alerts stay consistent across phases.

## Categories

| Category | Definition | HTTP status hint |
|---|---|---|
| `jwt_missing` | Request carries no authorization token. | 401 |
| `jwt_expired` | Token signature valid; expiry claim is in the past. | 401 |
| `jwt_invalid` | Token present but signature check failed or payload malformed. | 401 |
| `turnstile_failed` | Cloudflare Turnstile validation rejected the challenge token. | 401 |
| `turnstile_timeout` | Turnstile siteverify fetch exceeded the timeout deadline. | 401 |
| `rate_limit_local` | Gateway-local rate limiter rejected the request before reaching a provider. | 429 |
| `provider_429` | Upstream AI provider returned 429 Too Many Requests. | 429 |
| `provider_5xx` | Upstream AI provider returned a 5xx error. | 5xx |
| `provider_timeout` | Provider call exceeded the configured timeout. | 504, network timeout |
| `validation_error` | Request body failed schema validation (missing field, wrong type, etc.). | 400, 422 |
| `unhandled` | Exception escaped the central error handler without being classified. | any |

## Client-side inference

Before Phase 2 C2 ships structured error bodies from the gateway, the client
infers category from HTTP status alone:

- **401**: `jwt_invalid` (covers missing, expired, and Turnstile failures; refined later)
- **429**: `rate_limit_local` (refined to `provider_429` once gateway returns structured bodies)
- **504**: `provider_timeout`
- **5xx (other)**: `provider_5xx`
- **Other 4xx**: `validation_error`
- **Anything else**: `unhandled`

Once Phase 2 C2 ships, the gateway will include an explicit category field in
error response bodies and client-side inference can be replaced with a direct
read.

## References

- Gateway typed enum: `src/errors/categories.ts` in ai-gateway (Phase 2 C1)
- Client inference: `apps/src/aiGateway/logHelper.ts` in code-dot-org
- This file is linked from the ai-gateway observability plan doc.
