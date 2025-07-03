require 'opentelemetry/sdk'
require 'opentelemetry/instrumentation/all'
require 'opentelemetry-exporter-otlp'
require 'cdo/logger'

OpenTelemetry::SDK.configure do |c|
  c.service_name = 'dashboard'
  c.use_all
end

SemanticLogger.add_appender(logger: Cdo::Loggers::OtelLogger.new("true"), formatter: :json)
Rails.logger = ActiveSupport::TaggedLogging.new(SemanticLogger["dashboard"])
