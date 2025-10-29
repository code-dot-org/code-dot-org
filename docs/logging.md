# Platform Logging Overview

This document inventories logging across the Code.org platform. It explains, in plain English, what emits logs during common operations, where those logs go (S3, CloudWatch, syslog), how they’re formatted, and how to view them across environments. Inline links point to the exact code and templates that configure each behavior.

## Sources that emit logs

- Web/CDN
  - **CloudFront access logs and WAF decisions**: Every request hits CloudFront first. CloudFront records request/response metadata to S3 using per‑app prefixes, enabled via [distribution logging](../aws/cloudformation/cloud_formation_stack.yml.erb#L414-L419) with per‑environment prefixes set in [S3 prefix configuration](../lib/cdo/aws/cloudfront.rb#L41-L53). Requests blocked or allowed by the CloudFront WebACL are also captured in WAF logs written to a dedicated bucket and modeled for Athena via the [WAF logs table](../aws/cloudformation/data.yml.erb#L662-L715). To optimize analytics, an S3 event triggers a small [partition lambda](../aws/cloudformation/s3PartitionCloudFrontLog.js) that moves each raw CloudFront log object from the initial drop path into `year=/month=/day=/hour=` partitions and deletes the original, matching the [Glue/Athena table](../aws/cloudformation/data.yml.erb#L504-L563) so queries scan only the needed partitions. CloudFront standard access logs are TSV and not JSON; real-time logs can stream structured fields but this rewriting them into partitions lands them in S3 and partitions for Athena.

- Load Balancers
  - **ALB access logs**: After CloudFront, requests that reach the Application Load Balancer are logged with full request/target/latency details. Logging is enabled directly on the ALB via [access log attributes](../aws/cloudformation/cloud_formation_stack.yml.erb#L300-L305), and those CSV logs are written to S3 under the standard `AWSLogs/<account>/<region>/elasticloadbalancing/` prefixes. We define an Athena schema so you can query ALB traffic efficiently using the [ELB/ALB Glue/Athena schema](../aws/cloudformation/data.yml.erb#L350-L420).

- Application servers (EC2)
  - **NGINX reverse proxy**: On each frontend EC2 instance, NGINX terminates connections from the ALB and proxies to Puma. It writes request and error lines to `/var/log/nginx/access.log` and `/var/log/nginx/error.log` as configured in the [nginx config](../cookbooks/cdo-nginx/templates/default/nginx.conf.erb#L19-L20). Note: once Pegasus is fully retired and Dashboard is the only web app, we can run a single Puma service directly behind the ALB and eliminate NGINX; Puma has access logging and structured logging support, which would also reduce logging duplication.
  - **Puma app servers (Dashboard and Pegasus)**: We run two (for now) separate Puma applications behind NGINX. Rails error logs are in JSON/[CEE format](https://cee.mitre.org/about/faqs.html#:~:text=In%20CEE%2C%20the%20taxonomy%20consists,was%20changed%20by%20the%20user.%22) and are condensed via Lograge in [production](../dashboard/config/environments/production.rb#L71-L72) and [staging](../dashboard/config/environments/staging.rb#L69-L70), and standard in [adhoc](../dashboard/config/environments/adhoc.rb#L34). Those Rails logs are written under each app’s `log/` directory and then synced to S3 hourly by our [uploader](./app-log-upload.md).
  - **Browser events**: Client‑side code can POST structured events that the server batches and writes to a per‑environment CloudWatch Logs [log group](../aws/cloudformation/components/logging.yml.erb#L1-L13). The server endpoint that receives and publishes these is the [controller entrypoint](../dashboard/app/controllers/browser_events_controller.rb#L4-L13) and [publisher](../dashboard/app/controllers/browser_events_controller.rb#L21-L27).
  - **Cron jobs and background tasks**: Many scheduled tasks load the main Rails stack and therefore log exactly like the web app (same formatter and destinations), but on the production daemon instance (or staging or test instances). As with the main puma and rails app logs, an [hourly uploader](../bin/upload-logs-to-s3#L4-L12) syncs local app logs to S3 so operational history is preserved; see the [log upload doc](./app-log-upload.md).
  - **Syslog on instances**: System‑level events are written to `/var/log/syslog` managed by rsyslog to provide a [rotating buffer](../cookbooks/cdo-syslog/recipes/default.rb#L16-L35) of OS‑level diagnostics. The Amazon CloudWatch Agent tails that file and ships lines to CloudWatch Logs using per‑environment log groups (e.g., `production-syslog`) defined in the agent [attributes](../cookbooks/cdo-cloudwatch-agent/attributes/default.rb#L1-L5) and rendered into the agent [config](../cookbooks/cdo-cloudwatch-agent/templates/default/amazon-cloudwatch-agent.json.erb#L72-L76).

- Database
  - **Aurora MySQL logs**: The cluster exports general, audit, error, and slow query logs to CloudWatch Logs for centralized visibility via the [log exports](../aws/cloudformation/components/database.yml.erb#L334-L339). We also create metric filters for RDS Enhanced Monitoring so OS metrics become first‑class CloudWatch metrics through the [enhanced monitoring filters](../aws/cloudformation/data.yml.erb#L235-L275). For local test coverage, the MySQL cookbooks demonstrate file‑based logging in these [example paths](../cookbooks/cdo-mysql/test/cookbooks/test-mysql/templates/default/mysqld.erb#L3-L8).

- Event pipelines (Firehose)
  - **DEPRECATED: Kinesis Data Firehose streams**: Some analytics events were sent directly to delivery streams for batch analysis. Clients exist in both [Ruby](../lib/cdo/firehose.rb#L71-L91) and [JavaScript](../apps/src/metrics/firehose.js#L18-L55). Current streams include `analysis-events` and `i18n-string-tracking-events` ([stream names and policy](../aws/cloudformation/cloud_formation_stack.yml.erb#L195-L197)). Downstream, Firehose delivers JSON payloads to S3/Redshift, optionally via Lambda transforms. Firehose is deprecated and will be removed in a future release.

- Lambdas and supporting infra
  - **Slack notifier** ([code](../aws/cloudformation/slackCloudWatchEvent.js)): Receives CloudWatch Events/SNS, posts to Slack via webhook; logs include event metadata, Slack response status, and errors.
  - **CloudFront partitioner** ([code](../aws/cloudformation/s3PartitionCloudFrontLog.js)): Triggered by S3 `ObjectCreated` events; moves CloudFront objects into partitioned prefixes and deletes originals. Logs each move/delete decision, target partition path, and failures.
  - **Honeybadger notify** ([code](../aws/cloudformation/honeybadgerNotify.js)): Subscribed to an SNS topic; on alarm‑shaped messages, sends a concise Honeybadger notification and logs minimal handler flow and errors. The notification payload goes to Honeybadger, not CloudWatch.
  - **Marketing router** (defined in [function](../aws/cloudformation/cloud_formation_stack.yml.erb#L438-L447) with [policy](../aws/cloudformation/cloud_formation_stack.yml.erb#L459-L476)): Proxies/forwards requests and emits structured JSON via `console.log`; logs include route, status, latency, and correlation/request IDs when present.
  - Common patterns: CloudWatch captures start/end/report lines per invocation, including billed duration and memory; application logs should avoid PII and large payload dumps. Errors automatically generate stack traces in the function’s log stream.

- Security/administration
  - **CloudTrail** records AWS API activity and delivers JSON logs to S3; we expose them in Athena via a [CloudTrail table](../aws/cloudformation/data.yml.erb#L452-L503). Administrative audit trails also live in a dedicated [admin audit log group](../aws/cloudformation/data.yml.erb#L620-L661).

- Observability services (third‑party)
  - **Honeybadger**: Error reporting/alerting from Rails, Lambda handlers, and jobs (e.g., `Honeybadger.notify` uses across the codebase); use it for triage and visualization of exceptions.
  - **New Relic**: APM and browser monitoring via the Ruby agent ([agent config](../cookbooks/cdo-apps/templates/default/newrelic.yml.erb)); use for performance traces and browser RUM, not as the durable store of logs.
  - **Statsig**: Feature flagging/analytics. Where possible, prefer Statsig (or equivalent) for client analytics events over direct Firehose writes.

## Destinations (and durability expectations)

- **S3 `cdo-logs` bucket**
  - App instance logs are synced hourly under `s3://cdo-logs/hosts/<hostname>/<app>` by the [upload process](./app-log-upload.md#L25-L31). Until the next sync runs, logs only exist on the instance. If an instance is terminated or fails before sync and rotation complete, some lines may be lost.
  - ALB access logs land under `s3://cdo-logs/production-codeorg/AWSLogs/<account>/elasticloadbalancing/<region>/...` and are queryable in Athena using the [ALB/ELB schema](../aws/cloudformation/data.yml.erb#L350-L420). These are batch‑delivered by AWS and are generally durable once written to S3.
  - CloudFront access logs arrive under `s3://cdo-logs/cloudfront/<env>-<app>-cdn/` and the partition Lambda rewrites them into `.../year=YYYY/month=MM/day=DD/hour=HH/` partitions that match the [partitioned table](../aws/cloudformation/data.yml.erb#L504-L563). During extreme traffic (e.g., DDoS), the end‑to‑end pipeline is best‑effort and short‑term gaps can occur due to S3 event throttling, Lambda concurrency limits, or retry exhaustion; operationally, these logs are not guaranteed to be 100% complete in peak scenarios.

- **CloudWatch Logs**
  - Browser events are grouped by environment in `<env>-browser-events` using the provisioned [log group and stream](../aws/cloudformation/components/logging.yml.erb#L1-L13). CloudWatch Logs ingestion is durable, but under sustained high volume AWS may throttle puts, which can lead to delayed delivery and rare dropped events at peak.
  - Aurora exports (general/audit/error/slowquery) appear in dedicated log groups via the [log exports](../aws/cloudformation/components/database.yml.erb#L334-L339). These are managed by RDS and are normally reliable once published.
  - Enhanced monitoring metrics originate from the `RDSOSMetrics` stream with [metric filters](../aws/cloudformation/data.yml.erb#L235-L275). If the stream lags, derived metrics may be delayed.
  - Infrastructure Lambdas write execution output by default; during regional throttling or concurrency limits, some short‑term loss is possible.
  - Administrative audit logs live under `/admin/auditlogs` in a dedicated [log group](../aws/cloudformation/data.yml.erb#L620-L661).

- **EC2 instance filesystem**
  - NGINX writes to `/var/log/nginx/access.log` and `/var/log/nginx/error.log` per the [nginx config](../cookbooks/cdo-nginx/templates/default/nginx.conf.erb#L19-L20). These files are local to each instance. Except for the hourly uploader (which targets app logs), nginx logs are not independently replicated and can be lost on sudden termination.
  - Rails application logs live under each app’s `log/` directory and are synced hourly to S3 by the [uploader](../bin/upload-logs-to-s3#L4-L12). Between syncs, they only exist locally; unexpected shutdowns before sync can cause loss.
  - System‑level events are buffered in `/var/log/syslog` via the [rsyslog recipe](../cookbooks/cdo-syslog/recipes/default.rb#L16-L35). This is a fixed‑size rolling buffer; older lines are overwritten.

## Log formats

**For detailed field-by-field documentation, example log entries, and links to official format specifications, see the [Log Formats Reference](./log-formats.md).**

- **CloudFront access logs**: Tab‑separated values with the canonical fields defined in the [Athena schema](../aws/cloudformation/data.yml.erb#L524-L553).
- **ALB access logs**: Space-delimited with quoted fields for request/target/latency, see the [Athena schema](../aws/cloudformation/data.yml.erb#L372-L396).
- **Browser events**: JSON lines published by the server to CloudWatch Logs via the [publisher](../dashboard/app/controllers/browser_events_controller.rb#L21-L27) and [decorator](../dashboard/app/controllers/browser_events_controller.rb#L72-L81).
- **Rails**: In production and staging, we use Lograge with the CEE formatter, which emits Common Event Expression JSON (a structured logging convention often prefixed with `@cee:`) for easier parsing; in adhoc, Rails logs use the standard format (see [production](../dashboard/config/environments/production.rb#L71-L72), [staging](../dashboard/config/environments/staging.rb#L69-L70), [adhoc](../dashboard/config/environments/adhoc.rb#L34)).
- **Syslog/NGINX**: Traditional syslog and nginx formats unless overridden.

## Environments and paths

- **Production**
  - CloudFront prefixes: `production-pegasus-cdn`, `production-dashboard-cdn`, `production-hourofcode-cdn` defined by the [prefixes](../lib/cdo/aws/cloudfront.rb#L41-L63).
  - ALB access logs: `s3://cdo-logs/AWSLogs/<account>/elasticloadbalancing/<region>/...`.
  - Browser events: `production-browser-events` log group created by the [log group](../aws/cloudformation/components/logging.yml.erb#L1-L13).
  - Admin audit logs: `/admin/auditlogs`.
- **Staging/Test/Levelbuilder** follow the same patterns with `<env>` prefixes.
- **Adhoc** uses a stack‑name‑prefixed browser events group and uploads logs per adhoc hostname using the [adhoc variant](../aws/cloudformation/components/logging.yml.erb#L5-L13).

## How to view logs

- **CloudFront access logs**: Browse S3 `s3://cdo-logs/cloudfront/<env>-<app>-cdn/` (partitioned), or query via Athena using the `cloudfront_logs` table defined by the [table](../aws/cloudformation/data.yml.erb#L504-L563).
- **ALB access logs**: Browse S3 `s3://cdo-logs/production-codeorg/AWSLogs/<account>/elasticloadbalancing/<region>/...`, or query via Athena using `elb_logs_us_east_1` in the `elb_logs` DB defined by the [schema](../aws/cloudformation/data.yml.erb#L350-L420).
- **Browser events**: Open the `<env>-browser-events` log group in CloudWatch Logs using the environment’s [log group](../aws/cloudformation/components/logging.yml.erb#L1-L13); entries are JSON.
- **NGINX/Rails app logs**: Check instance files for immediate debugging; for historical view, inspect S3 under `s3://cdo-logs/hosts/<hostname>/<app>` using the [uploader](../bin/upload-logs-to-s3#L4-L12).
- **Database logs**: View Aurora export log groups in CloudWatch; RDSOSMetrics‑derived metrics appear in CloudWatch Metrics based on the [filters](../aws/cloudformation/data.yml.erb#L235-L275).
- **CloudTrail/WAF**: Query via Athena tables for audit and security analysis using the [CloudTrail table](../aws/cloudformation/data.yml.erb#L452-L503) and the [WAF logs table](../aws/cloudformation/data.yml.erb#L662-L715).

## Typical Studio request: what logs are emitted and where to view

When a signed‑in user views a level at `studio.code.org`:

- CloudFront logs the request/response; if the WebACL blocks it, the WAF log records the decision.
- ALB logs the request and target response.
- On the instance, NGINX writes an access line and proxies to the appropriate Puma app; Rails (via Lograge in prod/staging) records a condensed application line. Cron‑triggered tasks that run during the same window write through the same Rails logger, so their events appear alongside web requests.
- Browser‑side events (if enabled) are batched and written to the `<env>-browser-events` CloudWatch log group.
- Aurora emits slow/error/general/audit entries to CloudWatch Logs as relevant.
- Hourly, instance app logs are synced to S3 for long‑term retention.

Read across the sections above to locate each artifact and the linked infrastructure/app code that configures it.

## Observations and recommendations

- Consolidate and standardize structured logging
  - Adopt a single JSON shape across Rails (Lograge), Lambdas, and browser events (include timestamp, level, requestId, userId where applicable, route, status, latency). Add a correlation id propagated from CloudFront through ALB → NGINX → Puma and into background jobs.
- Reduce duplication between layers
  - Today CloudFront, ALB, NGINX, and Rails all log requests. Keep CloudFront and ALB for edge diagnostics and LB health; keep Rails for application context. Down‑sample or retire NGINX access logging as we move to a single Puma service behind ALB.
- Ensure graceful autoscaling termination flushes
  - Add an Auto Scaling terminating lifecycle hook and a pre‑stop script that rotates and uploads Rails and NGINX logs before instance termination. Today we have a [launching lifecycle hook](../aws/cloudformation/components/ami.yml.erb#L241-L251); add the terminating counterpart and invoke the uploader.
- Clarify and bound best‑effort pipelines
  - Document SLOs for CloudFront real‑time/partition path and CloudWatch browser events (expected latency, acceptable loss during peaks). Add monitoring on S3 event backlog and Lambda DLQ to surface gaps.
- Deprecate Firehose for client analytics
  - Migrate front‑end analytics to Statsig (or equivalent), and remove ad‑hoc Firehose writes (`analysis-events`, `i18n-string-tracking-events`) where feasible.
- Environment/account segregation and retention
  - Move each environment’s logs to environment‑specific buckets and accounts, feeding a Control Tower–style Log Archive. Keep short retention in source accounts and long‑term retention/compliance in the central log archive. Publish retention SLOs per destination (CloudFront/ALB S3, CloudWatch groups, app logs in S3).
- Error tooling scope and retention
  - Use Honeybadger for error triage/visualization with a shorter retention window; rely on S3/CloudWatch as the durable store. Use New Relic for APM and RUM, not as a general log sink.
- Cron and background job visibility
  - Tag cron/ActiveJob entries with job class, schedule, and correlation id from triggering request where possible. Ensure their logs are clearly distinguishable from web requests in both CloudWatch and S3 outputs.
- Cost controls
  - Set S3 lifecycle rules on `cdo-logs` prefixes (e.g., transition to Glacier after N days). Consider CloudWatch Logs retention policies per group and enable compression/partitioning discipline.
