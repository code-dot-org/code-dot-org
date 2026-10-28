# frozen_string_literal: true

module ObservabilityHelper
  # Returns the JSON string for the <meta name="app-config"> content attribute,
  # encoding the frontend observability provider, DSN, and sampling config.
  # Called directly from Rails templates.
  #
  # dsn - the Sentry DSN for the specific frontend project (e.g.
  #       CDO.frontend_studio_sentry_dsn or CDO.frontend_apps_sentry_dsn).
  def observability_config(dsn)
    use_sentry = CDO.enable_sentry && dsn.present?
    observability = use_sentry ? {provider: 'sentry', sentry: {dsn: dsn}} : {provider: 'none'}

    observability[:sampling] = DCDO.get(
      'frontend-observability-sampling-config',
      {errorSampleRate: 1, tracesSampleRate: 1, logSampleRate: 1, metricsSampleRate: 1}
    )

    {observability: observability}.to_json
  end
end
