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

    # Identifies the current user in the Sentry context by an opaque log token
    # rather than a raw user id. Intended to be called from a Warden after_fetch
    # hook. Per-user grouping and "users affected" counts still work, since the
    # token is stable for a given user.
    #
    # Never pass a raw user id here. The token is derived by the caller via
    # Cdo::UserLogToken, which keeps this engine a transport concern with no
    # knowledge of the key -- and keeps its standalone test bundle free of a
    # lib/cdo dependency.
    #
    # A nil token leaves the context untouched, so an unconfigured key degrades
    # to anonymous events rather than falling back to the id.
    def self.set_user_token(token)
      return if token.nil? || token.to_s.empty?

      ::Sentry.set_user(id: token)
    end
  end
end
