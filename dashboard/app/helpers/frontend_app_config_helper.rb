# Composes the <meta name="app-config"> JSON from the helpers that own each section.
module FrontendAppConfigHelper
  def frontend_app_config(sentry_dsn)
    {
      observability: observability_section(sentry_dsn),
      analytics: analytics_config,
    }.to_json
  end
end
