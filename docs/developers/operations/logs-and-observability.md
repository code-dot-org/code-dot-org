---
title: Logs and observability
description: Where logs go, how to access servers, and links to the platform observability page.
type: reference
---

Log locations, server access, and browser telemetry endpoints. For the observability APIs (Honeybadger, Sentry, `Observability::Errors.report`, structured logging), see [Observability](/developers/platform/observability/).

## Log locations by environment

| Environment | Dashboard server logs | Build logs | UI test logs |
|---|---|---|---|
| development | `dashboard/log/development.log` | (console) | `dashboard/test/ui/*.log` |
| staging | SSH to staging, `~/staging/code-dot-org/dashboard/log/staging.log` | Email to `dev+build@code.org` | -- |
| test | SSH to test, `~/test/code-dot-org/dashboard/log/test.log` | Email to `dev+build@code.org` | SSH: `~/test/code-dot-org/dashboard/test/ui/*.log` |
| production | CloudWatch (stdout/stderr); errors in Honeybadger and Sentry, traces in Sentry | Email to `dev+build@code.org` | -- |

For the full log-source inventory (CloudFront, ALB, Firehose, Lambda, syslog), see [logging.md](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/logging.md) and [log-formats.md](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/log-formats.md).

`docs/where-are-the-logs.md` is the original log location table. Some entries reference HipChat and Sauce Labs, which are no longer in use.

## Server access

Shell access to managed EC2 instances uses [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html). You need AWS credentials and the Session Manager plugin installed.

Quick access: `bin/ssm <instance-name>` starts a session by the instance's Name tag. Tab completion is available via `bin/ssm-completion`.

Port forwarding through SSM lets you reach internal services (databases, internal HTTP). See [server-sessions.md](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/server-sessions.md) for setup instructions.

## Browser telemetry

Client-side logging and metrics flow through two endpoints:

- `POST /browser_events/put_logs` -- browser log events.
- `POST /browser_events/put_metric_data` -- browser metric data.

Both are gated by DCDO flags (`browser-events-enabled`, `browser-cloudwatch-metrics`) and Gatekeeper (`browser-cloudwatch-metrics`). The frontend code lives in `apps/src/logToCloud.js` and `apps/src/metrics/`. Data lands in CloudWatch.

Separate frontend observability flags (`frontend-observability-enabled`, `frontend-observability-sampling-config`) control a newer sampling pipeline.

## Known staleness in existing docs

| Document | Stale content |
|---|---|
| `docs/where-are-the-logs.md` | HipChat image link, Sauce Labs references |
| `docs/build-assets-on-adhoc.md` | PhantomJS rebuild step |
| `docs/testing-with-applitools-eyes.md` | Sauce Labs, Chrome 33 pin |
| `TESTING.md` | PhantomJS and Sauce Labs references |

These documents remain authoritative for their intended scope; the stale references are cosmetic. Proposed edits are recorded in the domain report.

## Next steps

- [Observability](/developers/platform/observability/) -- the error reporting API, Sentry, Honeybadger, and tracing.
- [Delivery](/developers/operations/delivery/) -- the deploy pipeline that produces these logs.
- [Staff tools](/developers/operations/staff-tools/) -- admin tools for investigating user issues.
