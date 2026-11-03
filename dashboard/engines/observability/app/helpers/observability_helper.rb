# frozen_string_literal: true

module ObservabilityHelper
  # Returns the JSON string for the <meta name="app-config"> content attribute,
  # encoding the frontend observability provider, DSN, and sampling config.
  # Called directly from Rails templates.
  #
  # dsn - the Sentry DSN for the specific frontend project (e.g.
  #       CDO.frontend_studio_sentry_dsn or CDO.frontend_apps_sentry_dsn).
  def observability_app_config(dsn)
    {observability: observability_app_config_entry(dsn)}.to_json
  end

  # The `observability` key of the app-config meta, for pages that compose several keys.
  def observability_app_config_entry(dsn)
    use_sentry = CDO.enable_sentry && dsn.present?
    observability = use_sentry ? {provider: 'sentry', sentry: {dsn: dsn}} : {provider: 'none'}

    sampling = DCDO.get('frontend-observability-sampling-config', {})
    observability[:sampling] = sampling if sampling.present?

    observability
  end
end
