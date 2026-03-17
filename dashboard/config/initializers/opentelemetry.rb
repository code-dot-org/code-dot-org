# Only configure OpenTelemetry if enabled in CDO config, to avoid unnecessary overhead in environments where it's not needed.
# Also skip when not running a web server (e.g., unit tests) to avoid instrumentation overhead.
# Note: ENV['UNIT_TEST'] is set too late (in test_helper.rb) to be reliable here.
if CDO.enable_opentelemetry && CDO.running_web_application?
  require 'opentelemetry/sdk'
  require 'opentelemetry/instrumentation/all'
  require 'opentelemetry-exporter-otlp'

  OpenTelemetry::SDK.configure do |c|
    c.service_name = 'dashboard'

    # Enable all ruby instrumentation
    c.use_all(
      'OpenTelemetry::Instrumentation::ActionPack' => {
        # TODO: Once we are on Rails 7.1, remove this override.
        # This is needed to set low cardinality span names using Rails controller class names such as Controller#Method
        # This naming scheme does not adhere to OpenTelemetry semantic conventions, but is necessary because the instrumentation
        # does not support it until Rails 7.1.
        span_naming: :class,
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
