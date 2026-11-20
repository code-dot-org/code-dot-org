# Composes the <meta name="app-config"> JSON from the helpers that own each field.
module FrontendAppConfigHelper
  def frontend_app_config(sentry_dsn)
    {
      observability: observability_app_config_entry(sentry_dsn),
      analytics: analytics_config,
    }.to_json
  end
end
