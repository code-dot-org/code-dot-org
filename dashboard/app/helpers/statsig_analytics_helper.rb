module StatsigAnalyticsHelper
  def self.load_web_analytics?(request)
    paths_of_interest = [
      '/courses/express-2025/units/1/lessons/1/levels/2',
      '/courses/csd-2025/units/3/lessons/2/levels/1',
      '/courses/csp-2025/units/6/lessons/2/levels/1'
    ]

    return paths_of_interest.any? {|path_of_interest| request.path.include?(path_of_interest)}
  end
end
