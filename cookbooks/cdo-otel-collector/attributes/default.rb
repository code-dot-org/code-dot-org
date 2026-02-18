default['cdo-otel-collector'] = {
  # Version of OpenTelemetry Collector to install
  version: '0.146.0',
  # User and group are created by the DEB package
  user: 'otelcol',
  group: 'otelcol',
  home_dir: '/var/lib/otelcol',
  config_dir: '/etc/otelcol',
  config_file: '/etc/otelcol/config.yaml',
  # Binary is installed by package to /usr/bin/otelcol
  service_name: 'otelcol',
  log_level: 'info',

  # Receiver configurations
  receivers: {
    otlp: {
      protocols: {
        grpc: {
          endpoint: '0.0.0.0:4317'
        },
        http: {
          endpoint: '0.0.0.0:4318'
        }
      }
    },
    hostmetrics: {
      collection_interval: '30s',
      scrapers: {
        cpu: {},
        disk: {},
        filesystem: {},
        memory: {},
        network: {},
        process: {}
      }
    }
  },

  # Processor configurations
  processors: {
    batch: {},
    resourcedetection: {
      detectors: ['env', 'system'],
      system: {
        hostname_sources: ['os']
      }
    }
  },

  # Exporter configurations (environment specific)
  exporters: {
    logging: {
      loglevel: 'debug'
    }
  }
}
