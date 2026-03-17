# cdo-otel-collector

This cookbook installs and configures the [OpenTelemetry Contrib Collector](https://github.com/open-telemetry/opentelemetry-collector-contrib) on Code.org infrastructure.

## Overview

The OTel Contrib Collector receives telemetry data (traces, metrics, logs) via OTLP and forwards it to DataDog for visualization and analysis. APM stats (request/error/duration metrics per service and resource) are computed directly by the DataDog exporter.

## Requirements

### Dependencies

- `apt` cookbook

### Network

The following ports must be locally accessible:

- **4317** (TCP): OTLP gRPC receiver
- **4318** (TCP): OTLP HTTP receiver

## Attributes

| Attribute | Default | Description |
|---|---|---|
| `node['cdo-otel-collector']['enabled']` | `false` | Enable/disable the collector |
| `node['cdo-otel-collector']['site']` | `datadoghq.com` | DataDog site for the exporter |
| `node['cdo-otel-collector']['otelcol_version']` | `0.147.0` | OTel Contrib version to install |
| `node['cdo-otel-collector']['otelcol_deb_sha256']` | *(see attributes/default.rb)* | SHA256 of the linux_amd64 .deb (must match the version) |

When upgrading `otelcol_version`, update `otelcol_deb_sha256` to match the corresponding entry in the release's `otelcol-contrib_checksums.txt`.

## Usage

### Basic Usage

Include the cookbook in your run list or recipe:

```ruby
include_recipe 'cdo-otel-collector'
```

### With cdo-apps

This cookbook is automatically included when using the `cdo-apps` cookbook. The DataDog API key should be configured via the secrets management system.

### Secret Configuration

The DataDog API Key is retrieved via AWS Secrets Manager using the standard secret naming convention and is used by the DataDog exporter.

## Configuration Files

The cookbook creates and manages:

- `/etc/otelcol-contrib/config.yaml` - OpenTelemetry Collector configuration

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
- [Chef Cookbook Documentation](https://docs.chef.io/cookbooks/)
