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
  # `provider` reports what is configured: a client key is provisioned in
  # production and on the chef-managed test web server (config/*.yml.erb), and
  # a developer provisions one locally by setting statsig_api_client_key in
  # locals.yml. `enabled` reports the feature flag separately, so the frontend
  # owns the decision and a disabled page still describes itself fully.
  #
  # A signed-in page seeds the identity so the first events carry it. The
  # frontend treats this as optional and identifies over its API when absent,
  # so a signed-out page, a cached layout, or a static shell simply omits it.
  #
  # `autoCapture` reuses the same path gate that decides whether the legacy
  # bundle loads, read from the view's implicit `request`, so the path list has
  # one owner. It rides under `statsig` because autocapture is a capability of
  # that provider rather than something the provider-agnostic layer knows about.
  def analytics_config
    enabled = DCDO.get('statsig-enabled', true)
    client_key = CDO.safe_statsig_api_client_key
    return {provider: 'none', enabled: enabled} if client_key.blank?

    config = {
      provider: 'statsig',
      enabled: enabled,
      statsig: {clientKey: client_key, autoCapture: load_web_analytics?(request)},
    }
    return config unless current_user

    config.merge(user: {userId: current_user.id.to_s, userType: current_user.user_type})
  end
end
