require 'json'
require 'memoist'
require 'open-uri'
require 'parallel'

GITHUB_PROJECT_API_BASE = 'https://circleci.com/api/v1.1/project/github'.freeze

# Abstracted access to a Circle CI project builds via their REST API
class CircleProject
  extend Memoist

  def initialize(project = 'code-dot-org/code-dot-org')
    @project = project
    @project_api_base = "#{GITHUB_PROJECT_API_BASE}/#{@project}"
  end

  # @param build_num [Fixnum] The CircleCI build #
  # @return [Object] build descriptor object from the CircleCI API
  #   Example output JSON: https://gist.github.com/bcjordan/02f7c2906b524fa86ec75b19f9a72cd2
  def get_build(build_num)
    get_recent_builds.find {|b| b['build_num'] == build_num} ||
        JSON.parse(open("#{@project_api_base}/#{build_num}").read)
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

  # Given a set of options, generate a reasonable range of builds to consider.
  # Separated out to be useful to command-line tools.
  # @param opts.start_build [Fixnum] (optional) - The first build to include in
  #        the results.  If omitted, 30 builds will be returned.
  # @param opts.end_build [Fixnum] (optional) - The last build to include in the
  #        results.  If omitted, results will end with the most recent build.
  # @return [Range] A range of build numbers matching the given options
  def build_range_from_options(opts = {})
    # Default end build should be the most recent build
    end_build = opts[:end_build] || get_latest_build_num

    # Default start build should give us 30 builds up to the end build.
    # This allows us to make only one API call in the all-defaults case, since
    # the recent builds API call returns 30 builds.
    start_build = opts[:start_build] || end_build - 29

    start_build..end_build
  end

  # Retrieve the set of build descriptor objects from the CircleCI API for this
  # project for the given range
  # @param range [Enumerable<Fixnum>] set of build numbers to retrieve
  # @return [Array<build_descriptor:Object>] set of found build descriptors
  def get_builds(range)
    raise ArgumentError unless range.is_a?(Enumerable)

    # Download the build information we need in parallel
    Parallel.map(
      range,
      progress: "Downloading #{range.min}..#{range.max}",
      in_processes: 50
    ) {|n| get_build(n)}
  end

  memoize :get_build
  memoize :get_recent_builds
end
