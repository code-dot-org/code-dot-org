# Log Formats Reference

This document details the specific log formats used across the Code.org platform, including field definitions, example log entries, and links to official format documentation.

## Table of Contents

- [CloudFront Standard Access Logs (non-real-time)](#cloudfront-standard-access-logs-non-real-time)
- [CloudFront Real-Time Access Logs (Parquet)](#cloudfront-real-time-access-logs-parquet)
- [Application Load Balancer (ALB) Logs](#application-load-balancer-alb-logs)
- [Rails Application Logs (CloudWatch Logs/Lograge CEE JSON)](#rails-application-logs-cloudwatch-logslograge-cee-json)
- [NGINX Access Logs](#nginx-access-logs)
- [NGINX Error Logs](#nginx-error-logs)
- [Browser Events (CloudWatch Logs)](#browser-events-cloudwatch)
- [Aurora MySQL Logs (CloudWatch Logs)](#aurora-mysql-logs-cloudwatch-logs)
- [RDS Enhanced Monitoring (CloudWatch Logs)](#rds-enhanced-monitoring-cloudwatch-logs)
- [Lambda Execution Logs (CloudWatch Logs)](#lambda-execution-logs-cloudwatch-logs)
- [CloudTrail Logs](#cloudtrail-logs)
- [Admin/Audit Logs (CloudWatch Logs)](#adminaudit-logs-cloudwatch-logs)
- [ProxySQL Logs (CloudWatch Logs)](#proxysql-logs-cloudwatch-logs)
- [Kinesis Firehose Events](#kinesis-firehose-events)

---

## CloudFront Standard Access Logs (non-real-time)

**Format:** Tab-Separated Values (TSV)  
**Official Documentation:** [AWS CloudFront Access Logs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html)

CloudFront writes access logs for every request received by the CDN, regardless of whether it was served from cache or forwarded to the origin. Logs are delivered to S3 (bucket: `cdo-logs`) under per-environment prefixes and then partitioned by a Lambda function into `year=/month=/day=/hour=` folders for Athena querying. Query these records in Athena via table `elb_logs.cloudfront_logs` (database `elb_logs`).

### Example Log Entries

**Cache Hit:**
```
2025-10-29	23:04:19	SYD3-P3	534	208.127.115.39	GET	aaaabbbbccccdddd.cloudfront.net	/assets/js/images/toggleSummaryInactivewp68f831113447582d7d79.png	200	https://studio.code.org/courses/dance-ai-2023/units/1?viewAs=Instructor	Mozilla/5.0%20(X11;%20CrOS%20x86_64%2014541.0.0)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/140.0.0.0%20Safari/537.36	-	-	Hit	xtJZo1nd2Lu3bSZSihuBZmRdZGGv0N2PYshQIzbiThCsH9AkSTN4Bw==	studio.code.org	https	139	0.001	-	TLSv1.3	TLS_AES_128_GCM_SHA256	Hit	HTTP/2.0	-	-	15188	0.001	Hit	image/png	168	-	-
```

**Cache Miss (Origin Fetch):** (shows the `#Version/#Fields` header CloudFront prepends)
```
#Version: 1.0
#Fields: date time x-edge-location sc-bytes c-ip cs-method cs(Host) cs-uri-stem sc-status cs(Referer) cs(User-Agent) cs-uri-query cs(Cookie) x-edge-result-type x-edge-request-id x-host-header cs-protocol cs-bytes time-taken x-forwarded-for ssl-protocol ssl-cipher x-edge-response-result-type cs-protocol-version fle-status fle-encrypted-fields c-port time-to-first-byte x-edge-detailed-result-type sc-content-type sc-content-len sc-range-start sc-range-end
2025-10-29	23:04:14	BNE50-P2	1953	110.145.217.98	POST	aaaabbbbccccdddd.cloudfront.net	/browser_events/put_metric_data	200	https://studio.code.org/courses/music-jam-2024/units/1/lessons/1/levels/17	Mozilla/5.0%20(X11;%20CrOS%20x86_64%2014541.0.0)%20AppleWebKit/537.36%20(KHTML,%20like%20Gecko)%20Chrome/140.0.0.0%20Safari/537.36	-	-	Miss	mGNFm_LKNPzcbHOHuG5ASx_G68PyTNzaTr_S7Y37lR8tnLf_ieZ4CQ==	studio.code.org	https	3234	0.253	-	TLSv1.3	TLS_AES_128_GCM_SHA256	Miss	HTTP/2.0	-	-	38308	0.253	Miss	application/json;%20charset=utf-8	2	-	-
```

**WAF Block:**
```
2025-10-29	17:32:45	JFK50-C3	0	192.0.2.15	GET	aaaabbbbccccdddd.cloudfront.net	/admin/users	403	-	BadBot/1.0	-	Error	zX8yW7vU6tS5rQ4pO3nM2lK1jI0hG9fE8dC7bA6zA5y=	studio.code.org	https	0	0.000	-	TLSv1.2	TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256	Error	HTTP/1.1	WAFBlock	-	0	0.000	Error	-	0	0.000
```

### Fields

CloudFront logs contain 40+ fields (varies by version). Key fields include:

- `date` — Date of request (YYYY-MM-DD)
- `time` — Time of request (HH:MM:SS, UTC)
- `x-edge-location` — Edge location that served the request (e.g., IAD89-C1)
- `sc-bytes` — Bytes sent to client (includes headers)
- `c-ip` — Client IP address
- `cs-method` — HTTP method (GET, POST, etc.)
- `cs(Host)` — Host header from client request
- `cs-uri-stem` — URI path requested
- `sc-status` — HTTP status code returned to client
- `cs(Referer)` — Referer header
- `cs(User-Agent)` — User-Agent header (URL-encoded)
- `cs-uri-query` — Query string (URL-encoded, or `-` if none)
- `cs(Cookie)` — Cookie header (or `-` if none)
- `x-edge-result-type` — Result type: `Hit`, `RefreshHit`, `Miss`, `LimitExceeded`, `CapacityExceeded`, `Error`, `Redirect`
- `x-edge-request-id` — Unique request identifier
- `x-host-header` — Value used for origin Host header
- `cs-protocol` — Protocol: `http`, `https`, `ws`, `wss`
- `cs-bytes` — Bytes received from client (includes headers)
- `time-taken` — Time in seconds from receipt to final byte sent
- `x-forwarded-for` — X-Forwarded-For header (or `-` if none)
- `ssl-protocol` — SSL/TLS protocol (e.g., TLSv1.3, or `-` for HTTP)
- `ssl-cipher` — SSL/TLS cipher suite
- `x-edge-response-result-type` — Response result after processing: `Hit`, `Miss`, `Error`, etc.
- `cs-protocol-version` — HTTP version used by client
- `fle-status` — Field-level encryption status (or `-` if not used)
- `fle-encrypted-fields` — Encrypted field count (or `-`)
- `c-port` — Client port number
- `time-to-first-byte` — Time in seconds until first byte sent
- `x-edge-detailed-result-type` — Detailed result (e.g., `Hit`, `Miss`, `AbortedOrigin`, `Error`, `WAFBlock`)
- `sc-content-type` — Content-Type response header (or `-`)
- `sc-content-len` — Content-Length response header (or `-`)
- `sc-range-start` — Byte range start (or `-`)
- `sc-range-end` — Byte range end (or `-`)

**Note:** Fields are tab-separated. A `-` (hyphen) indicates no value. Certain fields (User-Agent, URI query, cookies) are URL-encoded.

> **Duplication note:** The real-time pipeline described below captures the same CloudFront events but stores them in Parquet for faster querying

---

## CloudFront Real-Time Access Logs (Parquet)

**Format:** AWS Kinesis Data Firehose → JSON rows converted to Parquet (`snappy`) partitioned by `YYYY/MM/DD/HH`  
**Official Documentation:** [CloudFront Real-Time Logs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/real-time-logs.html)

CloudFront real-time logging is enabled via a `RealtimeLogConfig` that streams request data to Kinesis, transforms each row into JSON, and the serializer writes the result in Parquet/Hive SerDe structure inside `s3://cdo-access-logs/access-logs/`. The schema matches the `LOG_FIELDS` list configured in the access-log stack, and is exposed in Athena as table `cdo_access_logs.access_logs` (database `cdo_access_logs`).

### Example Record (JSON prior to Parquet serialization)

```json
{
  "timestamp": "2025-10-29T17:30:15.123Z",
  "c-ip": "203.0.113.42",
  "time-to-first-byte": 0.001,
  "sc-status": 200,
  "sc-bytes": 142,
  "cs-method": "GET",
  "cs-protocol": "https",
  "cs-host": "studio.code.org",
  "cs-uri-stem": "/s/course1/lessons/2/levels/3",
  "cs-bytes": 512,
  "x-edge-location": "IAD89-C1",
  "x-edge-request-id": "xY9kL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4",
  "x-host-header": "studio.code.org",
  "time-taken": 0.006,
  "cs-protocol-version": "HTTP/2.0",
  "c-ip-version": "IPv4",
  "cs-user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/118.0.0.0",
  "cs-referer": "https://studio.code.org/home",
  "cs-cookie": "-",
  "cs-uri-query": "level_id=12345",
  "x-edge-response-result-type": "Hit",
  "x-forwarded-for": "203.0.113.42",
  "ssl-protocol": "TLSv1.3",
  "ssl-cipher": "TLS_AES_128_GCM_SHA256",
  "x-edge-result-type": "Hit",
  "fle-encrypted-fields": 0,
  "fle-status": "-",
  "sc-content-type": "text/html",
  "sc-content-len": 789,
  "sc-range-start": 0,
  "sc-range-end": 0,
  "c-port": 54321,
  "x-edge-detailed-result-type": "Hit",
  "c-country": "US",
  "cs-accept-encoding": "gzip, deflate, br",
  "cs-accept": "text/html",
  "cache-behavior-path-pattern": "/s/*",
  "cs-headers": "Authorization:****;Accept-Language:en-US",
  "cs-header-names": "authorization;accept-language",
  "cs-headers-count": 12
}
```

### Fields

Fields are defined by the comma-delimited `LOG_FIELDS` parameter in the access logs CloudFormation stack and mirror the CloudFront real-time log field list. Notable fields (subset shown above):

- `timestamp` — ISO 8601 timestamp with millisecond precision
- `c-ip` — Client IP address
- `time-to-first-byte` — Seconds until the first byte was sent
- `sc-status` — HTTP status returned to the viewer
- `cs-method`, `cs-host`, `cs-uri-stem`, `cs-uri-query` — Request details
- `x-edge-location`, `x-edge-request-id` — Edge POP and unique request ID
- `x-edge-result-type`, `x-edge-response-result-type`, `time-taken` — Edge processing outcome and latency
- `ssl-protocol`, `ssl-cipher` — TLS protocol and cipher
- `cache-behavior-path-pattern` — Behavior that matched the request
- `cs-headers`, `cs-header-names`, `cs-headers-count` — Header metadata supplied by CloudFront real-time logs


> **Duplication note:** Both CloudFront formats represent the same events. Keep the Parquet dataset for low-latency analytics and consider pruning the TSV archive (or vice versa) if cost becomes an issue.

---

## Application Load Balancer (ALB) Logs

**Format:** Space-delimited with quoted fields  
**Official Documentation:** [AWS ALB Access Logs](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html)

The Application Load Balancer writes logs for every HTTP/HTTPS request it receives. Logs are written directly to S3 at `s3://cdo-logs/<stack-name>-alb-access-logs/AWSLogs/<account>/elasticloadbalancing/<region>/YYYY/MM/DD/`. Query these records in Athena via table `elb_logs.prod_dashboard_alb`.

**CodeProjects ALB:** The codeprojects.org Application Load Balancer (manually configured) writes logs to `s3://cdo-logs/codeprojects-elb/AWSLogs/475661607190/elasticloadbalancing/us-east-1/YYYY/MM/DD/`. These logs are discovered by a Glue crawler and exposed in Athena as table `elb_logs.codeprojects_alb` (partitioned by `year/month/day`). The format is identical to the main dashboard ALB logs described above.

### Example Log Entries

**Successful Request:**
```
http 2025-10-29T17:35:12.456789Z app/production-codeorg/a1b2c3d4e5f6g7h8 203.0.113.55:54321 10.0.1.23:80 0.001 0.042 0.000 200 200 1234 5678 "GET https://studio.code.org:443/s/course3/lessons/2/levels/1 HTTP/1.1" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" ECDHE-RSA-AES128-GCM-SHA256 TLSv1.2 arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/production-dashboard/abc123def456 "Root=1-6547a2b8-1234567890abcdef" "studio.code.org" "arn:aws:acm:us-east-1:123456789012:certificate/cert-id" 0 2025-10-29T17:35:12.413000Z "forward" "-" "-" "10.0.1.23:80" "200" "-" "-"
```

**Target Timeout (504):**
```
http 2025-10-29T17:36:45.123456Z app/production-codeorg/a1b2c3d4e5f6g7h8 198.51.100.101:49876 10.0.2.15:80 0.000 60.001 0.000 504 - 345 0 "POST https://studio.code.org:443/api/v1/projects/save HTTP/1.1" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" ECDHE-RSA-AES128-GCM-SHA256 TLSv1.3 arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/production-dashboard/abc123def456 "Root=1-6547a3f2-abcdef1234567890" "studio.code.org" "arn:aws:acm:us-east-1:123456789012:certificate/cert-id" 0 2025-10-29T17:36:45.122000Z "forward" "-" "-" "10.0.2.15:80" "504" "-" "-"
```

### Fields

- `type` — Protocol type: `http`, `https`, `h2`, `grpcs`, `ws`, `wss`
- `time` — ISO 8601 timestamp when load balancer generated response
- `elb` — Resource ID of the load balancer
- `client:port` — Client IP and port
- `target:port` — Target (backend server) IP and port, or `-` if request not routed
- `request_processing_time` — Seconds from request receipt to sending to target
- `target_processing_time` — Seconds from sending to target until start of response, or `-1` for failures
- `response_processing_time` — Seconds from receiving target response to sending to client
- `elb_status_code` — HTTP status code returned by the load balancer
- `target_status_code` — HTTP status code from target, or `-` if connection failed
- `received_bytes` — Request size in bytes (includes headers)
- `sent_bytes` — Response size in bytes (includes headers)
- `"request"` — Quoted string: `"method uri protocol"` (e.g., `"GET https://example.com:443/path HTTP/1.1"`)
- `"user_agent"` — Quoted User-Agent string
- `ssl_cipher` — SSL cipher suite, or `-` for HTTP
- `ssl_protocol` — SSL/TLS protocol, or `-` for HTTP
- `target_group_arn` — ARN of the target group
- `"trace_id"` — Quoted X-Amzn-Trace-Id header value
- `"domain_name"` — Quoted SNI hostname from client hello, or `-`
- `"chosen_cert_arn"` — Quoted ARN of certificate presented to client
- `matched_rule_priority` — Priority of matching listener rule, or `0` for default
- `request_creation_time` — ISO 8601 timestamp when load balancer received request
- `"actions_executed"` — Quoted comma-separated list of actions (e.g., `"forward"`, `"redirect"`)
- `"redirect_url"` — Quoted redirect URL if action was redirect, else `-`
- `"error_reason"` — Quoted error reason (e.g., `"TargetTimeout"`, `"TargetFailure"`, `"LambdaInvalidResponse"`)
- `"target:port_list"` — Quoted space-separated list of targets that received request
- `"target_status_code_list"` — Quoted space-separated list of status codes from targets
- `"classification"` — Classification of request (e.g., `"Normal"`, `"DesyncMitigation"`)
- `"classification_reason"` — Quoted reason for classification

**Note:** Fields are space-delimited; values with spaces (request line, User-Agent, etc.) are enclosed in double quotes.


---

## Rails Application Logs (CloudWatch Logs/lograge CEE JSON)

**Format:** CEE-enhanced JSON (Common Event Expression)  
**Library:** [Lograge](https://github.com/roidrage/lograge) with CEE formatter  

Rails application logs (Dashboard and Pegasus via Puma) are written to `/var/log/syslog` in JSON format using the Lograge gem with a CEE (Common Event Expression) prefix. The Amazon CloudWatch Agent tails this file and ships entries to the `<env>-syslog` CloudWatch Logs group (for production: `production-syslog`).

### Example Log Entries

**Successful Web Request (INFO):**
```json
Oct 30 16:35:40 ip-100-0-255-122 dashboard[2143738]: Rendered ActiveModel::Serializer::Null with Hash (0.06ms)
Oct 30 16:35:40 ip-100-0-255-122 dashboard[2143738]: @cee: {"method":"GET","path":"/api/v1/users/current/permissions","format":"*/*","controller":"Api::V1::UsersController","action":"get_current_permissions","status":200,"duration":26.01,"view":0.5,"db":5.4}
```

**API Request with Parameters (INFO):**
```json
Oct 30 16:35:40 ip-100-0-255-122 dashboard[2142172]: @cee: {"method":"POST","path":"/user_level_interactions","format":"*/*","controller":"UserLevelInteractionsController","action":"create","status":201,"duration":73.82,"view":0.46,"db":7.58}
```

**Not Found (404):**
```json
Oct 30 16:43:16 ip-100-0-255-122 dashboard[2114079]: @cee: {"method":"GET","path":"/user_preference/theme","format":"json","controller":"UserPreferencesController","action":"theme","status":404,"duration":28.87,"view":0.43,"db":8.47}
```

**Redirect (302):**
```json
Oct 30 16:43:22 ip-100-0-255-122 dashboard[2127182]: @cee: {"method":"GET","path":"/","format":"html","controller":"HomeController","action":"index","status":302,"duration":93.55,"view":0.0,"db":60.68,"location":"https://studio.code.org/courses/csd3-virtual/un>
```

**Bad Request (400):**
```json
Oct 30 16:43:21 ip-100-0-255-122 dashboard[2140562]: @cee: {"method":"POST","path":"/user_level_interactions","format":"*/*","controller":"UserLevelInteractionsController","action":"create","status":400,"duration":78.22,"view":0.4,"db":5.98}
```

### Fields

Rails Lograge logs typically include the core keys shown in the examples above:

- `method` — HTTP method (GET, POST, etc.)
- `path` — Request path
- `format` — Response format (html, json, `*/*`, etc.)
- `controller` — Rails controller name
- `action` — Controller action name
- `status` — HTTP status code
- `duration` — Total request duration in milliseconds
- `view` — View rendering time in milliseconds
- `db` — Database query time in milliseconds
- `user_id` - The ID of the current logged in user (optional)
- `admin_id` - Present if this is an admin assuming this user's identity

Depending on the route and Lograge hooks, optional keys may also appear—for example `ip`, `user_id`, `params`, `request_id`, `timestamp`, `location` (for redirects), or error metadata like `error` and `exception`.

**Note:** The `@cee:` prefix is followed by a space and then the JSON object. Rails still emits unstructured lines (for example, `Rendered ...`) immediately before the JSON; parsers should filter for lines beginning with `@cee:` when extracting structured entries.

#### Other syslog lines you will see

The same `/var/log/syslog` stream also captures operating-system activity. Typical examples include cron jobs, SSH and SSM session notices, and sudo elevation events. These lack the `@cee:` prefix but are viewable in the same CloudWatch log group.

```
Oct 30 17:56:01 ip-10-0-1-23 CRON[12345]: (root) CMD (cd /home/ubuntu/production/current && bundle exec rake cron:hourly RAILS_ENV=production)
Oct 30 17:56:30 ip-10-0-1-23 sshd[23456]: Accepted publickey for ubuntu from 203.0.113.100 port 54321 ssh2: RSA SHA256:abcdefghijklmnop1234567890
Oct 30 18:04:11 ip-10-0-1-23 sudo:   ubuntu : TTY=pts/0 ; PWD=/home/ubuntu ; USER=root ; COMMAND=/bin/systemctl status nginx
```

### Useful Queries/Patterns

Get the top 50 most frequent 500 errors by controller and action:
```
parse @message "@cee: *" as payload
| filter ispresent(payload)
| parse payload /"controller":"(?<controller>[^"]+)".*"action":"(?<action>[^"]+)".*"status":(?<status>\d+)/
| filter status >= 500
| stats count() as err by controller, action, status
| sort err desc
| limit 50
```

Get the 95th percentile and average duration of requests by controller and action:
```
parse @message "@cee: *" as payload
| filter ispresent(payload)
| parse payload /"controller":"(?<controller>[^"]+)".*"action":"(?<action>[^"]+)".*"duration":(?<duration>[\d.]+)/
| stats pct(duration, 95) as p95_ms, avg(duration) as avg_ms, count() as count by controller, action
| sort p95_ms desc
| limit 20
```

Get the top 200 slowest requests to a given endpoint:
```
parse @message "@cee: *" as payload
| filter ispresent(payload)
| parse payload /"path":"(?<path>[^"]+)".*"status":(?<status>\d+).*"duration":(?<duration>[\d.]+)/
| filter path = "/api/v1/users/current" and duration > 300
| sort duration desc
| limit 200
```

Find actions performed by an admin user, while using "Assume Identity" as another user:
```
fields @timestamp, @message, @logStream, @log
| parse @message /"user_id"\s*:\s*(?<user_id>\d+)/
| parse @message /"admin_id"\s*:\s*(?<admin_id>\d+)/
| filter ispresent(admin_id)
| sort @timestamp desc
| limit 30
```

Find Admin-only actions like deleting a user, granting a role, or starting an "Assume Identity" session:
```
fields @timestamp, @message, @logStream, @log
| parse @message '"namespace":"*"' as namespace
| filter namespace = "admin"
| sort @timestamp desc
| limit 30
```

Find recent cron executions on an app server:
```
fields @timestamp, @message
| filter @message like /CRON\[/
| sort @timestamp desc
| limit 50
```

Find interactive SSH or SSM logins:
```
fields @timestamp, @message
| filter @message like /sshd/ and @message like /Accepted/
| sort @timestamp desc
| limit 50
```

Find some former Firehose logs that were switched to CloudWatch:
```
fields @timestamp, @message 
| filter @message like /"study":"project-data-integrity"/
| sort @timestamp desc
| limit 50
```

## NGINX Access Logs

**Format:** Combined Log Format (CLF variant)  
**Official Documentation:** [NGINX Log Module](https://nginx.org/en/docs/http/ngx_http_log_module.html)

NGINX sits in front of both Puma applications and proxies requests to the appropriate backend (Dashboard or Pegasus). Access logs use the default "combined" format.

### Example Log Entries

```
100.0.255.150 - - [30/Oct/2025:00:38:40 +0000] "GET /user_preference/theme HTTP/1.1" 401 49 "-" "Amazon CloudFront"
100.0.255.190 - - [30/Oct/2025:00:38:40 +0000] "POST /milestone/13069999/159999/10999?course_id=673 HTTP/1.1" 200 358 "-" "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
```

### Fields

The combined log format includes:

- `remote_addr` — Client IP address, usually the incoming IP address from CloudFront
- `remote_user` — HTTP authenticated username, or `-` if none
- `time_local` — Local time in format `[DD/Mon/YYYY:HH:MM:SS +ZZZZ]`
- `request` — Full request line: `"METHOD URI PROTOCOL"`
- `status` — HTTP status code
- `body_bytes_sent` — Response body size in bytes (excludes headers)
- `http_referer` — Referer header, or `-` if none
- `http_user_agent` — User-Agent header

**Note:** NGINX logs are written to `/var/log/nginx/access.log` on each EC2 instance and are NOT uploaded anywhere for durable storage.


---

## NGINX Error Logs

**Format:** NGINX error log format  
**Official Documentation:** [NGINX Core Module](https://nginx.org/en/docs/ngx_core_module.html#error_log)

In practice on production servers, there actually are essentially no entries in these logs. They are nearly 100% empty all the time.

---

## Browser Events (CloudWatch)

**Format:** JSON  
**Official Documentation:** [CloudWatch Logs Concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html)

Browser-side events (analytics, errors, user interactions) are sent from the client to the Rails backend, which then writes them to CloudWatch Logs as JSON.

### Example Log Entries

**Warning Event:**
```csv
2025-10-30T17:35:50.956Z,"{""level"":""WARNING"",""message"":{""message"":""updateHighlightedBlocks called before workspace initialized."",""currentLevelId"":64666,""scriptId"":70999,""channelId"":""aaaabbbb_ccccdddd"",""appName"":""music""},""deviceInfo"":{""user_agent"":""Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15"",""window_width"":1180,""window_height"":702,""hostname"":""studio.code.org"",""full_path"":""https://studio.code.org/courses/music-jam-2024/units/1/lessons/1/levels/3""},""release"":""abbf7953cccddd""}",111122223334444:production-browser-events,production
```

**Info Event:**
```csv
2025-10-30T17:36:02.172Z,"{""level"":""INFO"",""message"":{""event"":""InitialSoundsLoaded"",""soundsLoaded"":0,""loadTimeMs"":2,""currentLevelId"":78702,""scriptId"":847821,""channelId"":""aaaabbbb_ccccdddd"",""appName"":""music""},""deviceInfo"":{""user_agent"":""Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"",""window_width"":958,""window_height"":944,""hostname"":""studio.code.org"",""full_path"":""https://studio.code.org/courses/express-2025/units/1/lessons/3/levels/13""},""userId"":132999888777,""release"":""abbf7953cccddd""}",111122223334444:production-browser-events,production
```

### Fields

Browser event logs are flexible and include:

- `level` — Event level (INFO, WARNING, ERROR, etc.)
- `message` — Event message (e.g., "InitialSoundsLoaded", "updateHighlightedBlocks called before workspace initialized.")
   - `event` — Event type (e.g., "InitialSoundsLoaded", "updateHighlightedBlocks called before workspace initialized.")
   - `appName` — Application name
   - Various event-specific fields (e.g., `soundsLoaded`, `loadTimeMs`, `currentLevelId`, `scriptId`, `channelId`, etc.)
- `deviceInfo` — Device information (user agent, window width, window height, hostname, full path)
   - `user_agent` — User agent
   - `window_width` — Window width
   - `window_height` — Window height
   - `hostname` — Hostname
   - `full_path` — Full path
- `userId` — User ID if known
- `release` — Release version

### Useful Queries/Patterns

Parse the log message into structured fields:
```
fields @timestamp
| parse @message /"level":"(?<level>[^"]+)"/
| parse @message /"message":\{"event":"(?<event>[^"]+)"/
| parse @message /"message":\{"message":"(?<msg>[^"]+)"/
| parse @message /"currentLevelId":(?<levelId>\d+)/
| parse @message /"scriptId":(?<scriptId>\d+)/
| parse @message /"channelId":"(?<channelId>[^"]+)"/
| parse @message /"loadTimeMs":(?<loadTimeMs>\d+)/
| parse @message /"soundsLoaded":(?<soundsLoaded>\d+)/
| parse @message /"userId":(?<userId>\d+)/
| parse @message /"hostname":"(?<host>[^"]+)"/
| parse @message /"full_path":"(?<path>[^"]+)"/
| sort @timestamp desc
| limit 200
```

Get the top 50 most frequent errors or warnings:
```
parse @message /"level":"(?<level>[^"]+)"/
| filter level in ["ERROR","WARNING"]
| parse @message /"message":\{"message":"(?<msg>[^"]+)"/
| stats count() as cnt by level, msg
| sort cnt desc
| limit 50
```

Get the top 30 slowest page loads by course, unit, and lesson:
```
parse @message /"full_path":"https:\/\/studio\.code\.org\/courses\/(?<course>[^\/]+)\/units\/(?<unit>\d+)\/lessons\/(?<lesson>\d+)\/levels\/(?<level>[^"?]+)/
| parse @message /"loadTimeMs":(?<ms>\d+)/
| stats pct(ms,95) as p95_ms, avg(ms) as avg_ms, count() as n by course, unit, lesson
| sort p95_ms desc
| limit 30
```

Get the number of unique users by event:
```
parse @message /"userId":(?<userId>\d+)/
| filter ispresent(userId)
| stats count_distinct(userId) as users, count(*) as events
```

---

## Aurora MySQL Logs (CloudWatch Logs)

**Format:** Plain text (MySQL general/audit/error/slowquery formats)

Aurora is configured to export the `general`, `audit`, `error`, and `slowquery` streams to CloudWatch Logs. Each export appears under a log group named `/aws/rds/cluster/<stack-name>-cluster/<log-type>` (for example, `/aws/rds/cluster/production-cluster/slowquery`). Entries follow the native MySQL formats so you can copy documentation straight from upstream tooling.

### Example Log Entries

**Error log:**
```
2025-10-31T16:09:25.034021Z 2025180 [Note] [MY-013730] [Server] 'wait_timeout' period of 10 seconds was exceeded for `rdsadmin`@`localhost`. The idle time since last command was too long. (net_serv.cc:1550)
2025-10-31T16:09:25.034090Z 2025180 [Note] [MY-010914] [Server] Aborted connection 2025180 to db: 'unconnected' user: 'rdsadmin' host: 'localhost' (The client was disconnected by the server because of inactivity.). (sql_connect.cc:842)
```

**Slow query log:**
```
/aws/rds/cluster/production-cluster/slowquery:# Time: 2025-10-30T19:07:45.812345Z
# User@Host: dashboard[dashboard] @ 10.0.6.81 []  Id: 87654321
# Query_time: 4.235302  Lock_time: 0.000221 Rows_sent: 200 Rows_examined: 92651
SET timestamp=1730315265;
SELECT * FROM user_levels WHERE script_id = 12345 ORDER BY updated_at DESC LIMIT 200;
```

---

## RDS Enhanced Monitoring (CloudWatch Logs)

**Format:** JSON per-sample OS metrics

Enhanced Monitoring publishes one JSON document per collection interval to the `RDSOSMetrics` log group. Each document contains CPU, memory, disk, file I/O, and process metrics collected from the Aurora host.

---

## Lambda Execution Logs (CloudWatch Logs)

**Format:** Plain text (START/END/REPORT records)

Each Lambda invocation writes three standard lines to the `/aws/lambda/<function-name>` log group: `START`, the function's own output (if any), and `END`/`REPORT`. The REPORT line captures billed duration, memory usage, cold-start information, and request IDs, which makes it ideal for runtime and cost investigations.

### Example Log Entry

```
START RequestId: e6daeb73-ff96-4e81-869a-19a9fd5827cf Version: $LATEST
END RequestId: e6daeb73-ff96-4e81-869a-19a9fd5827cf
REPORT RequestId: e6daeb73-ff96-4e81-869a-19a9fd5827cf	Duration: 64.37 ms	Billed Duration: 65 ms	Memory Size: 1024 MB	Max Memory Used: 178 MB
```

### Fields

- `RequestId` — Unique identifier for the invocation.
- `Version` — Published version or `$LATEST` alias that ran.
- `Duration` — Wall-clock execution time in milliseconds.
- `Billed Duration` — Duration rounded up to the nearest millisecond billing unit.
- `Memory Size` — Configured memory allocation for the function.
- `Max Memory Used` — Peak runtime memory consumption; a good indicator of tuning needs.
- Optional keys (when applicable): `Init Duration` for cold starts, `XRAY TraceId`, `Used`/`Remaining` concurrency metrics.

### Useful Queries/Patterns

Find the most expensive invocations:
```
fields @timestamp, @logStream, @message
| filter @log like /\/aws\/lambda\//
| filter @message like /REPORT/
| parse @message "Duration: * ms" as duration
| parse @message "Max Memory Used: * MB" as max_mem
| stats max(to_number(duration)) as max_duration_ms, avg(to_number(duration)) as avg_duration_ms, max(to_number(max_mem)) as max_memory_mb by @logStream
| sort max_duration_ms desc
| limit 20
```

Detect cold starts:
```
fields @timestamp, @message
| filter @log like /\/aws\/lambda\//
| filter @message like /REPORT/ and @message like /Init Duration/
| parse @message "Init Duration: * ms" as init_ms
| sort @timestamp desc
| limit 50
```

---

## CloudTrail Logs

**Format:** JSON (CloudTrail event schema)  
**Location:** `s3://cdo-logs/AWSLogs/475661607190/CloudTrail/us-east-1`  
**Athena Table:** `cdo.cloudtrail_logs` (projection on `datedir`)

CloudTrail captures API activity across the AWS account, including console, CLI, SDK, and service operations. AWS delivers gzipped JSON objects partitioned by `YYYY/MM/DD`; Athena queries them via external table `cdo.cloudtrail_logs`, which uses partition projection and the CloudTrail SerDe so new dates do not require manual partition operations.

### Useful Queries/Patterns

List the most recent console logins with MFA:
```
SELECT eventtime, json_extract_scalar(additionaleventdata,'$.MFAUsed') AS mfa_used, sourceipaddress, useridentity
FROM cdo.cloudtrail_logs
WHERE eventsource = 'signin.amazonaws.com'
  AND eventname = 'ConsoleLogin'
  AND datedir >= date_format(date_add('day', -10, current_date), '%Y/%m/%d')
ORDER BY eventtime DESC
LIMIT 1000;
```

Track IAM configuration changes over the last 7 days:
```
SELECT eventtime, useridentity.arn, eventname, requestparameters
FROM cdo.cloudtrail_logs
WHERE eventsource = 'iam.amazonaws.com'
  AND datedir >= date_format(date_add('day', -10, current_date), '%Y/%m/%d')
ORDER BY eventtime DESC;
```

Detect root account activity:
```
SELECT eventtime, eventsource, eventname, sourceipaddress
FROM cdo.cloudtrail_logs
WHERE useridentity.type = 'Root'
ORDER BY eventtime DESC
LIMIT 25;
```

CloudTrail delivery is managed by AWS; short delays can occur during regional incidents, but logs are retained indefinitely in S3. There are currently no lifecycle policies pruning historical data, so records dating back to 2021 remain queryable.

---

## Admin/Audit Logs (CloudWatch Logs)

**Format:** Plain text

Admin/audit logs are written to CloudWatch Logs as plain text for SSM sessions.

### Useful Queries/Patterns

Show all SSM sessions by user:
```
fields @timestamp, @logStream
| parse @logStream /(?<email>[^\/-]+@[^\/-]+)/ 
| stats count() as entries by bin(@timestamp, 1d) as day, email
| sort day desc, entries desc
```

---

## ProxySQL Logs (CloudWatch Logs)

**Format:** Plain text  
**Official Documentation:** [ProxySQL Error Log](https://github.com/sysown/proxysql/wiki/Global-variables#errorlog)

ProxySQL writes error and connection logs to `/var/lib/proxysql/proxysql.log` on EC2 instances. The CloudWatch Agent tails this file and streams entries to the `<env>-proxysql` CloudWatch Logs group (e.g., `production-proxysql`). The log is configured via the ProxySQL [configuration template](../cookbooks/cdo-mysql/templates/default/proxysql.cnf.erb#L20) and CloudWatch agent setup in the [proxy recipe](../cookbooks/cdo-mysql/recipes/proxy.rb#L124).

ProxySQL is a connection pooler that sits between Rails and Aurora MySQL, handling read/write splitting and connection management. The error log captures connection failures, query errors, health check issues, and administrative operations.

### Example Log Entries

**Connection Error:**
```
2025-10-29 23:15:42 [WARNING] Connection failure to (127.0.0.1:3306): error 2003 (Can't connect to MySQL server)
```

**Query Error:**
```
2025-10-29 23:16:15 [ERROR] Query failed: SELECT * FROM invalid_table (Error: Table 'dashboard.invalid_table' doesn't exist)
```

**Health Check Failure:**
```
2025-10-29 23:17:33 [WARNING] Monitor failed to connect to server: (mysql-host:3306) (Error: Connection timeout)
```

**Server Status Change:**
```
2025-10-29 23:18:01 [INFO] Server status changed: mysql-read-replica:3306 (status: ONLINE -> SHUNNED, reason: Replication lag)
```

### Fields

ProxySQL logs are plain text with timestamp prefixes. Common patterns include:

- **Timestamp**: `YYYY-MM-DD HH:MM:SS` at the start of each line
- **Severity**: `[INFO]`, `[WARNING]`, `[ERROR]` tags
- **Message type**: Connection errors, query failures, health check results, server status changes
- **Server identifiers**: Hostname:port tuples for backend MySQL servers
- **Error details**: MySQL error codes and descriptive messages

### Useful Queries/Patterns

**Find connection failures:**
```
fields @timestamp, @message
| filter @message like /Connection failure/
| sort @timestamp desc
```

**Find query errors:**
```
fields @timestamp, @message
| filter @message like /Query failed/ or @message like /ERROR.*SELECT/
| sort @timestamp desc
```

**Monitor server status changes:**
```
fields @timestamp, @message
| filter @message like /Server status changed/
| parse @message /Server status changed: (?<server>[^:]+:[0-9]+)/
| stats count() by bin(@timestamp, 5m) as time, server
```

**Check for health check failures:**
```
fields @timestamp, @message
| filter @message like /Monitor failed/
| parse @message /Monitor failed to connect to server: (?<server>[^)]+)/
| stats count() by bin(@timestamp, 1h) as hour, server
```

---

## Kinesis Firehose Events

**Format:** JSON (client-defined)  
**Official Documentation:** [Kinesis Data Firehose](https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html)

**Note:** This pipeline is deprecated and should be replaced with Statsig for client-side analytics.

Client-side JavaScript sends analytics events directly to Kinesis Firehose streams (`analysis-events`, `i18n-string-tracking-events`) using AWS SDK credentials embedded in the client code. Events are delivered to S3 and optionally to Redshift for analysis.

### Example Log Entries

**Analysis Event:**
```json
{"event_type":"puzzle_attempt","level_id":12345,"user_id":98765,"result":"success","attempt_number":3,"timestamp":"2025-10-29T18:00:12.456Z","session_id":"xyz789"}
```

**I18n String Tracking:**
```json
{"event_type":"i18n_missing_string","string_key":"dashboard.home.welcome","locale":"es-MX","page":"/","timestamp":"2025-10-29T18:01:22.789Z"}
```

### Fields

Firehose events are client-defined and typically include:

- `event_type` — Type of analytics event
- `timestamp` — ISO 8601 timestamp (client-side, may not be UTC)
- `user_id` — User ID if known
- `session_id` — Session identifier
- Additional event-specific fields

**Delivery:** Firehose buffers events (up to 1 MB or 60 seconds) before writing to S3. At high volumes or during throttling, events may be dropped (best-effort delivery).

**Security Note:** This approach exposes AWS credentials in client code and should be replaced with server-side event collection or a managed analytics service like Statsig.

---

## Summary Table

| Log Type | Format | Destination | Retention | Official Docs |
|----------|--------|-------------|-----------|---------------|
| CloudFront Standard Access | TSV | S3 `cdo-logs/cloudfront/` | Indefinite (partitioned) | [AWS CloudFront Logs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html) |
| CloudFront Real-Time Access | Parquet | S3 `cdo-access-logs/access-logs/` | Intelligent Tiering → Deep Archive | [CloudFront Real-Time Logs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/real-time-logs.html) |
| ALB Access | Space-delimited | S3 `cdo-logs/<stack>-alb-access-logs/AWSLogs/.../elasticloadbalancing/` | Indefinite | [AWS ALB Logs](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html) |
| Rails (Lograge CEE) | JSON | CloudWatch Logs `<env>-syslog` | Indefinite (CloudWatch retention) | [Lograge](https://github.com/roidrage/lograge) |
| NGINX Access | Combined CLF | Local filesystem only | Local rotation (~7 days) | [NGINX Logging](https://nginx.org/en/docs/http/ngx_http_log_module.html) |
| NGINX Error | NGINX error format | Local filesystem only | Local rotation (~7 days) | [NGINX Error Log](https://nginx.org/en/docs/ngx_core_module.html#error_log) |
| Browser Events | JSON | CloudWatch Logs `<env>-browser-events` | Indefinite | [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/) |
| Aurora MySQL Logs | Plain text | CloudWatch Logs `/aws/rds/cluster/<cluster>/<log>` | Indefinite | [Aurora MySQL Logging](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/USER_LogAccess.MySQL.html) |
| RDS Enhanced Monitoring | JSON | CloudWatch Logs `RDSOSMetrics` | Indefinite | [RDS Enhanced Monitoring](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Monitoring.OS.html) |
| Lambda Execution | Plain text | CloudWatch Logs `/aws/lambda/<function>` | Indefinite | [AWS Lambda Logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs.html) |
| Admin/Audit | Plain text | CloudWatch Logs `/admin/auditlogs` | Indefinite | [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-logging.html) |
| ProxySQL | Plain text | CloudWatch Logs `<env>-proxysql` | Indefinite | [ProxySQL Error Log](https://github.com/sysown/proxysql/wiki/Global-variables#errorlog) |
| Firehose (deprecated) | JSON | S3 → Redshift | Varies | [Kinesis Firehose](https://docs.aws.amazon.com/firehose/latest/dev/) |

---

## See Also

- [Main Logging Documentation](./logging.md) — Overview of all logging sources and destinations
- [App Log Upload Process](./app-log-upload.md) — Details on hourly log uploads from EC2 to S3

