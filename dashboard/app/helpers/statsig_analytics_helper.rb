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
  # An environment transmits iff it provisions a client key: production and
  # the chef-managed test web server do (config/*.yml.erb); everywhere else
  # the key defaults to blank and the page is served provider 'none'. A
  # developer enables the provider locally by setting a real
  # statsig_api_client_key in locals.yml.
  # A signed-in page seeds the identity so the first events carry it. The
  # frontend treats this as optional and identifies over its API when absent,
  # so a signed-out page, a cached layout, or a static shell simply omits it.
  def analytics_config
    client_key = CDO.safe_statsig_api_client_key
    return {provider: 'none'} if client_key.blank?

    config = {provider: 'statsig', statsig: {clientKey: client_key}}
    return config unless current_user

    config.merge(user: {userId: current_user.id.to_s, userType: current_user.user_type})
  end
end
