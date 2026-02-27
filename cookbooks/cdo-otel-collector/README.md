# cdo-otel-collector

This cookbook installs and configures the DataDog OpenTelemetry Collector (DDOT) on Code.org infrastructure.

## Overview

The DataDog OpenTelemetry Collector acts as a bridge between applications instrumented with OpenTelemetry and DataDog's monitoring platform. It receives telemetry data (traces, metrics, logs) via the OpenTelemetry Protocol (OTLP) locally and forwards it to DataDog for visualization and analysis.

## Requirements

### Dependencies

- `apt` cookbook

### Network

The following ports must be accessible:

- **4317** (TCP): OTLP gRPC receiver
- **4318** (TCP): OTLP HTTP receiver  
- **8125** (UDP): DogStatsD
- **8126** (TCP): APM trace intake
- **5009** (TCP): Agent IPC communication

## Attributes

### Optional Attributes

- `node['cdo-otel-collector']['site']` - DataDog site (default: `datadoghq.com`)
- `node['cdo-otel-collector']['logs_enabled']` - Whether to send logs to DataDog (default: `true`)

Standard values like ports, service names, and file paths are hardcoded for consistency.

## Usage

### Basic Usage

Include the cookbook in your run list or recipe:

```ruby
include_recipe 'cdo-otel-collector'
```

### With cdo-apps

This cookbook is automatically included when using the `cdo-apps` cookbook. The DataDog API key should be configured via the secrets management system.

### Secret Configuration

The DataDog API Key is retrieved via AWS Secrets Manager using the standard secret naming convention.

## Configuration Files

The cookbook creates and manages the following configuration files:

- `/etc/datadog-agent/datadog.yaml` - Main DataDog agent configuration
- `/etc/datadog-agent/otel-config.yaml` - OpenTelemetry Collector configuration

## Service Management

The cookbook manages the `datadog-agent` systemd service, ensuring it is:

- Installed via the official DataDog installation script
- Enabled to start on boot
- Started and running
- Configured to restart when configuration changes

## Application Integration

Applications should send telemetry data to the collector using OpenTelemetry OTLP either via HTTP or gRPC on the respective ports.

For more information, review the [OTLP Specification](https://opentelemetry.io/docs/specs/otlp/).

## Troubleshooting

### Check Agent Status (directly)

```bash
sudo datadog-agent status
```

A successful installation shows both Agent and OTel Agent sections.

### Check Service Logs

```bash
sudo journalctl -u datadog-agent -f
```

### Check Configuration

```bash
# Validate main agent config
sudo datadog-agent config

# Check OpenTelemetry Collector config
sudo cat /etc/datadog-agent/otel-config.yaml
```

## Contributing

1. Make changes to the cookbook
2. Update version in `metadata.rb`
3. Run tests: `bundle exec kitchen verify`
4. Update this README if needed
5. Submit pull request

## References

- [DataDog OpenTelemetry Collector Documentation](https://docs.datadoghq.com/opentelemetry/setup/ddot_collector/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Chef Cookbook Documentation](https://docs.chef.io/cookbooks/)
