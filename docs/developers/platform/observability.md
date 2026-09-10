---
title: Observability
description: How errors reach Honeybadger and Sentry, the unified reporting API, structured logging, and how to trace a request.
type: concept
---

CodeAI reports errors to two vendors simultaneously and emits structured request logs via lograge.

## Error reporting: dual vendors

Both Honeybadger and Sentry are wired at the same time. This is intentional, not a migration artifact.

### Honeybadger

Honeybadger is unconditional. The gem is declared in `dashboard/Gemfile`, configured in `dashboard/config/honeybadger.yml` with `CDO.dashboard_honeybadger_api_key`, and has no feature-flag gate. There is no kill switch -- if the gem is loaded, it reports.

Honeybadger's Rack middleware (`Honeybadger::Rack::ErrorNotifier`) sits near the top of the middleware stack and catches unhandled exceptions automatically.

A separate Honeybadger project receives cron-job errors via `CDO.cronjobs_honeybadger_api_key` (see `lib/cdo/honeybadger.rb`).

### Sentry

Sentry is flag-gated. The gems (`sentry-ruby`, `sentry-rails`, `sentry-opentelemetry`) are declared in the observability engine's gemspec, not the main Gemfile. Sentry initializes only when `CDO.enable_sentry` is true and `CDO.dashboard_sentry_dsn` is present. The DSN is an uncommitted secret (not in any checked-in config file).

`enable_sentry` is set to `true` in `config/production.yml.erb`, `staging.yml.erb`, `levelbuilder.yml.erb`, and `test.yml.erb`. Whether Sentry actually reports in a given environment depends on the DSN being configured in that environment's secrets.

### The unified API

All handled errors should go through one function:

```ruby
Observability::Errors.report(error_or_message, **options)
```

This dual-notifies both vendors. The options hash is passed to Honeybadger verbatim (so notice titles and grouping work as before) and mapped to Sentry extras. The method returns the Sentry event (callers use its `event_id`).

Unhandled exceptions continue to reach both vendors through their own Rack middleware, independent of this API.

Do not call `Honeybadger.notify` or `Sentry.capture_exception` directly in new code. The only legitimate direct Honeybadger calls are in `lib/cdo/honeybadger.rb` (the cron-job path) and `lib/cdo/slack.rb` (legacy Slack-error reporting).

For the full API, see `dashboard/engines/observability/lib/observability/errors.rb` and `dashboard/engines/observability/README.md`.

## Structured logging

Request logs use [lograge](https://github.com/roidrage/lograge) (a Code.org fork at `code-dot-org/lograge`) configured in `dashboard/config/initializers/lograge.rb`. Lograge replaces the default verbose Rails logger with one structured JSON line per request.

For the complete logging architecture -- where logs go (S3, CloudWatch, syslog), how they are formatted, and how to query them in Athena -- see:

- [docs/logging.md](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/logging.md) -- platform logging overview.
- [docs/log-formats.md](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/log-formats.md) -- field-level format reference for every log type.

Those documents are authoritative for infrastructure-level logging. The sections below cover only the application-level error and request path.

## Tracing a request

When something goes wrong on a production request, use this sequence:

1. **Check Honeybadger** for the error class and backtrace. Honeybadger receives every error unconditionally.
2. **Check Sentry** for richer context (OpenTelemetry traces, user id). Sentry is gated but carries trace correlation when enabled.
3. **Query the lograge JSON** in CloudWatch Logs or Athena for the request's `request_id`. The `ActionDispatch::RequestId` middleware stamps every request, and lograge includes it in the structured log line.
4. **Check CloudFront access logs** in Athena (`elb_logs.cloudfront_logs`) for upstream timing, cache status, and client IP.

The `Observability::Errors.report` call sites (~80+ across the codebase) are the best grep target for how specific subsystems report handled errors.
