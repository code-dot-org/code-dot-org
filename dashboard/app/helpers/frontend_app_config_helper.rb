# Composes the <meta name="app-config"> JSON for frontend/ pages from the
# helpers that own each section.
module FrontendAppConfigHelper
  # sentry_dsn - the Sentry DSN for the page's frontend project
  #              (e.g. CDO.frontend_studio_sentry_dsn).
  def frontend_app_config(sentry_dsn)
    {
      observability: observability_section(sentry_dsn),
      analytics: analytics_config,
    }.to_json
  end
end
