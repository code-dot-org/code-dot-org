# observability engine

See [README.md](README.md) for setup, configuration, and an overview of how the engine works.

## Key Conventions

- Sentry's initializer runs `after: 'observability.opentelemetry'` so `sentry-opentelemetry` can attach to an already-configured OTel SDK. Don't reorder them.
- `opentelemetry-instrumentation-all` is pinned to `0.85.0` for Rails 7.0 compatibility. Remove the pin and the `span_naming: :class` override in `opentelemetry.rb` when upgrading to Rails 7.1.
