require 'cdo/redis'
require 'dynamic_config/dcdo'
require 'uri'
require 'active_support/core_ext/numeric/time'
require 'active_support/core_ext/numeric/bytes'
require 'active_support/number_helper'

# We want to know what strings we are using on the site and where they are being used. To get this data, this class was
# created to log the association of string-keys and URLs to a database (through the AWS service Firehose).
# This i18n string usage data is buffered and sent periodically to Firehose. We can then query the data on Redshift and
# create lists of which strings are used on which pages.
class I18nStringUrlTracker
  include Singleton

  # DCDO key for turning this feature on or off.
  I18N_STRING_TRACKING_DCDO_KEY = 'i18n_string_tracking'.freeze

  # The amount of time which will pass before the buffered i18n usage data is uploaded to Firehose.
  # TODO: increase this interval to 12.hours once we verify everything is working.
  FLUSH_INTERVAL = 1.hour

  MAX_BUFFER_SIZE = 250.megabytes

  def initialize
    super
    # A buffer of all the given i18n string tracking data. It will be flushed periodically.
    # It will be in the following form:
    # {
    #   <url>: {
    #     <string_key>: [<source>, ...],
    #     ...
    #   },
    #   ...
    # }
    #
    # Example:
    # {
    #   "https://code.org": {
    #     "header.my_dashboard": ["common_json", ...],
    #     "header.course_catalog" ["common_json", ...],
    #     ...
    #   },
    #   ...
    # }
    #
    # We want to buffer the data before we send it to Firehose because we can de-dupe data.
    # There is a lot of duplicate data, so this will result in a considerable cost savings.
    @buffer = {}
    @buffer.extend(MonitorMixin) # Adds synchronization
    # Roughly tracks the size of the buffer in bytes. This should never exceed @buffer_size_max
    @buffer_size = 0
    @buffer_size_max = MAX_BUFFER_SIZE

    # Flushes the buffer in a loop which executes at the given interval
    @task = Concurrent::TimerTask.execute(execution_interval: FLUSH_INTERVAL) {flush}
  end

  # Records the given string_key and URL so we can analyze later what strings are present on what pages.
  # @param string_key [String] The key used to review the translated string from our i18n system.
  # @param url [String] The url which required the translation of the given string_key.
  # @param source [String] Context about where the string lives e.g. 'ruby', 'maze', 'turtle', etc
  def log(string_key, url, source)
    return unless DCDO.get(I18N_STRING_TRACKING_DCDO_KEY, false)
    # Skip URLs we are not interested in.
    return unless allowed(url)

    url = normalize_url(url)
    return unless string_key && url && source

    # Reverse the URL encoding on special characters so the human readable characters are logged.
    logged_url = CGI.unescape(url)
    add_to_buffer(string_key, logged_url, source)
  end

  private

  # Records the log data to a buffer which will eventually be flushed
  def add_to_buffer(string_key, url, source)
    # make sure this is the only thread modifying @buffer
    @buffer.synchronize do
      # update the buffer size if we are adding any new data to it
      # duplicate data will not increase the buffer size
      buffer_url = @buffer[url] ||= {}.tap {@buffer_size += url.bytesize}
      buffer_string_key = buffer_url[string_key] ||= Set.new.tap {@buffer_size += string_key.bytesize}
      # add the new data to the buffer
      @buffer_size += source.bytesize if buffer_string_key.add?(source)
    end

    # if the buffer is too large, trigger an early flush
    if @buffer_size > @buffer_size_max
      message = "The I18n string usage tracker is has reached its memory limit so data will be flushed early. Investigate whether there is an issue or if the limit should be increased."
      Honeybadger.notify(
        name: 'I18n Usage Tracker buffer reached max memory limits.',
        message: message,
        context: {
          current_buffer_size: ActiveSupport::NumberHelper.number_to_human_size(@buffer_size).to_s,
          buffer_size_max: ActiveSupport::NumberHelper.number_to_human_size(@buffer_size_max).to_s
        }
      )
      flush
    end
  end

  # Sends the buffered i18n string usage data to Firehose.
  def flush
    buffer = nil

    # Capture the current data and start a new buffer
    # Use .synchronize to make sure this is the only thread modifying @buffer
    @buffer.synchronize do
      buffer = @buffer
      @buffer = {}
      @buffer.extend(MonitorMixin) # Adds synchronization
      @buffer_size = 0
    end

    # log every <string_key>:<url>:<source> combination to Firehose
    buffer&.each_key do |url|
      buffer[url].each_key do |string_key|
        buffer[url][string_key].each do |source|
          # record the string : url association.
          RedisClient.instance.put_record(
            :i18n,
            {url: url, string_key: string_key, source: source}
          )
        end
      end
    end
  end

  # Paths where everything after it will be aggregated.
  # You can also add single pages which don't need aggregation as well e.g. /home
  SIMPLE_PATHS = %w(home teacher_dashboard courses users).freeze

  # Determines if this URL should be tracked. We want to filter URLs so we don't waste resources recording data we are
  # not interested in.
  def allowed(url)
    return false unless url
    parsed_url = URI(url)

    # Include any non-studio.code.org URLs e.g. code.org, hourofcode.com, etc
    return true unless parsed_url.host&.match(/.*studio\.code\.org.*/)

    # Allow Applab/Weblab/Gamelab/Project based URLs
    # Example: https://studio.code.org/projects/flappy/zjiufOp0h-9GS-DywevS0d3tKJyjdbQZZqZVaiuAjiU/view
    return true if parsed_url.path&.match(/\/projects\/.*/)

    # Allow script URLs
    # Example: https://studio.code.org/s/dance-2019/lessons/1/levels/1
    return true if parsed_url.path&.match(/\/s\/.*/)

    # Allow URLs where the path starts with anything in SIMPLE_PATHS
    # Example https://studio.code.org/home
    SIMPLE_PATHS.each do |page|
      return true if parsed_url.path&.match(/^\/#{page}.*/)
    end
    # Otherwise this URL should not be recorded
    false
  end

  # Cleans up the given URL so the data we record is consistent. It also aggregates some URLs so we limit how many
  # unique URLs we are recording.
  def normalize_url(url)
    return unless url

    parsed_url = URI(url)

    # strip query string
    parsed_url.query = nil

    # strip anchor tags
    parsed_url.fragment = nil

    # default to https
    parsed_url.scheme = 'https'

    # Aggregate /projects/<project_type>/<project_id> URLs because each project URL will have a unique identifier
    # converts 'https://studio.code.org/projects/flappy/zjiufOp0h-9GS-DywevS0d3tKJyjdbQZZqZVaiuAjiU/view'
    # into 'https://studio.code.org/projects/flappy'
    # Regex explanation:
    # (.*\/projects\/) - The first major hint this this is a project URL is '/projects/' in the URL. The parenthesis around
    # the expression make it a "capture group". Matches a string like "projects/"
    # .*?)\/ - This matches the project type and the '?' is included to make the matching is non-greedy. Otherwise it
    # would match to the end of the URL past the project type. Matches a string like "maze"
    # .* - This matches the unique project ID and everything after it. This is the part we want to omit. Matches a
    # string like "zjiufOp0h-9GS-DywevS0d3tKJyjdbQZZqZVaiuAjiU/"
    projects_regex = /(.*\/projects\/.*?)\/.*/
    parsed_url.path&.match(projects_regex) do |m|
      # capture group m[1] is the part of the URL before the project ID.
      parsed_url.path = m[1]
    end

    # Aggregate /s/<script>/... URLs because we want to aggregate all strings by script rather than each level. The main
    # motivation for this is to reduce the amount of data we are logging. There is a lot string reuse between levels
    # so we can reduce how much data we log by preemptively aggregating it. Strings which are unique to a particular
    # level usually have the specific level ID in the string key anyways.
    # converts 'https://studio.code.org/s/dance-2019/lessons/1/levels/1'
    # into 'https://studio.code.org/s/dance-2019'
    # Regex explanation:
    # (.*\/s\/) - The first major hint this this is a script URL is '/s/' in the URL. The parenthesis around
    # the expression make it a "capture group". Matches a string like "/s/"
    # .*?) - This matches the script name and year, and the '?' is included to make the matching is non-greedy.
    # Otherwise it would match to the end of the URL past the script year. Matches a string like "dance-2019"
    # /\.* - This matches the specific level/lesson information. This is the part we want to omit. Matches a
    # string like '/lessons/1/levels/1'
    script_regex = /(.*\/s\/.*?)\/.*/
    parsed_url.path&.match(script_regex) do |m|
      # capture group m[1] is the match in the first '()' group in the regex
      parsed_url.path = m[1]
    end

    # Remove trailing '/' from the URL
    parsed_url.path&.match(/(.*)\/$/) do |m|
      # capture group m[1] is the match in the first '()' group in the regex
      parsed_url.path = m[1]
    end

    # Simple aggregation for any paths which start with one of the given pages
    # converts 'https://studio.code.org/teacher_dashboard/sections/3263468/login_info'
    # int 'https://studio.code.org/teacher_dashboard'
    SIMPLE_PATHS.each do |page|
      parsed_url.path&.match(/^(\/#{page}).*/) do |m|
        # capture group m[1] is the match in the first '()' group in the regex
        parsed_url.path = m[1]
      end
    end

    parsed_url.to_s
  end

  # Clear the buffer and stop the periodic upload of i18n usage data.
  # This should only be used by unit tests.
  def shutdown
    @buffer = {}
    @buffer_size = 0
    @buffer_size_max = MAX_BUFFER_SIZE
    @buffer.extend(MonitorMixin) # Adds synchronization
    @task.shutdown
  end

  # Sets the interval at which data should be flushed.
  # This should only be used by unit tests.
  def set_flush_interval(interval)
    # stop the existing TimerTask if one is currently running
    @task.shutdown
    # Start a new flush interval
    @task = Concurrent::TimerTask.execute(execution_interval: interval) {flush}
  end

  # Sets the max size (bytes) of the buffer.
  # This should only be used by unit tests.
  def set_buffer_size_max(max)
    @buffer_size_max = max
  end
end
