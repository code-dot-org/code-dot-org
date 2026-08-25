# frozen_string_literal: true

module Observability
  module Sentry
    # Sets up Sentry error tracking. Runs in all processes except unit test runners.
    # When OpenTelemetry is also enabled, the OTLP integration is activated so
    # errors are correlated with traces.

    def self.enabled?
      CDO.enable_sentry && !CDO.unit_test
    end

    def self.setup
      return unless enabled?

      if CDO.dashboard_sentry_dsn.blank?
        CDO.log.warn '[observability] enable_sentry is true but dashboard_sentry_dsn is not configured; skipping Sentry setup'
        return
      end

      ::Sentry.init do |config|
        config.dsn = CDO.dashboard_sentry_dsn
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
    end

    # Initializes Sentry for processes the Rails engine never boots (root lib/,
    # rake tasks, standalone scripts). Sends synchronously: a short-lived
    # process has no reliable exit point to drain a background worker from.
    def self.setup_standalone
      return unless enabled?
      # Not .blank? — ActiveSupport is not loaded in every standalone process.
      return if CDO.dashboard_sentry_dsn.to_s.empty?

      require 'sentry-ruby'
      return if ::Sentry.initialized?

      ::Sentry.init do |config|
        config.dsn = CDO.dashboard_sentry_dsn
        # Explicitly disable PII collection per privacy policy, as in setup.
        config.send_default_pii = false
        # There is no Rails.env here; tag events from the deployment config so
        # production cron errors do not file under "development".
        config.environment = CDO.rack_env.to_s
        config.background_worker_threads = 0
      end
    end

    # Sets the user_id in the Sentry context. Intended to be called from a Warden after_fetch hook.
    def self.set_user_id(id)
      ::Sentry.set_user(id:)
    end
  end
end
