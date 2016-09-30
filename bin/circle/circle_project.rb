require 'json'
require 'memoist'
require 'open-uri'

GITHUB_PROJECT_API_BASE = 'https://circleci.com/api/v1.1/project/github'.freeze

# Abstracted access to a Circle CI project builds via their REST API
class CircleProject
  extend Memoist

  def initialize(project = 'code-dot-org/code-dot-org')
    @project = project
    @project_api_base = "#{GITHUB_PROJECT_API_BASE}/#{@project}"
  end

  # @param [Fixnum] build_id The CircleCI build #
  # @return [Object] build descriptor object from the CircleCI API
  #   Example output JSON: https://gist.github.com/bcjordan/02f7c2906b524fa86ec75b19f9a72cd2
  def get_build(build_id)
    JSON.parse(open("#{@project_api_base}/#{build_id}").read)
  end

  # @return [Array<build_descriptor:Object>] 30 most recent build descriptors
  # from the CircleCI API, in reverse-chronological order.
  def get_recent_builds
    JSON.parse(open(@project_api_base).read)
  end

  # @return [Integer] The most recent build number in the project
  def get_latest_build_num
    get_recent_builds.first['build_num']
  end

  memoize :get_build
  memoize :get_recent_builds
  memoize :get_latest_build_num
end
