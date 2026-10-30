cdo-syslog Cookbook
=====================================

Configures rsyslog to write syslog to a fixed-length circular file at `/var/log/syslog`.

## OpenTelemetry Integration (Optional)

If `cdo-otel-collector` is also in the run list, it optionally adds
`/etc/rsyslog.d/51-otelcol.conf` which forwards all syslog messages to the OTel
Collector's syslog receiver on `127.0.0.1:54526` (TCP, RFC 3164). The two rules are
independent: rsyslog continues writing to file and additionally forwards to the collector.
No changes to this cookbook are required.
