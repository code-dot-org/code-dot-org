require 'opentelemetry-logs-sdk'
require 'opentelemetry/exporter/otlp_logs'

module Cdo
  module Loggers
    class OtelLogger < Logger
      def initialize(logdev)
        super
        setup_opentelemetry
      end

      private def setup_opentelemetry
        # Create a LoggerProvider
        logger_provider = OpenTelemetry::SDK::Logs::LoggerProvider.new

        # Create a batching processor configured to export to the OTLP exporter
        processor = OpenTelemetry::SDK::Logs::Export::BatchLogRecordProcessor.new(
          OpenTelemetry::Exporter::OTLP::Logs::LogsExporter.new(endpoint: "#{ENV.fetch('OTEL_EXPORTER_OTLP_ENDPOINT', nil)}/v1/logs")
        )

        # Add the processor to the LoggerProvider
        logger_provider.add_log_record_processor(processor)

        # Access a Logger for your library from your LoggerProvider
        @otel_logger = logger_provider.logger(name: 'dashboard')

        # Ensure the logger provider is properly shut down when the application exits
        at_exit {logger_provider.shutdown}
      end

      private def format_message(severity, datetime, progname, msg)
        @otel_logger.on_emit(
          timestamp: datetime,
          severity_text: severity,
          body: msg.to_s
        )
        super
      end
    end
  end
end
