# cdo-otel-collector

This cookbook installs and configures the New Relic NRDOT Collector on Code.org infrastructure.

## Overview

The New Relic NRDOT Collector acts as a bridge between applications instrumented with OpenTelemetry and New Relic's monitoring platform. It receives telemetry data (traces, metrics, logs) via the OpenTelemetry Protocol (OTLP) and forwards it to New Relic for visualization and analysis.

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
- **13133** (TCP): Health check endpoint

## Attributes

### Required Attributes

- `node['cdo-otel-collector']['license_key']` - New Relic License Key (managed by secrets system)

### Optional Attributes

- `node['cdo-otel-collector']['version']` - NRDOT collector version (default: `1.11.0`)
- `node['cdo-otel-collector']['distribution']` - Collector distribution (default: `nrdot-collector-host`)
- `node['cdo-otel-collector']['architecture']` - Package architecture (default: `amd64`)

Standard values like ports, service names, and file paths are hardcoded for consistency.

## Usage

### Basic Usage

Include the cookbook in your run list or recipe:

```ruby
include_recipe 'cdo-otel-collector'\n```

### With cdo-apps

This cookbook is automatically included when using the `cdo-apps` cookbook. The New Relic License Key should be configured via the secrets management system.

### Secret Configuration

The New Relic License Key must be provided via the secrets management system:

```ruby
node.override['cdo-otel-collector']['license_key'] = 'your_license_key_here'
```

## Configuration Files

The cookbook creates and manages the following configuration files:

- `/etc/nrdot-collector-host/nrdot-collector-host.conf` - Environment configuration with license key
- Uses default OpenTelemetry configuration provided by New Relic

## Service Management

The cookbook manages the `nrdot-collector-host` systemd service, ensuring it is:

- Installed via the official New Relic DEB package
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

The integration tests verify:\n\n- New Relic NRDOT collector package installation\n- Service configuration and startup\n- Configuration file creation and permissions\n- Network port binding\n- Collector health checks\n- OpenTelemetry Collector functionality\n\n## Troubleshooting\n\n### Check Collector Status\n\n```bash\ncurl localhost:13133\n```\n\nA successful installation returns JSON with \"Server available\" status.\n\n### Check Service Logs\n\n```bash\nsudo journalctl -u nrdot-collector-host -f\n```\n\n### Check Configuration\n\n```bash\n# Check environment configuration\nsudo cat /etc/nrdot-collector-host/nrdot-collector-host.conf\n\n# Check service status\nsudo systemctl status nrdot-collector-host\n```\n\n### Common Issues\n\n1. **Missing License Key**: Ensure `node['cdo-otel-collector']['license_key']` is set\n2. **Port Conflicts**: Check that ports 4317/4318 are available\n3. **Network Connectivity**: Verify outbound access to New Relic endpoints\n4. **Package Download**: Ensure access to GitHub releases for DEB package download\n\n## Contributing\n\n1. Make changes to the cookbook\n2. Update version in `metadata.rb`\n3. Run tests: `bundle exec kitchen verify`\n4. Update this README if needed\n5. Submit pull request\n\n## License\n\nAll rights reserved - Code.org\n\n## Author\n\nCode.org Infrastructure Team\n\n## References\n\n- [New Relic NRDOT Collector Releases](https://github.com/newrelic/nrdot-collector-releases)\n- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)\n- [Chef Cookbook Documentation](https://docs.chef.io/cookbooks/)\n