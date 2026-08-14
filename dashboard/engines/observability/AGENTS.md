# observability engine

See [README.md](README.md) for setup, configuration, and an overview of how the engine works.

## Key Conventions

- Sentry's initializer runs `after: 'observability.opentelemetry'` so `sentry-opentelemetry` can attach to an already-configured OTel SDK. Don't reorder them.
- `opentelemetry-instrumentation-all` is pinned to `0.85.0` for Rails 7.0 compatibility. Remove the pin and the `span_naming: :class` override in `opentelemetry.rb` when upgrading to Rails 7.1.
- Raw user ids must not be sent to Sentry. `Observability::Sentry.set_user_token` takes an opaque token; callers derive it with `Cdo::UserLogToken` (in `lib/cdo/`, not this engine). Don't move the derivation in here, and don't add a reversal path — reversal is audited and belongs in Rails.
- Don't add a raw-id fallback for when the token is nil, and don't let the token path raise: it is reached from a Warden `after_fetch` hook on every authenticated request.
