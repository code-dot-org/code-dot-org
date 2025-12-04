module StatsigAnalyticsHelper
  def self.load_web_analytics?(request)
    paths_of_interest = [
      '/courses/mix-move-ai-2025/units/1/lessons/1/levels/',
      '/courses/music-jam-2024/units/1/lessons/1/levels/'
    ]

    return paths_of_interest.any? {|path_of_interest| request.path.include?(path_of_interest)}
  end
end
