# observability

Rails engine for all observability concerns in Dashboard: OpenTelemetry tracing and Sentry error tracking.

## Setup

Observability instrumentations are disabled by default. Enable them in your `locals.yml` or environment configuration:

```yaml
enable_opentelemetry: true
enable_sentry: true
dashboard_sentry_dsn: "https://..."   # required for Sentry to send events
```

## OpenTelemetry

Only activates when `CDO.enable_opentelemetry` is true **and** the process is a web server (`CDO.running_web_application?`). This prevents unnecessary overhead in rake tasks and test runners.

Traces are exported to the local OpenTelemetry Collector via OTLP. The collector is installed by the `cdo-otel-collector` cookbook (`cookbooks/cdo-otel-collector`). The collector forwards traces to the configured APM backend.

**Rails 7.1 note:** `opentelemetry-instrumentation-all` is pinned to `0.85.0` because the ActionPack instrumentation requires a `span_naming: :class` workaround on Rails 7.0. Remove the pin and the override once Dashboard is on Rails 7.1.

## Sentry

Only activates when `CDO.enable_sentry` is true **and** the process is a web server (`CDO.running_web_application?`). This prevents Sentry from initializing during rake tasks, migrations, and test runners. When `CDO.enable_opentelemetry` is also enabled, Sentry's OTLP integration is turned on so errors include trace context. When OpenTelemetry is off, the OTLP integration is disabled.

Main Dashboard code should capture errors via `Observability::Errors.capture_exception` and `Observability::Errors.capture_message`, not by referencing `Sentry` directly.

### User identification

Events carry an opaque log token rather than a raw user id. `Observability::Sentry.set_user_token` takes a token and nothing else — **never pass it a user id.** The token is derived by the caller via `Cdo::UserLogToken`, which lives outside this engine deliberately: it is shared by every destination that would otherwise log a user id, and keeping it out of here keeps this engine's standalone test bundle free of a `lib/cdo` dependency.

Per-user grouping still works, because the token is stable for a given user. The token is specific to the `sentry` destination — the same user's token at another destination is a different value, so data from the two cannot be joined.

A log token is reversible by someone holding the key, through an audited admin path. Do not add a reversal path here; it belongs in Rails, where the key already lives.

A nil token leaves the user context untouched, so an unconfigured key degrades to anonymous events rather than falling back to the id. Note the corollary: a key that fails to load in production is silent apart from the admin page reporting it.

This is not the only way an identifier can reach Sentry. Anything placed in `context`, `extra`, tags, or an OpenTelemetry span attribute is exported as-is, and there is currently no `before_send` scrubber on either the Ruby or JavaScript side.

## Testing

Tests live in `test/` and mirror the `lib/` structure. Run them from the engine root:

```bash
cd dashboard/engines/observability
bundle exec rake test
```

Tests use minitest/spec syntax with Mocha for mocking. `test/test_helper.rb` stubs the `CDO` config module so tests run without activating OpenTelemetry or Sentry. Setup methods are tested directly (`Observability::OpenTelemetry.setup`, `Observability::Sentry.setup`); SDK calls (`OpenTelemetry::SDK.configure`, `Sentry.init`) are intercepted via Mocha's `expects` and `stub_everything`.

## Gem dependencies

All observability gems are declared in `observability.gemspec` and are only present in the bundle when this engine is included.
