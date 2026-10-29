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

  def analytics_config
    # Rides beside provider so a disabled page still describes itself.
    enabled = DCDO.get('statsig-enabled', true)
    # Set in production, on the managed test server, and in locals.yml for local work.
    client_key = CDO.safe_statsig_api_client_key
    return {provider: 'none', enabled: enabled} if client_key.blank?

    config = {
      provider: 'statsig',
      enabled: enabled,
      # The legacy bundle's path gate, so the path list has one owner.
      statsig: {clientKey: client_key, autoCapture: load_web_analytics?(request)},
    }
    return config unless current_user

    config.merge(user: {userId: current_user.id.to_s, userType: current_user.user_type})
  end
end
