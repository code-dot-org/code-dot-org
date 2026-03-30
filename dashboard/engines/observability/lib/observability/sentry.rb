# frozen_string_literal: true

module Observability
  module Sentry
    # Sets up Sentry error tracking. Only runs when CDO.enable_sentry is true
    # and the process is serving web requests (skips rake tasks, test runners, etc.).
    # When OpenTelemetry is also enabled, the OTLP integration is activated so
    # errors are correlated with traces.
    def self.setup
      puts "CDO.enable_sentry: #{CDO.enable_sentry}, CDO.running_web_application?: #{CDO.running_web_application?}"
      return unless CDO.enable_sentry && CDO.running_web_application?

      if CDO.sentry_dsn.blank?
        CDO.log.warn '[observability] enable_sentry is true but sentry_dsn is not configured; skipping Sentry setup'
        return
      end
      puts 'BEFORE SENTRY INIT'
      ::Sentry.init do |config|
        config.dsn = CDO.sentry_dsn
        # Explicitly disable PII collection per privacy policy.
        # Sentry defaults this to false, but we set it explicitly to make the
        # intent clear.
        # See: https://docs.sentry.io/platforms/ruby/data-management/data-collected/
        config.send_default_pii = false
        # get breadcrumbs from logs
        config.breadcrumbs_logger = [:active_support_logger, :http_logger]

        if CDO.enable_opentelemetry
          config.otlp.enabled = true
          config.otlp.setup_otlp_traces_exporter = false  # collector handles traces
          config.otlp.setup_propagator = false             # keep existing propagation
        end
      end
      puts 'AFTER SENTRY INIT'
    end
  end
end
