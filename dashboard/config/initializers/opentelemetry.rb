require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry-exporter-otlp'
require 'cdo/logger'

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
end

SemanticLogger.add_appender(logger: Cdo::Loggers::OtelLogger.new("true"), formatter: :json)
Rails.logger = ActiveSupport::TaggedLogging.new(SemanticLogger["dashboard"])
