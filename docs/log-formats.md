# Log Formats Reference

This document details the specific log formats used across the Code.org platform, including field definitions, example log entries, and links to official format documentation.

## Table of Contents

- [CloudFront Access Logs](#cloudfront-access-logs)
- [CloudFront Real-Time Access Logs (Parquet)](#cloudfront-real-time-access-logs-parquet)
- [Application Load Balancer (ALB) Logs](#application-load-balancer-alb-logs)
- [Rails Application Logs (Lograge CEE JSON)](#rails-application-logs-lograge-cee-json)
- [NGINX Access Logs](#nginx-access-logs)
- [NGINX Error Logs](#nginx-error-logs)
- [CloudWatch Logs (Browser Events)](#cloudwatch-logs-browser-events)
- [Syslog Format](#syslog-format)
- [Kinesis Firehose Events](#kinesis-firehose-events)

---

## CloudFront Access Logs

**Format:** Tab-Separated Values (TSV)  
**Official Documentation:** [AWS CloudFront Access Logs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html)

CloudFront writes access logs for every request received by the CDN, regardless of whether it was served from cache or forwarded to the origin. Logs are delivered to S3 (bucket: `cdo-logs`) under per-environment prefixes and then partitioned by a Lambda function into `year=/month=/day=/hour=` folders for Athena querying.

### Example Log Entries

**Cache Hit:**
```
2025-10-29	17:30:15	IAD89-C1	4523	203.0.113.42	GET	d3qj0f3vkqkfl3.cloudfront.net	/blockly/js/en_us/common_locale.js	200	https://studio.code.org/s/course1	Mozilla/5.0%20(Windows%20NT%2010.0;%20Win64;%20x64)%20Chrome/118.0.0.0	-	Hit	xY9kL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5m=	studio.code.org	https	142	0.001	-	TLSv1.3	TLS_AES_128_GCM_SHA256	Hit	HTTP/2.0	-	-	54321	0.001	Hit	application/javascript	789	0.000
```

**Cache Miss (Origin Fetch):**
```
2025-10-29	17:31:22	SFO5-C2	8234	198.51.100.89	GET	d3qj0f3vkqkfl3.cloudfront.net	/api/v1/user_progress	200	https://studio.code.org/s/course2	Mozilla/5.0%20(Macintosh;%20Intel%20Mac%20OS%20X%2010_15_7)	session_id=abc123	Miss	aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5e=	studio.code.org	https	523	0.089	203.0.113.10	TLSv1.3	TLS_AES_256_GCM_SHA384	Miss	HTTP/2.0	-	-	12345	0.088	Miss	application/json	1024	0.082
```

**WAF Block:**
```
2025-10-29	17:32:45	JFK50-C3	0	192.0.2.15	GET	d3qj0f3vkqkfl3.cloudfront.net	/admin/users	403	-	BadBot/1.0	-	Error	zX8yW7vU6tS5rQ4pO3nM2lK1jI0hG9fE8dC7bA6zA5y=	studio.code.org	https	0	0.000	-	TLSv1.2	TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256	Error	HTTP/1.1	WAFBlock	-	0	0.000	Error	-	0	0.000
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

**Configuration:** [../lib/cdo/aws/cloudfront.rb#L41-L53](../lib/cdo/aws/cloudfront.rb#L41-L53), [../aws/cloudformation/cloud_formation_stack.yml.erb#L414-L419](../aws/cloudformation/cloud_formation_stack.yml.erb#L414-L419), [../aws/cloudformation/s3PartitionCloudFrontLog.js](../aws/cloudformation/s3PartitionCloudFrontLog.js)

> **Duplication note:** The real-time pipeline described below captures the same CloudFront events but stores them in Parquet for faster querying; the TSV archive remains useful as the raw, minimally processed record.

---

## CloudFront Real-Time Access Logs (Parquet)

**Format:** AWS Kinesis Data Firehose → JSON rows converted to Parquet (`snappy`) partitioned by `YYYY/MM/DD/HH`  
**Official Documentation:** [CloudFront Real-Time Logs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/real-time-logs.html)

CloudFront real-time logging is enabled via a `RealtimeLogConfig` that streams request data to Kinesis, transforms each row into JSON, and stores the result in Parquet inside `s3://cdo-access-logs/access-logs/`. The schema matches the `LOG_FIELDS` list configured in the access-log stack.

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

**Configuration:** [../aws/cloudformation/standalone/access_logs/access_logs.yml](../aws/cloudformation/standalone/access_logs/access_logs.yml), [../aws/cloudformation/standalone/access_logs/access_logs.rb](../aws/cloudformation/standalone/access_logs/access_logs.rb), [../aws/cloudformation/standalone/access_logs/access_logs_partition.rb](../aws/cloudformation/standalone/access_logs/access_logs_partition.rb), [../lib/cdo/aws/cloudfront.rb#L301-L314](../lib/cdo/aws/cloudfront.rb#L301-L314)

> **Duplication note:** Both CloudFront formats represent the same events. Keep the Parquet dataset for low-latency analytics and consider pruning the TSV archive (or vice versa) if cost becomes an issue.

---

## Application Load Balancer (ALB) Logs

**Format:** Space-delimited with quoted fields  
**Official Documentation:** [AWS ALB Access Logs](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html)

The Application Load Balancer writes logs for every HTTP/HTTPS request it receives. Logs are written directly to S3 at `s3://cdo-logs/production-codeorg/AWSLogs/<account>/elasticloadbalancing/<region>/YYYY/MM/DD/`.

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

**Configuration:** [../aws/cloudformation/cloud_formation_stack.yml.erb#L300-L305](../aws/cloudformation/cloud_formation_stack.yml.erb#L300-L305)

---

## Rails Application Logs (Lograge CEE JSON)

**Format:** CEE-enhanced JSON (Common Event Expression)  
**Library:** [Lograge](https://github.com/roidrage/lograge) with CEE formatter  
**Configuration:** [../dashboard/config/environments/production.rb#L71-L72](../dashboard/config/environments/production.rb#L71-L72)

Rails application logs (Dashboard and Pegasus via Puma) are written to syslog in JSON format using the Lograge gem with a CEE (Common Event Expression) prefix. CEE is a JSON-based logging standard that prepends `@cee:` to each JSON log line for easier parsing by syslog receivers.

### Example Log Entries

**Successful Web Request (INFO):**
```json
@cee: {"method":"GET","path":"/s/course1/lessons/3/levels/5","format":"html","controller":"LevelsController","action":"show","status":200,"duration":124.56,"view":89.23,"db":28.45,"ip":"203.0.113.77","user_id":987654,"request_id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","timestamp":"2025-10-29T17:40:15.123Z"}
```

**API Request with Parameters (INFO):**
```json
@cee: {"method":"POST","path":"/api/v1/projects/12345/save","format":"json","controller":"ProjectsController","action":"save","status":200,"duration":456.78,"view":0.12,"db":398.34,"ip":"198.51.100.42","user_id":123456,"params":{"project_id":"12345"},"request_id":"b2c3d4e5-f6a7-8901-bcde-f12345678901","timestamp":"2025-10-29T17:41:22.456Z"}
```

**Application Error (ERROR):**
```json
@cee: {"method":"GET","path":"/s/course2/lessons/5/levels/10","format":"html","controller":"LevelsController","action":"show","status":500,"duration":89.12,"view":0.00,"db":15.23,"error":"ActiveRecord::RecordNotFound: Couldn't find Level with id=999","ip":"192.0.2.88","user_id":null,"request_id":"c3d4e5f6-a7b8-9012-cdef-123456789012","timestamp":"2025-10-29T17:42:30.789Z"}
```

**Slow Query Warning (WARN):**
```json
@cee: {"method":"GET","path":"/admin/reports","format":"html","controller":"AdminController","action":"reports","status":200,"duration":5234.12,"view":102.34,"db":5089.45,"ip":"10.0.1.15","user_id":1,"slow_query":true,"request_id":"d4e5f6a7-b8c9-0123-def1-234567890123","timestamp":"2025-10-29T17:43:45.012Z"}
```

### Fields

Rails Lograge logs typically include:

- `method` — HTTP method (GET, POST, PUT, DELETE, etc.)
- `path` — Request path
- `format` — Response format (html, json, xml, etc.)
- `controller` — Rails controller name
- `action` — Controller action name
- `status` — HTTP status code
- `duration` — Total request duration in milliseconds
- `view` — View rendering time in milliseconds
- `db` — Database query time in milliseconds
- `ip` — Client IP address (from X-Forwarded-For or direct connection)
- `user_id` — Authenticated user ID, or `null` if not logged in
- `params` — Request parameters (filtered to exclude sensitive data like passwords)
- `request_id` — Unique request identifier (UUID)
- `timestamp` — ISO 8601 timestamp (UTC)
- `error` — Error message and class (only present for exceptions)
- `exception` — Exception backtrace (only present for errors, may be truncated)

**Note:** The `@cee:` prefix is followed by a space and then the JSON object. This format allows syslog processors to recognize and parse the structured JSON payload.

**Additional Context:** Lograge is configured to condense Rails' verbose multi-line logs into a single JSON line per request. In production and staging ([../dashboard/config/environments/production.rb#L71](../dashboard/config/environments/production.rb#L71), [../dashboard/config/environments/staging.rb#L69](../dashboard/config/environments/staging.rb#L69)), logs go to syslog facility `LOCAL0`. In adhoc environments ([../dashboard/config/environments/adhoc.rb#L34](../dashboard/config/environments/adhoc.rb#L34)), Lograge is disabled to show full Rails logs for easier debugging.

---

## NGINX Access Logs

**Format:** Combined Log Format (CLF variant)  
**Official Documentation:** [NGINX Log Module](https://nginx.org/en/docs/http/ngx_http_log_module.html)

NGINX sits in front of both Puma applications and proxies requests to the appropriate backend (Dashboard or Pegasus). Access logs use the default "combined" format.

### Example Log Entry

```
203.0.113.99 - - [29/Oct/2025:17:45:12 +0000] "GET /s/course1 HTTP/1.1" 200 12345 "https://www.google.com/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
```

### Fields

The combined log format includes:

- `remote_addr` — Client IP address (203.0.113.99)
- `remote_user` — HTTP authenticated username, or `-` if none
- `time_local` — Local time in format `[DD/Mon/YYYY:HH:MM:SS +ZZZZ]`
- `request` — Full request line: `"METHOD URI PROTOCOL"`
- `status` — HTTP status code
- `body_bytes_sent` — Response body size in bytes (excludes headers)
- `http_referer` — Referer header, or `-` if none
- `http_user_agent` — User-Agent header

**Note:** NGINX logs are written to `/var/log/nginx/access.log` on each EC2 instance and uploaded hourly to S3 by the [log upload script](../bin/upload-logs-to-s3).

**Configuration:** [../cookbooks/cdo-nginx/templates/default/nginx.conf.erb#L19](../cookbooks/cdo-nginx/templates/default/nginx.conf.erb#L19)

---

## NGINX Error Logs

**Format:** NGINX error log format  
**Official Documentation:** [NGINX Core Module](https://nginx.org/en/docs/ngx_core_module.html#error_log)

NGINX writes errors, warnings, and notices to a separate error log file.

### Example Log Entries

**Upstream Connection Error:**
```
2025/10/29 17:46:23 [error] 12345#12345: *67890 connect() to unix:/var/run/dashboard.sock failed (111: Connection refused) while connecting to upstream, client: 203.0.113.45, server: _, request: "GET /s/course2 HTTP/1.1", upstream: "http://unix:/var/run/dashboard.sock:/s/course2", host: "studio.code.org", referrer: "https://code.org/"
```

**Upstream Timeout:**
```
2025/10/29 17:47:30 [error] 12345#12345: *67891 upstream timed out (110: Connection timed out) while reading response header from upstream, client: 198.51.100.22, server: _, request: "POST /api/v1/save HTTP/1.1", upstream: "http://unix:/var/run/dashboard.sock:/api/v1/save", host: "studio.code.org"
```

**Warning Level:**
```
2025/10/29 17:48:15 [warn] 12345#12345: *67892 an upstream response is buffered to a temporary file /var/cache/nginx/proxy_temp/3/45/0000000453 while reading upstream, client: 192.0.2.67, server: _, request: "GET /large-file HTTP/1.1", upstream: "http://unix:/var/run/pegasus.sock:/large-file", host: "code.org"
```

### Format

Error logs follow the pattern:
```
YYYY/MM/DD HH:MM:SS [level] pid#tid: *connection_id message, context_key: value, context_key: value, ...
```

- `timestamp` — Date and time (YYYY/MM/DD HH:MM:SS)
- `level` — Log level: `emerg`, `alert`, `crit`, `error`, `warn`, `notice`, `info`, `debug`
- `pid#tid` — Process ID and thread ID
- `*connection_id` — Connection number (internal NGINX identifier)
- `message` — Error or event description
- `context` — Comma-separated key-value pairs (e.g., `client`, `server`, `request`, `upstream`, `host`, `referrer`)

**Configuration:** [../cookbooks/cdo-nginx/templates/default/nginx.conf.erb#L20](../cookbooks/cdo-nginx/templates/default/nginx.conf.erb#L20)

---

## CloudWatch Logs (Browser Events)

**Format:** JSON  
**Official Documentation:** [CloudWatch Logs Concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogsConcepts.html)

Browser-side events (analytics, errors, user interactions) are sent from the client to the Rails backend, which then writes them to CloudWatch Logs as JSON.

### Example Log Entries

**User Click Event:**
```json
{"event":"click","target":"run_button","level_id":12345,"user_id":98765,"timestamp":"2025-10-29T17:50:12.456Z","session_id":"abc123def456","page":"/s/course1/lessons/2/levels/3"}
```

**JavaScript Error:**
```json
{"event":"error","message":"Uncaught TypeError: Cannot read property 'x' of undefined","stack":"TypeError: Cannot read property 'x' of undefined\n    at app.js:234:15\n    at Array.forEach (<anonymous>)","level_id":12345,"user_id":98765,"timestamp":"2025-10-29T17:51:22.789Z","session_id":"abc123def456","page":"/s/course1/lessons/2/levels/3","browser":"Chrome 118.0.0.0","os":"Windows 10"}
```

**Performance Metric:**
```json
{"event":"performance","metric":"load_time","value":1234,"level_id":12345,"user_id":98765,"timestamp":"2025-10-29T17:52:30.123Z","session_id":"abc123def456","page":"/s/course1/lessons/2/levels/3"}
```

### Fields

Browser event logs are flexible and include:

- `event` — Event type (e.g., `click`, `error`, `performance`, `navigation`)
- `timestamp` — ISO 8601 timestamp (UTC)
- `user_id` — Authenticated user ID, or `null`
- `session_id` — Browser session identifier
- `level_id` — Current level ID, if applicable
- `page` — Page path
- Additional event-specific fields (e.g., `target`, `message`, `stack`, `metric`, `value`, `browser`, `os`)

**Configuration:** [../dashboard/app/controllers/browser_events_controller.rb#L4-L13](../dashboard/app/controllers/browser_events_controller.rb#L4-L13), [#L21-L27](../dashboard/app/controllers/browser_events_controller.rb#L21-L27), [#L54-L57](../dashboard/app/controllers/browser_events_controller.rb#L54-L57)

---

## Syslog Format

**Format:** RFC 3164 / RFC 5424 syslog  
**Official Documentation:** [RFC 5424](https://tools.ietf.org/html/rfc5424), [RFC 3164](https://tools.ietf.org/html/rfc3164)

System logs on EC2 instances are collected via rsyslog and written locally to `/var/log/syslog`. Rails application logs (using Syslog::Logger) and system messages are both captured here.

### Example Log Entries

**Rails Application Log (via Lograge CEE):**
```
Oct 29 17:55:12 ip-10-0-1-23 dashboard: @cee: {"method":"GET","path":"/","format":"html","controller":"HomeController","action":"index","status":200,"duration":45.67,"view":30.12,"db":10.23,"ip":"203.0.113.88","timestamp":"2025-10-29T17:55:12.345Z"}
```

**System Message:**
```
Oct 29 17:56:01 ip-10-0-1-23 CRON[12345]: (root) CMD (cd /home/ubuntu/production/current && bundle exec rake cron:hourly RAILS_ENV=production)
```

**SSH Login:**
```
Oct 29 17:56:30 ip-10-0-1-23 sshd[23456]: Accepted publickey for ubuntu from 203.0.113.100 port 54321 ssh2: RSA SHA256:abcdefghijklmnop1234567890
```

### Format

Traditional syslog format (RFC 3164):
```
MMM DD HH:MM:SS hostname program[pid]: message
```

- `timestamp` — Month, day, time (local time, not UTC)
- `hostname` — Hostname or IP of the machine generating the log
- `program` — Program name (e.g., `dashboard`, `CRON`, `sshd`)
- `pid` — Process ID in square brackets
- `message` — Log message content

**Note:** Rails logs include the `@cee:` JSON prefix in the message field. Syslog on EC2 instances is configured to rotate at 100MB and keep 7 days of logs locally. Logs are also uploaded hourly to S3 via the [log upload script](../bin/upload-logs-to-s3).

**Configuration:** [../cookbooks/cdo-syslog/recipes/default.rb](../cookbooks/cdo-syslog/recipes/default.rb), [../bin/upload-logs-to-s3](../bin/upload-logs-to-s3)

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
| CloudFront Access | TSV | S3 `cdo-logs/cloudfront/` | Indefinite (partitioned) | [AWS CloudFront Logs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/AccessLogs.html) |
| CloudFront Real-Time Access | Parquet | S3 `cdo-access-logs/access-logs/` | Intelligent Tiering → Deep Archive | [CloudFront Real-Time Logs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/real-time-logs.html) |
| ALB Access | Space-delimited | S3 `cdo-logs/.../elasticloadbalancing/` | Indefinite | [AWS ALB Logs](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html) |
| Rails (Lograge CEE) | JSON | Syslog → S3 `cdo-logs/hosts/` | 7 days local, indefinite S3 | [Lograge](https://github.com/roidrage/lograge) |
| NGINX Access | Combined CLF | Local → S3 `cdo-logs/hosts/` | 7 days local, indefinite S3 | [NGINX Logging](https://nginx.org/en/docs/http/ngx_http_log_module.html) |
| NGINX Error | NGINX error format | Local → S3 `cdo-logs/hosts/` | 7 days local, indefinite S3 | [NGINX Error Log](https://nginx.org/en/docs/ngx_core_module.html#error_log) |
| Browser Events | JSON | CloudWatch Logs | Indefinite | [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/) |
| Syslog | RFC 3164/5424 | Local → S3 `cdo-logs/hosts/` | 7 days local, indefinite S3 | [RFC 5424](https://tools.ietf.org/html/rfc5424) |
| Firehose (deprecated) | JSON | S3 → Redshift | Varies | [Kinesis Firehose](https://docs.aws.amazon.com/firehose/latest/dev/) |

---

## See Also

- [Main Logging Documentation](./logging.md) — Overview of all logging sources and destinations
- [App Log Upload Process](./app-log-upload.md) — Details on hourly log uploads from EC2 to S3

