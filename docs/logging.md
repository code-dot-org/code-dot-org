# Platform Logging Overview

This document inventories logging across the Code.org platform. It explains, in plain English, what emits logs during common operations, where those logs go (S3, CloudWatch, syslog), how they’re formatted, and how to view them across environments. Inline links point to the exact code and templates that configure each behavior.

## Table of Contents

- [Sources that emit logs](#sources-that-emit-logs)
  - [Web/CDN](#webcdn)
  - [Load Balancers](#load-balancers)
  - [Application servers (EC2)](#application-servers-ec2)
  - [Database](#database)
  - [Event pipelines (Firehose)](#event-pipelines-firehose)
  - [Lambdas and supporting infra](#lambdas-and-supporting-infra)
  - [Security/administration](#securityadministration)
  - [Observability services (third-party)](#observability-services-third-party)
- [Destinations (and durability expectations)](#destinations-and-durability-expectations)
  - [S3 `cdo-logs` bucket](#s3-cdo-logs-bucket)
  - [S3 `cdo-access-logs` bucket](#s3-cdo-access-logs-bucket)
  - [CloudWatch Logs](#cloudwatch-logs)
  - [EC2 instance filesystem](#ec2-instance-filesystem)
- [Log formats](#log-formats)
- [Typical Studio page view: what logs are emitted and where to view](#typical-studio-page-view-what-logs-are-emitted-and-where-to-view)
- [Observations and recommendations](#observations-and-recommendations)
- [Summary table](#summary-table)

## Sources that emit logs

### Web/CDN

- **CloudFront standard access logs**: Every request hits CloudFront first. Distribution logging is enabled via [CloudFormation config](../aws/cloudformation/cloud_formation_stack.yml.erb#L414-L419) and per-environment prefixes in [CloudFront helpers](../lib/cdo/aws/cloudfront.rb#L41-L53). CloudFront writes each raw TSV object under `cdo-logs/<env>-<app>-cdn/<distribution>/filename.gz` and immediately raises an S3 `ObjectCreated` event. That event triggers the [partition lambda](../aws/cloudformation/s3PartitionCloudFrontLog.js), which copies the object into `cloudfront/<env>-<app>-cdn/year=/month=/day=/hour=/filename.gz`, updates the [Glue/Athena table](../aws/cloudformation/data.yml.erb#L504-L563), and deletes the source object—leaving the landing prefix effectively empty. Query these records in Athena via table `elb_logs.cloudfront_logs`. WAF decisions (allow/block) are logged separately to a dedicated bucket defined in the [data stack](../aws/cloudformation/data.yml.erb#L662-L715).
- **CloudFront real-time access logs**: In addition to the standard pipeline, the `AccessLogs` stack attaches a [RealtimeLogConfig](../lib/cdo/aws/cloudfront.rb#L301-L314) to every CloudFront behavior. Events stream into Kinesis, Firehose invokes the [AccessLogProcessor lambda](../aws/cloudformation/standalone/access_logs/access_logs.rb#L1-L58) to convert rows to JSON, and the delivery stream [writes Parquet files](../aws/cloudformation/standalone/access_logs/access_logs.yml#L181) to `s3://cdo-access-logs/access-logs/YYYY/MM/DD/HH/`. The [partition helper](../aws/cloudformation/standalone/access_logs/access_logs_partition.rb#L1-L45) keeps the `cdo_access_logs.access_logs` Glue table current so Athena queries stay fast. Query via Athena table `cdo_access_logs.access_logs`.
> **Duplication note**: Both pipelines capture the same CloudFront events. We enabled the real-time path during DDoS investigations to get low-latency insights while retaining the legacy TSV archive, so today we pay for and maintain both.

### Load Balancers

- **ALB access logs**: After CloudFront, requests that reach the Application Load Balancer are logged with full request/target/latency details. Logging is enabled directly on the ALB via [access log attributes](../aws/cloudformation/cloud_formation_stack.yml.erb#L300-L305), and those CSV logs are written to S3 under the standard `AWSLogs/<account>/<region>/elasticloadbalancing/` prefixes. We define an Athena schema so you can query ALB traffic efficiently using the [ELB/ALB Glue/Athena schema](../aws/cloudformation/data.yml.erb#L350-L420).
- **CodeProjects ALB access logs**: The codeprojects.org Application Load Balancer (manually configured, not in infrastructure-as-code) writes logs to `s3://cdo-logs/codeprojects-elb/AWSLogs/475661607190/elasticloadbalancing/us-east-1/`. A Glue crawler discovers these logs and exposes them in Athena as table `elb_logs.codeprojects_alb` (partitioned by `year/month/day`). Format is the same space-delimited ALB format as the main dashboard ALB logs.

### Application servers (EC2)

- **EC2: Rails HTTP logging and instance syslog stream (Lograge → syslog/CloudWatch)**: Each Puma process emits condensed CEE JSON lines via Lograge in [production](../dashboard/config/environments/production.rb#L71-L72), [staging](../dashboard/config/environments/staging.rb#L69-L70), and [adhoc](../dashboard/config/environments/adhoc.rb#L33-L37). These lines are written to `/var/log/syslog`, which also receives system‑level events (ssh, sudo, cron, package updates) from rsyslog. rsyslog bounds disk usage ([config](../cookbooks/cdo-syslog/recipes/default.rb#L16-L35)), and the CloudWatch Agent tails this file and streams everything to the `<env>-syslog` log group (e.g., `production-syslog`), giving operators a single place to browse OS and Rails entries together. See [format details](./log-formats.md#rails-application-logs-cloudwatch-logslograge-cee-json).
- **EC2: Rails stdout/stderr files (Puma)**: Rails also writes unstructured `puma_stdout.log` / `puma_stderr.log` (under each app's `log/` directory). These files retain framework chatter, stack traces, startup banners, and any output from libraries that bypass the Rails logger. They remain local until the hourly [S3 uploader](./app-log-upload.md) syncs `dashboard/log/` and `pegasus/log/`.
- **EC2: Rails milestone.log**: The dashboard app writes milestone events (e.g., line-of-code completion) to `dashboard/log/milestone.log`. These files are synced hourly to S3 by the [uploader](../bin/upload-logs-to-s3#L4-L12) along with other app logs. **Note: We plan to phase out milestone.log in favor of more structured analytics events.**
- **EC2: NGINX reverse proxy**: On each frontend EC2 instance, NGINX terminates connections from the ALB and proxies to Puma. It writes request and error lines to `/var/log/nginx/access.log` and `/var/log/nginx/error.log` as configured in the [nginx config](../cookbooks/cdo-nginx/templates/default/nginx.conf.erb#L19-L20). Once Pegasus is retired, we can run a single Puma service directly behind the ALB and eliminate NGINX entirely.
- **EC2: ProxySQL logs**: ProxySQL (database connection pooler) writes to `/var/lib/proxysql/proxysql.log` and is streamed to CloudWatch Logs as `<env>-proxysql` (e.g., `production-proxysql`) via the CloudWatch agent ([config](../cookbooks/cdo-mysql/recipes/proxy.rb#L124)).
- **EC2: Cron jobs and background tasks**: Many scheduled tasks load the main Rails stack and therefore log exactly like the web app (same formatter and destinations), but on the production daemon instance (or staging or test instances). As with the web traffic, the [hourly uploader](../bin/upload-logs-to-s3#L4-L12) syncs their app log directories to S3; see the [log upload doc](./app-log-upload.md).
- **Browser events**: Client‑side code can POST structured events that the server batches and writes to a per‑environment CloudWatch Logs [log group](../aws/cloudformation/components/logging.yml.erb#L1-L13). The server endpoint that receives and publishes these is the [controller entrypoint](../dashboard/app/controllers/browser_events_controller.rb#L4-L13) and [publisher](../dashboard/app/controllers/browser_events_controller.rb#L21-L27).

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

### Observability services (third-party)

- **[Honeybadger](../lib/cdo/honeybadger.rb)**: Honeybadger reports back‑end errors in [Rails](../dashboard/app/controllers/application_controller.rb#L386-L388) and in CLI/cron jobs via specialized stdout/stderr capture [helpers](../lib/cdo/honeybadger.rb#L27-L74), and forwards infrastructure alerts through a CloudWatch→SNS [Lambda](../aws/cloudformation/honeybadgerNotify.js#L4-L24) defined in the [alerting template](../aws/cloudformation/alerting.yml.erb#L21-L41).
- **[New Relic](../cookbooks/cdo-apps/templates/default/newrelic.yml.erb)**: New Relic provides back‑end Application Performance Monitoring (APM) and records server‑side custom metrics such as the [Files API](../dashboard/legacy/middleware/files_api.rb#L90-L106), and it captures errors/exceptions in the [studio front‑end](../apps/src/logToCloud.js#L31-L41) and the [marketing front‑end](../frontend/apps/marketing/src/providers/newrelic/NewRelicLoader.tsx#L6-L13).
- **Statsig**: This is used for feature flagging/analytics for [marketing site](../frontend/apps/marketing/src/providers/statsig/client.ts), studio [front‑end](../apps/webpackEntryPoints.js), and [back‑end](../dashboard/lib/metrics/events.rb). Where possible, prefer Statsig (or equivalent) for client analytics events over direct Firehose writes.

## Destinations (and durability expectations)

### S3 `cdo-logs` bucket

- **`hosts/` Rails stdout/stderr files (Puma)** (plain‑text stdout/stderr plus rotated JSON): Hourly sync drops the contents of `dashboard/log/` and `pegasus/log/` under `s3://cdo-logs/hosts/<hostname>/<app>` via the [upload process](./app-log-upload.md#L25-L31). That directory includes `puma_stdout.log*`, `puma_stderr.log*`, `milestone.log*`, job logs, and any rotated copies. Until the next sync runs, these files exist only on the instance; if a host terminates early, the last hour of stdout/stderr is lost.
  - Hostname prefixes: in staging and test, and on `production-daemon` and `production-console`, `<hostname>` is simply the box hostname and uploads appear at `hosts/<hostname>/<app>`.
  - Production web frontends: instances cloned from the latest AMI builder upload under a shared prefix `hosts/ami-<builder-instance-id>/<app>` (the builder is a stopped EC2 instance; clear the "running" filter to find it). 
  - **DATA LOSS NOTE**: Because all frontends get the same `hostname` and the file names are simple date-based (e.g., `puma_stderr.log-YYYYMMDD.gz`), the hourly sync causes last-writer-wins overwrites. _As even instances not in the pool (with no traffic) still also overwrite, most logs in here all-but empty (80 bytes - 30kb), this means we essentially lose 99.9% of these logs for long-term retention._
- **`<stack-name>-alb-access-logs/` ALB access logs** (space‑delimited [format](./log-formats.md#application-load-balancer-alb-logs)): Load balancer logs are written to `s3://cdo-logs/<stack-name>-alb-access-logs/AWSLogs/<account>/elasticloadbalancing/<region>/YYYY/MM/DD/`. Queryable in Athena using the [ALB/ELB schema](../aws/cloudformation/data.yml.erb#L350-L420).
- **`codeprojects-elb/` CodeProjects ALB access logs** (space‑delimited [format](./log-formats.md#application-load-balancer-alb-logs)): The codeprojects.org ALB (manually configured) writes logs to `s3://cdo-logs/codeprojects-elb/AWSLogs/475661607190/elasticloadbalancing/us-east-1/YYYY/MM/DD/`. Queryable in Athena via table `elb_logs.codeprojects_alb` (discovered by Glue crawler `codeprojects_alb_logs`).
- **`cloudfront/<env>-<app>-cdn/` CloudFront access logs** (TSV [format](./log-formats.md#cloudfront-standard-access-logs-non-real-time)): initially land under `s3://cdo-logs/cloudfront/<env>-<app>-cdn/` and are rewritten by the partition Lambda to `s3://cdo-logs/cloudfront/<env>-<app>-cdn/year=YYYY/month=MM/day=DD/hour=HH/<ID>.YYYY-MM-DD-HH.<hash>.gz`, matching the [Athena table](../aws/cloudformation/data.yml.erb#L504-L563). During extreme traffic (e.g., DDoS), the end‑to‑end pipeline is best‑effort and short‑term gaps can occur due to S3 event throttling, Lambda concurrency limits, or retry exhaustion; operationally, these logs are not guaranteed to be 100% complete in peak scenarios.
- **`AWSLogs/` CloudTrail logs** (JSON [format](./log-formats.md#cloudtrail-logs)): AWS delivers API activity here and can be queried in Athena  under `cdo.cloudtrail_logs`.

### S3 `cdo-access-logs` bucket

- **`access-logs/` CloudFront access logs** (Parquet [format](./log-formats.md#cloudfront-real-time-access-logs-parquet)): initially land under `s3://cdo-access-logs/access-logs/YYYY/MM/DD/HH/`. The [partition helper](../aws/cloudformation/standalone/access_logs/access_logs_partition.rb#L1-L45) keeps the `cdo_access_logs.access_logs` Glue table current so Athena queries stay fast. Query via Athena table `cdo_access_logs.access_logs`.

### CloudWatch Logs

- **EC2: Rails/syslog stream** (CEE JSON [format](./log-formats.md#rails-application-logs-cloudwatch-logslograge-cee-json)): The CloudWatch agent tails `/var/log/syslog` and publishes to `<env>-syslog`. This stream combines Lograge request lines with system notices (cron, ssh, sudo), so Insights queries can pivot across both.
- **EC2: ProxySQL logs** (plain-text [format](./log-formats.md#proxysql-logs-cloudwatch-logs)): Streamed to `<env>-proxysql` (e.g., `production-proxysql`) via the CloudWatch agent.
- **Browser events** (JSON [format](./log-formats.md#browser-events-cloudwatch)): grouped by environment in `<env>-browser-events` using the provisioned [log group and stream](../aws/cloudformation/components/logging.yml.erb#L1-L13). CloudWatch Logs ingestion is durable, but under sustained high volume AWS may throttle puts, which can lead to delayed delivery and rare dropped events at peak.
- **Aurora MySQL exports** (plain-text [format](./log-formats.md#aurora-mysql-logs-cloudwatch-logs)): general/audit/error/slowquery appear in dedicated log groups via the [log exports](../aws/cloudformation/components/database.yml.erb#L334-L339). These are managed by RDS and are normally reliable once published.
- **Enhanced monitoring metrics** (JSON [format](./log-formats.md#rds-enhanced-monitoring-cloudwatch-logs)): originate from the `RDSOSMetrics` stream with metric filters; if the stream lags, derived metrics may be delayed.
- **Lambda execution logs** (plain-text [format](./log-formats.md#lambda-execution-logs-cloudwatch-logs)): functions write execution output by default; during regional throttling or concurrency limits, some short‑term loss is possible.
- **Administrative audit logs** (plain-text [format](./log-formats.md#adminaudit-logs-cloudwatch-logs)): live under `/admin/auditlogs`.

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
- On the instance, NGINX [writes](#application-servers-ec2) an access line and proxies to Puma; Rails (via Lograge in prod/staging) [emits](#application-servers-ec2) a condensed JSON line to `/var/log/syslog` (the same syslog stream that receives system events), which is tailed by the CloudWatch agent and streamed to `<env>-syslog` for the controller action rendering the level page.
- Database queries executed are included in the Rails Lograge timings; some types of DB activity may also [emit](#cloudwatch-logs) to Aurora’s CloudWatch export groups (slow/error/general/audit).
- Any server‑side exceptions during page render [notify](#observability-services-thirdparty) Honeybadger.

Secondly, while the user is on the page (in addition to the above):

- Browser‑side interaction events are batched and [written](#cloudwatch-logs) to the `<env>-browser-events` CloudWatch log group; the page may also [report](#observability-services-thirdparty) New Relic page actions/errors.
- Client analytics may [log](#observability-services-thirdparty) to Statsig (back‑end via server SDK; front‑end via app code) and [log](#event-pipelines-firehose) to Firehose (deprecated).
- Background jobs (e.g., ActiveJob) kicked off from user actions [log](#application-servers-ec2) via the same Rails logger and appear in the same `<env>-syslog` CloudWatch log group.
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

## Summary table

| Log source | Primary destination (short) | Retention | Known gaps / notes |
|------------|-----------------------------|-----------|--------------------|
| CloudFront standard access logs | S3 `cdo-logs/cloudfront/...` | Indefinite | Occasional gaps during DDoS or partition Lambda throttling |
| CloudFront real-time access logs | S3 `cdo-access-logs/access-logs/` | Indefinite | Firehose retries but best-effort; Kinesis backpressure can drop rows |
| ALB access logs | S3 `cdo-logs/<stack>-alb-access-logs/...` | Indefinite | - |
| CodeProjects ALB access logs | S3 `cdo-logs/codeprojects-elb/...` | Indefinite | Manually configured ALB; discovered by Glue crawler |
| EC2: Rails Lograge request logs + instance syslog | CloudWatch `<env>-syslog` | Indefinite | - |
| EC2: Cron jobs and background tasks | CloudWatch `<env>-syslog` | Indefinite | - |
| EC2: Rails stdout/stderr (Puma) | S3 `cdo-logs/hosts/<hostname>/...` | Indefinite | ~99% loss, due to overwrites shared host prefix |
| EC2: Rails milestone.log | S3 `cdo-logs/hosts/<hostname>/...` | Indefinite | ~99% loss, due to overwrites shared host prefixPlan |
| EC2: NGINX access/error logs | Instance filesystem | none, lost on termination | not retained |
| EC2: ProxySQL logs | CloudWatch `<env>-proxysql` | Indefinite | - |
| Browser events | CloudWatch `<env>-browser-events` | Indefinite | Subject to CloudWatch throttle; high burst can drop batches |
| Aurora MySQL exports | CloudWatch `/aws/rds/cluster/...` | Indefinite | - |
| RDS enhanced monitoring | CloudWatch `RDSOSMetrics` | Indefinite | - |
| Lambda execution logs | CloudWatch `/aws/lambda/<function>` | Indefinite | - |
| CloudTrail | S3 `cdo-logs/AWSLogs/.../CloudTrail/` | Indefinite | - |
| Administrative audit logs | CloudWatch `/admin/auditlogs` | Indefinite | - |
| Kinesis Firehose (deprecated) | Redshift `analysis.events` table | Indefinite | Public client can inject bad payloads causing batch failures; pipeline deprecated |
| Statsig | Replicated to RedShift `analytics.dim_statsig_events` table | 3-4 months | - |
