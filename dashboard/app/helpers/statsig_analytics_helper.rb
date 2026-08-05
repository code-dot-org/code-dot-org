module StatsigAnalyticsHelper
  TARGET_PATHS = [
    '/courses/express-2025/units/1/lessons/1/levels/2',
    '/courses/csd-2025/units/3/lessons/2/levels/1',
    '/courses/csp-2025/units/6/lessons/2/levels/1',
  ].freeze
  TARGET_PATH_PATTERNS = Regexp.union(TARGET_PATHS).freeze

  def load_web_analytics?(request)
    TARGET_PATH_PATTERNS.match?(request.path)
  end

  # Returns the analytics section of the frontend app-config as a hash.
  #
  # Only production and the chef-managed test web server transmit; every other
  # environment is served provider 'none' and never loads the Statsig SDK.
  # statsig_force_transmit (locals.yml) overrides that for local testing.
  def analytics_config
    client_key = CDO.safe_statsig_api_client_key
    transmit = CDO.rack_env?(:production) || CDO.managed_test_server? ||
      CDO.statsig_force_transmit
    return {provider: 'none'} unless transmit && client_key.present?

    {provider: 'statsig', statsig: {clientKey: client_key}}
  end
end
