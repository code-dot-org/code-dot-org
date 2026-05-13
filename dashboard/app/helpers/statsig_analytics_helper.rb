module StatsigAnalyticsHelper
  TARGET_PATHS = [
    '/courses/express-2025/units/1/lessons/1/levels/2',
    '/courses/csd-2025/units/3/lessons/2/levels/1',
    '/courses/csp-2025/units/6/lessons/2/levels/1',
  ].freeze
  TARGET_PATH_PATTERNS = Regexp.union(TARGET_PATHS).freeze

  def load_web_analytics?(request)
    request.ge_region.present? || TARGET_PATH_PATTERNS.match?(request.path)
  end
end
