require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry-exporter-otlp'
require 'services/opentelemetry/filtering_sampler'

if CDO.otlp_endpoint && CDO.otlp_api_key
  OpenTelemetry::SDK.configure do |c|
    c.service_name = 'dashboard'

    c.use_all(
      'OpenTelemetry::Instrumentation::Rack' => {
        url_quantization: ->(path, _) {path.to_s},
        untraced_requests: lambda {|env|
          path = env['PATH_INFO']
          path.start_with?('/assets/', '/onetrust/', '/fonts/') || path.starts_with?('/shared/') || path.end_with?('.js') || path.ends_with?('.css')
        },
      }
    )

    c.add_span_processor(
      OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(
        OpenTelemetry::Exporter::OTLP::Exporter.new(
          endpoint: "#{CDO.otlp_endpoint}/v1/traces",
          headers: {'api-key' => CDO.otlp_api_key}
        )
      )
    )
  end

  parent_sampler = OpenTelemetry::SDK::Trace::Samplers::ALWAYS_ON
  #OpenTelemetry::SDK::Trace::Samplers::TraceIdRatioBased.new(0.001)

  OpenTelemetry.tracer_provider.sampler = Services::OpenTelemetry::FilteringSampler.new(parent_sampler)
end
