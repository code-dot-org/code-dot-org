# Platform Logging Overview

This document inventories logging across the Code.org platform. It explains, in plain English, what emits logs during common operations, where those logs go (S3, CloudWatch, syslog), how they’re formatted, and how to view them across environments. Inline links point to the exact code and templates that configure each behavior.

## Sources that emit logs

### Web/CDN

- **CloudFront standard access logs**: Every request hits CloudFront first. Distribution logging is enabled via [CloudFormation config](../aws/cloudformation/cloud_formation_stack.yml.erb#L414-L419) and per-environment prefixes in [CloudFront helpers](../lib/cdo/aws/cloudfront.rb#L41-L53). CloudFront writes each raw TSV object under `cdo-logs/<env>-<app>-cdn/<distribution>/filename.gz` and immediately raises an S3 `ObjectCreated` event. That event triggers the [partition lambda](../aws/cloudformation/s3PartitionCloudFrontLog.js), which copies the object into `cloudfront/<env>-<app>-cdn/year=/month=/day=/hour=/filename.gz`, updates the [Glue/Athena table](../aws/cloudformation/data.yml.erb#L504-L563), and deletes the source object—leaving the landing prefix effectively empty. Query these records in Athena via table `elb_logs.cloudfront_logs`. WAF decisions (allow/block) are logged separately to a dedicated bucket defined in the [data stack](../aws/cloudformation/data.yml.erb#L662-L715).
- **CloudFront real-time access logs**: In addition to the standard pipeline, the `AccessLogs` stack attaches a [RealtimeLogConfig](../lib/cdo/aws/cloudfront.rb#L301-L314) to every CloudFront behavior. Events stream into Kinesis, Firehose invokes the [AccessLogProcessor lambda](../aws/cloudformation/standalone/access_logs/access_logs.rb#L1-L58) to convert rows to JSON, and the delivery stream [writes Parquet files](../aws/cloudformation/standalone/access_logs/access_logs.yml#L181) to `s3://cdo-access-logs/access-logs/YYYY/MM/DD/HH/`. The [partition helper](../aws/cloudformation/standalone/access_logs/access_logs_partition.rb#L1-L45) keeps the `cdo_access_logs.access_logs` Glue table current so Athena queries stay fast. Query via Athena table `cdo_access_logs.access_logs`.
> **Duplication note**: Both pipelines capture the same CloudFront events. We enabled the real-time path during DDoS investigations to get low-latency insights while retaining the legacy TSV archive, so today we pay for and maintain both.

### Load Balancers

- **ALB access logs**: After CloudFront, requests that reach the Application Load Balancer are logged with full request/target/latency details. Logging is enabled directly on the ALB via [access log attributes](../aws/cloudformation/cloud_formation_stack.yml.erb#L300-L305), and those CSV logs are written to S3 under the standard `AWSLogs/<account>/<region>/elasticloadbalancing/` prefixes. We define an Athena schema so you can query ALB traffic efficiently using the [ELB/ALB Glue/Athena schema](../aws/cloudformation/data.yml.erb#L350-L420).

### Application servers (EC2)

- **NGINX reverse proxy**: On each frontend EC2 instance, NGINX terminates connections from the ALB and proxies to Puma. It writes request and error lines to `/var/log/nginx/access.log` and `/var/log/nginx/error.log` as configured in the [nginx config](../cookbooks/cdo-nginx/templates/default/nginx.conf.erb#L19-L20). Note: once Pegasus is fully retired and Dashboard is the only web app, we can run a single Puma service directly behind the ALB and eliminate NGINX; Puma has access logging and structured logging support, which would also reduce logging duplication.
- **Puma app servers (Dashboard and Pegasus)**: We run two (for now) separate Puma applications behind NGINX. Rails error logs are in JSON/[CEE format](https://cee.mitre.org/about/faqs.html#:~:text=In%20CEE%2C%20the%20taxonomy%20consists,was%20changed%20by%20the%20user.%22) and are condensed via Lograge in [production](../dashboard/config/environments/production.rb#L71-L72) and [staging](../dashboard/config/environments/staging.rb#L69-L70), and standard in [adhoc](../dashboard/config/environments/adhoc.rb#L34). Those Rails logs are written under each app’s `log/` directory and then synced to S3 hourly by our [uploader](./app-log-upload.md).
- **Browser events**: Client‑side code can POST structured events that the server batches and writes to a per‑environment CloudWatch Logs [log group](../aws/cloudformation/components/logging.yml.erb#L1-L13). The server endpoint that receives and publishes these is the [controller entrypoint](../dashboard/app/controllers/browser_events_controller.rb#L4-L13) and [publisher](../dashboard/app/controllers/browser_events_controller.rb#L21-L27).
- **Cron jobs and background tasks**: Many scheduled tasks load the main Rails stack and therefore log exactly like the web app (same formatter and destinations), but on the production daemon instance (or staging or test instances). As with the main puma and rails app logs, an [hourly uploader](../bin/upload-logs-to-s3#L4-L12) syncs local app logs to S3 so operational history is preserved; see the [log upload doc](./app-log-upload.md).
- **Syslog on instances**: System‑level events are written to `/var/log/syslog` by rsyslog, which rotates locally to cap disk usage ([config](../cookbooks/cdo-syslog/recipes/default.rb#L16-L35)). The Amazon CloudWatch Agent continuously tails this file and streams entries to per‑environment CloudWatch log groups (e.g., `production-syslog`) as defined in the agent [attributes](../cookbooks/cdo-cloudwatch-agent/attributes/default.rb#L1-L5) and [config](../cookbooks/cdo-cloudwatch-agent/templates/default/amazon-cloudwatch-agent.json.erb#L72-L76). In practice, rotation protects disk while CloudWatch remains the durable copy.

### Database

- **Aurora MySQL logs**: The cluster exports general, audit, error, and slow query logs to CloudWatch Logs for centralized visibility via the [log exports](../aws/cloudformation/components/database.yml.erb#L334-L339). We also create metric filters for RDS Enhanced Monitoring so OS metrics become first‑class CloudWatch metrics through the [enhanced monitoring filters](../aws/cloudformation/data.yml.erb#L235-L275). For local test coverage, the MySQL cookbooks demonstrate file‑based logging in these [example paths](../cookbooks/cdo-mysql/test/cookbooks/test-mysql/templates/default/mysqld.erb#L3-L8).

### Event pipelines (Firehose)

- **DEPRECATED: Kinesis Data Firehose streams**: Some analytics events were sent directly to delivery streams for batch analysis. Clients exist in both [Ruby](../lib/cdo/firehose.rb#L71-L91) and [JavaScript](../apps/src/metrics/firehose.js#L18-L55). Current streams include `analysis-events` and `i18n-string-tracking-events` ([stream names and policy](../aws/cloudformation/cloud_formation_stack.yml.erb#L195-L197)). Downstream, Firehose delivers JSON payloads to S3/Redshift, optionally via Lambda transforms. Firehose is deprecated and will be removed in a future release.

### Lambdas and supporting infra

- **Slack notifier** ([code](../aws/cloudformation/slackCloudWatchEvent.js)): Receives CloudWatch Events/SNS, posts to Slack via webhook; logs include event metadata, Slack response status, and errors.
- **CloudFront partitioner** ([code](../aws/cloudformation/s3PartitionCloudFrontLog.js)): Triggered by S3 `ObjectCreated` events; moves CloudFront objects into partitioned prefixes and deletes originals. Logs each move/delete decision, target partition path, and failures.
- **Honeybadger notify** ([code](../aws/cloudformation/honeybadgerNotify.js)): Subscribed to an SNS topic; on alarm‑shaped messages, sends a concise Honeybadger notification and logs minimal handler flow and errors. The notification payload goes to Honeybadger, not CloudWatch.
- **Marketing router** (defined in [function](../aws/cloudformation/cloud_formation_stack.yml.erb#L438-L447): Proxies/forwards requests and emits structured JSON via `console.log`; logs include route, status, latency, and correlation/request IDs when present.
- Common patterns: CloudWatch captures start/end/report lines per invocation, including billed duration and memory;

### Security/administration

- **CloudTrail** records AWS API activity and delivers JSON logs to S3; we expose them in Athena via a [CloudTrail table](../aws/cloudformation/data.yml.erb#L452-L503). Administrative SSM audit trails also live in a dedicated [admin audit log group](../aws/cloudformation/data.yml.erb#L620-L661).

### Observability services (third‑party)

- **[Honeybadger](../lib/cdo/honeybadger.rb)**: Honeybadger reports back‑end errors in [Rails](../dashboard/app/controllers/application_controller.rb#L386-L388) and in CLI/cron jobs via specialized stdout/stderr capture [helpers](../lib/cdo/honeybadger.rb#L27-L74), and forwards infrastructure alerts through a CloudWatch→SNS [Lambda](../aws/cloudformation/honeybadgerNotify.js#L4-L24) defined in the [alerting template](../aws/cloudformation/alerting.yml.erb#L21-L41).
- **[New Relic](../cookbooks/cdo-apps/templates/default/newrelic.yml.erb)**: New Relic provides back‑end Application Performance Monitoring (APM) and records server‑side custom metrics such as the [Files API](../dashboard/legacy/middleware/files_api.rb#L90-L106), and it captures errors/exceptions in the [studio front‑end](../apps/src/logToCloud.js#L31-L41) and the [marketing front‑end](../frontend/apps/marketing/src/providers/newrelic/NewRelicLoader.tsx#L6-L13).
- **Statsig**: This is used for feature flagging/analytics for [marketing site](../frontend/apps/marketing/src/providers/statsig/client.ts), studio [front‑end](../apps/webpackEntryPoints.js), and [back‑end](../dashboard/lib/metrics/events.rb). Where possible, prefer Statsig (or equivalent) for client analytics events over direct Firehose writes.

## Destinations (and durability expectations)

### S3 `cdo-logs` bucket

- **App instance logs** (plain‑text [format](./log-formats.md#syslog-format)): App instance logs are synced hourly under `s3://cdo-logs/hosts/<hostname>/<app>` by the [upload process](./app-log-upload.md#L25-L31). Until the next sync runs, logs only exist on the instance. If an instance is terminated or fails before sync and rotation complete, some lines may be lost.
  - Hostname prefixes: in staging and test, and on `production-daemon` and `production-console`, `<hostname>` is simply the box hostname and uploads appear at `hosts/<hostname>/<app>`.
  - Production web frontends: instances cloned from the latest AMI builder upload under a shared prefix `hosts/ami-<builder-instance-id>/<app>` (the builder is a stopped EC2 instance; clear the "running" filter to find it). 
  - **DATA LOSS NOTE**: Because all frontends get the same `hostname` and the file names are simple date-based (e.g., `puma_stderr.log-YYYYMMDD.gz`), the hourly sync causes last-writer-wins overwrites. _As even instances not in the pool (with no traffic) still also overwrite, most logs in here all-but empty (80 bytes - 30kb), this means we essentially lose 99.9% of these logs for long-term retention._
- **ALB access logs** (space‑delimited [format](./log-formats.md#application-load-balancer-alb-logs)): Load balancer logs are written to `s3://cdo-logs/<stack-name>-alb-access-logs/AWSLogs/<account>/elasticloadbalancing/<region>/YYYY/MM/DD/`. Queryable in Athena using the [ALB/ELB schema](../aws/cloudformation/data.yml.erb#L350-L420).
- **CloudFront access logs** (TSV [format](./log-formats.md#cloudfront-access-logs)): initially land under `s3://cdo-logs/cloudfront/<env>-<app>-cdn/` and are rewritten by the partition Lambda to `s3://cdo-logs/cloudfront/<env>-<app>-cdn/year=YYYY/month=MM/day=DD/hour=HH/<ID>.YYYY-MM-DD-HH.<hash>.gz`, matching the [Athena table](../aws/cloudformation/data.yml.erb#L504-L563). During extreme traffic (e.g., DDoS), the end‑to‑end pipeline is best‑effort and short‑term gaps can occur due to S3 event throttling, Lambda concurrency limits, or retry exhaustion; operationally, these logs are not guaranteed to be 100% complete in peak scenarios.

### CloudWatch Logs

- **Browser events** (JSON [format](./log-formats.md#cloudwatch-logs-browser-events)): grouped by environment in `<env>-browser-events` using the provisioned [log group and stream](../aws/cloudformation/components/logging.yml.erb#L1-L13). CloudWatch Logs ingestion is durable, but under sustained high volume AWS may throttle puts, which can lead to delayed delivery and rare dropped events at peak.
- **Aurora MySQL exports** (RDS log exports [format](./log-formats.md#cloudwatch-logs-browser-events)): general/audit/error/slowquery appear in dedicated log groups via the [log exports](../aws/cloudformation/components/database.yml.erb#L334-L339). These are managed by RDS and are normally reliable once published.
- **Enhanced monitoring metrics** ([metrics/filters](../aws/cloudformation/data.yml.erb#L235-L275)): originate from the `RDSOSMetrics` stream with metric filters; if the stream lags, derived metrics may be delayed.
- **Lambda execution logs** (JSON [format](./log-formats.md#cloudwatch-logs-browser-events)): functions write execution output by default; during regional throttling or concurrency limits, some short‑term loss is possible.
- **Administrative audit logs** ([CloudWatch log group](../aws/cloudformation/data.yml.erb#L620-L661)): live under `/admin/auditlogs`.

### EC2 instance filesystem

- NGINX writes to `/var/log/nginx/access.log` and `/var/log/nginx/error.log` per the [nginx config](../cookbooks/cdo-nginx/templates/default/nginx.conf.erb#L19-L20). These files are local to each instance. Except for the hourly uploader (which targets app logs), nginx logs are not independently replicated are lost on each instance termination.
- Rails application logs live under each app’s `log/` directory and are synced hourly to S3 by the [uploader](../bin/upload-logs-to-s3#L4-L12) and end up in S3; see above "App Instance Logs".
- System‑level events are written to `/var/log/syslog` via the [rsyslog recipe](../cookbooks/cdo-syslog/recipes/default.rb#L16-L35) and rotate locally to bound disk usage; the CloudWatch Agent tails this file continuously and streams entries to CloudWatch, which is the durable copy.

## Log formats

**For detailed field-by-field documentation, example log 
entries, and links to official format specifications, see the 
[Log Formats Reference](./log-formats.md).**

## Typical Studio page view: what logs are emitted and where to view

First, the browser requests the document page for a level:

- CloudFront [logs](#webcdn) the request/response; if the WebACL blocks it, the WAF log records the decision.
- ALB [logs](#load-balancers) the request and target response.
- On the instance, NGINX [writes](#application-servers-ec2) an access line and proxies to Puma; Rails (via Lograge in prod/staging) [emits](#application-servers-ec2) a condensed JSON line to syslog/CloudWatch for the controller action rendering the level page.
- Database queries executed are included in the Rails Lograge timings; some types of DB activity may also [emit](#cloudwatch-logs) to Aurora’s CloudWatch export groups (slow/error/general/audit).
- Any server‑side exceptions during page render [notify](#observability-services-thirdparty) Honeybadger.

Secondly, while the user is on the page (in addition to the above):

- Browser‑side interaction events are batched and [written](#cloudwatch-logs) to the `<env>-browser-events` CloudWatch log group; the page may also [report](#observability-services-thirdparty) New Relic page actions/errors.
- Client analytics may [log](#observability-services-thirdparty) to Statsig (back‑end via server SDK; front‑end via app code) and [log](#event-pipelines-firehose) to Firehose (deprecated).
- Background jobs (e.g., ActiveJob) kicked off from user actions [log](#application-servers-ec2) via the same Rails logger and appear in syslog/CloudWatch.
- Hourly, instance app logs are [synced](#s3-cdo-logs-bucket) to S3 for long‑term retention.

## Observations and recommendations

- Consolidate and standardize structured logging
  - Adopt a single JSON shape across Rails (Lograge), Lambdas, and browser events (include timestamp, level, requestId, userId where applicable, route, status, latency). Add a correlation id propagated from CloudFront through ALB → NGINX → Puma and into background jobs.
- Reduce duplication between layers
  - CloudFront logging: Standard TSV uploads and the real-time Parquet pipeline both record every request. Decide whether to keep real-time for fast DDoS triage or fall back to the legacy archive, but stop paying for both.
  - General Request Logging: CloudFront, ALB, NGINX, and Rails all log requests. Maybe we keep CloudFront; keep Rails for application context.
  - Errors: Rails/syslog, Honeybadger, and New Relic all capture the same failures. Treat Honeybadger as the alerting source; keep Rails/syslog for raw detail;
  - Front‑end telemetry: New Relic Browser, Browser Events, Firehose, and Statsig all track user behavior. Maybe favor New Relic for JS errors; favor Statsig for experiments and analytics.
  - Database visibility: Rails Lograge timings and Aurora exports full audit/slow/general/error logs to CloudWatch. Maybe one can be retired.
- Ensure graceful autoscaling termination flushes hourly-synced logs to S3.
  - This would assure no logs are lost on instance termination of scale-down or production code deploys.
- Complete Deprecation and removal of Firehose for client analytics
- Environment/account segregation and retention
  - Move each environment’s logs to environment‑specific buckets and accounts, feeding a Control Tower–style Log Archive.
- Cron and background job visibility
  - Tag cron/ActiveJob entries with job class, schedule, and correlation id from triggering request where possible. Ensure their logs are clearly distinguishable from web requests in both CloudWatch and S3 outputs.
- Cost controls
  - Set S3 lifecycle rules on `cdo-logs` prefixes.
  - Potentially aggregate old logs into single larger files ( so they are above the critical threshold of 8kb making Glacier actually cost-effective).  Then sel lifecycle rules to transition to Glacier.
