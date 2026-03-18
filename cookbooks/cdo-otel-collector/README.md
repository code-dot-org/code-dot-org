# cdo-otel-collector

This cookbook installs and configures the [OpenTelemetry Contrib Collector](https://github.com/open-telemetry/opentelemetry-collector-contrib) on Code.org infrastructure.

## Overview

The OTel Contrib Collector receives telemetry data (traces, metrics, logs) via OTLP and forwards it to a configurable APM backend. Supported backends are **Datadog**, **New Relic**, and **Sentry** (default). The active backend is controlled by the `apm_backend` attribute.

## Requirements

### Dependencies

- `apt` cookbook

### Network

The following ports must be locally accessible:

- **4317** (TCP): OTLP gRPC receiver
- **4318** (TCP): OTLP HTTP receiver
- **54526** (TCP): syslog receiver (listens for rsyslog forwarding)

## Attributes

| Attribute | Default | Description |
|---|---|---|
| `node['cdo-otel-collector']['enabled']` | `false` | Enable/disable the collector |
| `node['cdo-otel-collector']['otelcol_version']` | `0.147.0` | OTel Contrib version to install |
| `node['cdo-otel-collector']['otelcol_deb_sha256']` | *(see attributes/default.rb)* | SHA256 of the linux_amd64 .deb (must match the version) |
| `node['cdo-otel-collector']['apm_trace_sample_rate']` | `0.1` | APM trace sampling percentage (float, 0.0-100.0). Hashes trace ID for consistent per-trace decisions — all spans in a trace are kept or dropped together. |
| `node['cdo-otel-collector']['apm_backend']` | `'sentry'` | APM backend: `'datadog'`, `'newrelic'`, or `'sentry'` |
| `node['cdo-otel-collector']['datadog_site']` | `'datadoghq.com'` | **(Datadog)** DataDog site. See [DataDog site docs](https://docs.datadoghq.com/getting_started/site/). |
| `node['cdo-otel-collector']['newrelic_otlp_endpoint']` | `'https://otlp.nr-data.net:4317'` | **(New Relic)** OTLP/gRPC endpoint. EU accounts use `https://otlp.eu01.nr-data.net:4317`. |
| `node['cdo-otel-collector']['sentry_otlp_endpoint']` | `''` | **(Sentry)** OTLP/HTTP endpoint. Construct from your DSN: `https://o<org_id>.ingest.sentry.io/api/<project_id>/otlp/` |

When upgrading `otelcol_version`, update `otelcol_deb_sha256` to match the corresponding entry in the release's `otelcol-contrib_checksums.txt`.

## APM Backends

Each backend requires its credential to be stored in AWS Secrets Manager under `<env>/cdo/<secret_name>`:

| Backend | Secret name | Notes |
|---|---|---|
| `datadog` | `datadog_api_key` | Applies Datadog-specific processors for error tracking and resource naming |
| `newrelic` | `newrelic_api_key` | Standard OTLP/gRPC; no backend-specific processors |
| `sentry` | `sentry_auth_token` | Standard OTLP/HTTP; no backend-specific processors |

## Usage

### Basic Usage

Include the cookbook in your run list or recipe:

```ruby
include_recipe 'cdo-otel-collector'
```

### With cdo-apps

This cookbook is automatically included when using the `cdo-apps` cookbook. The APM backend credential for the selected `apm_backend` must be configured via the secrets management system (see **APM Backends** and **Secret Configuration** below).

### Secret Configuration

The APM backend credential is retrieved via AWS Secrets Manager using the standard `<env>/cdo/<secret_name>` naming convention. See the **APM Backends** table above for the secret name required by each backend.

## Syslog Integration

When co-deployed with `cdo-syslog`, this cookbook adds an rsyslog forwarding rule that
pipes syslog to the OTel syslog receiver. This requires no changes to `cdo-syslog`.

The recipe manages `/etc/rsyslog.d/51-otelcol.conf` (numbered after `cdo-syslog`'s
`50-default.conf`) and restarts rsyslog when the file changes. The syslog receiver uses
RFC 3164 (Ubuntu/rsyslog default) over TCP on `127.0.0.1:54526`. rsyslog continues
writing to `/var/log/syslog` as normal — the two rules are independent.

## Configuration Files

The cookbook creates and manages:

- `/etc/otelcol-contrib/config.yaml` - OpenTelemetry Collector configuration
- `/etc/rsyslog.d/51-otelcol.conf` - rsyslog forwarding rule to the syslog receiver

## Service Management

The cookbook manages the `otelcol-contrib` systemd service, ensuring it is:

- Installed via the official `.deb` package from GitHub releases
- Enabled to start on boot
- Started and running
- Configured to restart when configuration changes

## Application Integration

Applications should send telemetry data to the collector using OpenTelemetry OTLP either via HTTP or gRPC on the respective ports.

For more information, review the [OTLP Specification](https://opentelemetry.io/docs/specs/otlp/).

## Troubleshooting

### Check Service Status

```bash
sudo systemctl status otelcol-contrib
```

### Check Service Logs

```bash
sudo journalctl -u otelcol-contrib -f
```

### Validate Configuration

```bash
sudo otelcol-contrib validate --config /etc/otelcol-contrib/config.yaml
```

## Upgrading otelcol-contrib

1. Find the new version's checksums at:
   `https://github.com/open-telemetry/opentelemetry-collector-releases/releases`
2. Update `otelcol_version` in `attributes/default.rb`
3. Update `otelcol_deb_sha256` with the SHA256 for `otelcol-contrib_{version}_linux_amd64.deb`
4. Bump the version in `metadata.rb`

## Contributing

1. Make changes to the cookbook
2. Update version in `metadata.rb`
3. Run tests: `bundle exec kitchen verify`
4. Update this README if needed
5. Submit pull request

## References

- [OpenTelemetry Collector Installation](https://opentelemetry.io/docs/collector/installation/)
- [OTel Contrib Releases](https://github.com/open-telemetry/opentelemetry-collector-releases/releases)
- [DataDog Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/datadogexporter)
- [New Relic OTLP Configuration](https://docs.newrelic.com/docs/opentelemetry/best-practices/opentelemetry-otlp/)
- [Sentry OpenTelemetry Integration](https://docs.sentry.io/product/sentry-basics/integrate-backend/opentelemetry/)
- [Chef Cookbook Documentation](https://docs.chef.io/cookbooks/)
