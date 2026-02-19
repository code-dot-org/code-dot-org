# cdo-otel-collector

This cookbook installs and configures the DataDog OpenTelemetry Collector (DDOT) on Code.org infrastructure.

## Overview

The DataDog OpenTelemetry Collector acts as a bridge between applications instrumented with OpenTelemetry and DataDog's monitoring platform. It receives telemetry data (traces, metrics, logs) via the OpenTelemetry Protocol (OTLP) and forwards it to DataDog for visualization and analysis.

## Requirements

### Platforms

- Ubuntu 18.04+
- Other Debian-based systems (should work but not explicitly tested)

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

### Required Attributes

- `node['cdo-otel-collector']['api_key']` - DataDog API key (managed by secrets system)

### Optional Attributes

- `node['cdo-otel-collector']['site']` - DataDog site (default: `us5.datadoghq.com`)

Standard values like ports, service names, and file paths are hardcoded for consistency.

## Usage

### Basic Usage

Include the cookbook in your run list or recipe:

```ruby
include_recipe 'cdo-otel-collector'\n```

### With cdo-apps

This cookbook is automatically included when using the `cdo-apps` cookbook. The DataDog API key should be configured via the secrets management system.

### Secret Configuration

The DataDog API key must be provided via the secrets management system:

```ruby
node.override['cdo-otel-collector']['api_key'] = 'your_api_key_here'
```

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

Applications should send telemetry data to the collector using these environment variables:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=\"http://localhost:4317\"\nexport OTEL_EXPORTER_OTLP_PROTOCOL=\"grpc\"\nexport OTEL_RESOURCE_ATTRIBUTES=\"service.name=my-service,service.version=1.0,deployment.environment.name=${CHEF_ENVIRONMENT}\"\n```

## Testing

This cookbook includes comprehensive Test Kitchen integration tests using InSpec.

### Running Tests

From the cookbook directory:

```bash\n# Install dependencies\nbundle install\n\n# Create test environment\nbundle exec kitchen create\n\n# Run cookbook\nbundle exec kitchen converge\n\n# Run tests  \nbundle exec kitchen verify\n\n# Clean up\nbundle exec kitchen destroy\n```

### Test Coverage

The integration tests verify:\n\n- DataDog agent package installation\n- Service configuration and startup\n- Configuration file creation and permissions\n- Network port binding\n- Agent status and health checks\n- OpenTelemetry Collector functionality\n\n## Troubleshooting\n\n### Check Agent Status\n\n```bash\nsudo datadog-agent status\n```\n\nA successful installation shows both Agent and OTel Agent sections.\n\n### Check Service Logs\n\n```bash\nsudo journalctl -u datadog-agent -f\n```\n\n### Check Configuration\n\n```bash\n# Validate main agent config\nsudo datadog-agent config\n\n# Check OpenTelemetry Collector config\nsudo cat /etc/datadog-agent/otel-config.yaml\n```\n\n### Common Issues\n\n1. **Missing API Key**: Ensure `node['cdo-otel-collector']['api_key']` is set\n2. **Port Conflicts**: Check that ports 4317/4318/8125/8126 are available\n3. **Network Connectivity**: Verify outbound access to DataDog endpoints\n4. **Permissions**: Ensure dd-agent user has proper file permissions\n\n## Contributing\n\n1. Make changes to the cookbook\n2. Update version in `metadata.rb`\n3. Run tests: `bundle exec kitchen verify`\n4. Update this README if needed\n5. Submit pull request\n\n## License\n\nAll rights reserved - Code.org\n\n## Author\n\nCode.org Infrastructure Team\n\n## References\n\n- [DataDog OpenTelemetry Collector Documentation](https://docs.datadoghq.com/opentelemetry/setup/ddot_collector/)\n- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)\n- [Chef Cookbook Documentation](https://docs.chef.io/cookbooks/)\n