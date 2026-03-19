# observability engine

Rails engine for all observability concerns in Dashboard. Initializes OpenTelemetry tracing and Sentry error tracking during the Rails boot cycle via `initializer` hooks — no controllers, routes, or autoloaded lib code.

## Key files

- `lib/observability/engine.rb` — thin engine; registers two initializers that delegate to setup modules
- `lib/observability/opentelemetry.rb` — `Observability::OpenTelemetry.setup`
- `lib/observability/sentry.rb` — `Observability::Sentry.setup`
- `observability.gemspec` — all observability gem dependencies (opentelemetry-*, sentry-*)
- `test/lib/observability/opentelemetry_test.rb` — unit tests for OTel setup guards and SDK configuration
- `test/lib/observability/sentry_test.rb` — unit tests for Sentry setup guards and OTLP integration toggle
- `README.md` — setup and configuration guide

## Running tests

```bash
cd dashboard/engines/observability
bundle exec rake test
```

Tests use minitest/spec with Mocha for mocking (`stub_everything`, `expects`, `stubs`). `test/test_helper.rb` defines a `CDO` stub so tests run without a live Rails app or real SDK initialization. SDK calls (`OpenTelemetry::SDK.configure`, `Sentry.init`) are intercepted via Mocha expectations.

## How it's enabled

Both flags default to false and must be explicitly set in `locals.yml` or `config/development.yml.erb`:

**OpenTelemetry** activates when both are true:
- `CDO.enable_opentelemetry` is truthy
- `CDO.running_web_application?` is true (skips rake tasks, test runners, etc.)

**Sentry** activates when both are true:
- `CDO.enable_sentry` is truthy
- `CDO.running_web_application?` is true (skips rake tasks, test runners, etc.)
- When `CDO.enable_opentelemetry` is also true, Sentry's OTLP integration is enabled to correlate errors with traces

## Telemetry pipeline

Traces flow: Rails app → OTLP exporter → local OpenTelemetry Collector → APM backend.

The collector is currently installed locally by the `cdo-otel-collector` cookbook (`cookbooks/cdo-otel-collector`) but may transition to a sidecar collector in the future.

## Making changes

- Add/remove instrumentation in `opentelemetry.rb`; update `observability.gemspec` for any new gems.
- Add Sentry configuration in `sentry.rb`.
- The `opentelemetry-instrumentation-all` gem is pinned to `0.85.0` for Rails 7.0 compatibility. Remove the pin when upgrading to Rails 7.1.
- Sentry's initializer runs `after: 'observability.opentelemetry'` so the sentry-opentelemetry integration can attach to an already-configured OTel SDK.
