require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry-exporter-otlp'

# Only configure OpenTelemetry if enabled in CDO config, to avoid unnecessary overhead in environments where it's not needed
if CDO.enable_opentelemetry
  OpenTelemetry::SDK.configure do |c|
    c.service_name = 'dashboard'

    # Enable all ruby instrumentation, with a custom configuration for Rack.
    c.use_all(
      'OpenTelemetry::Instrumentation::Rack' => {
        url_quantization: ->(path, _) {path.to_s},
        untraced_requests: lambda {|env|
          path = env['PATH_INFO']
          # Don't trace requests for static assets. They are very high volume and noisy and not applicable for most application performance monitoring use cases.
          path.start_with?('/assets/', '/onetrust/', '/fonts/') || path.starts_with?('/shared/') || path.end_with?('.js') || path.ends_with?('.css')
        },
      }
    )

    # Configure a batch span processor with the OTLP exporter to send telemetry data to our OpenTelemetry Collector.
    # By default, this is sent to the local OpenTelemetry Collector installed by the cdo-otel-collector cookbook.
    # See: cookbooks/cdo-otel-collector
    c.add_span_processor(
      OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
        OpenTelemetry::Exporter::OTLP::Exporter.new
      )
    )
  end
end
