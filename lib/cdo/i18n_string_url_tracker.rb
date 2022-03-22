require 'cdo/firehose'
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
  # Select a random interval time between the MIN and MAX so we can avoid all the servers flushing data at the same time.
  FLUSH_INTERVAL_MIN = 8.hours
  FLUSH_INTERVAL_MAX = 16.hours

  MAX_BUFFER_SIZE = 250.megabytes

  def initialize
    super
    # A buffer of all the given i18n string tracking data. It will be flushed periodically.
    # It will be in the following form:
    # {
    #   <url>: {
    #     <normalized_key>: [<source>, ...],
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
    interval = rand(FLUSH_INTERVAL_MIN...FLUSH_INTERVAL_MAX)
    @task = Concurrent::TimerTask.execute(execution_interval: interval) {flush}
  end

  # Records the given string_key and URL so we can analyze later what strings are present on what pages.
  # @param url [String] The url which required the translation of the given string_key.
  # @param source [String] Context about where the string lives e.g. 'ruby', 'maze', 'turtle', etc
  # @param string_key [String] The key used to locate the desired string.
  # @param scope [Array|String] Array of strings representing the hierarchy leading up to the string_key. OR
  #                             String with values separated by the separator value.
  # @param separator [String] The separator string used by I18n to concatenate the string_key hierarchy
  #        into a single normalized string.
  def log(url, source, string_key, scope = [], separator = I18n.default_separator)
    # Return if DCDO flag is unset, or we get incomplete info
    return unless DCDO.get(I18N_STRING_TRACKING_DCDO_KEY, false)
    return unless string_key && url && source

    # We got a bad string_key if there is no English source string
    source_string = I18n.t(string_key, locale: I18n.default_locale, tracking: false)
    return if !source_string ||
      (source_string.is_a?(String) && source_string.start_with?("translation missing"))

    # Skip URLs we are not interested in.
    return unless allowed(url)
    url = normalize_url(url)

    # Scope could come in as a normalized string, so make sure it's an array
    scope = scope.split(separator) if scope.is_a? String

    # We use -> as the separator in the normalized_key for ease of searching in Crowdin, and to prevent keys
    # that include a . from getting split in two.
    normalized_key = I18n.normalize_keys(nil, string_key, scope, ' -> ').join(' -> ')

    # Reverse the URL encoding on special characters so the human readable characters are logged.
    logged_url = CGI.unescape(url)

    # Stringify all items in the scope array so we can JSON stringify and parse it.
    stringified_scope = scope&.map(&:to_s).to_s
    add_to_buffer(normalized_key, logged_url, source, string_key.to_s, stringified_scope, separator)
  end

  private

  # Records the log data to a buffer which will eventually be flushed
  def add_to_buffer(normalized_key, url, source, string_key, scope, separator)
    # make sure this is the only thread modifying @buffer
    @buffer.synchronize do
      # update the buffer size if we are adding any new data to it
      # duplicate data will not increase the buffer size
      buffer_url = @buffer[url] ||= {}.tap {@buffer_size += url.bytesize}
      buffer_normalized_key = buffer_url[normalized_key] ||= Set.new.tap {@buffer_size += normalized_key.bytesize}
      # add the new data to the buffer
      buffer_values = [source, string_key, scope, separator]

      if buffer_normalized_key.add?(buffer_values)
        buffer_values_size = buffer_values.reduce(0) {|sum, s| sum + (s ? s.bytesize : 0)}
        @buffer_size += buffer_values_size
      end
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

    # If the DCDO flag has changed since data was buffered, we want to clear the buffer and not log/flush the data.
    return unless DCDO.get(I18N_STRING_TRACKING_DCDO_KEY, false)

    # log every <url>:<normalized_key>:<source>:<string_key>:<scope>:<separator> combination to Firehose
    buffer&.each_key do |url|
      buffer[url].each_key do |normalized_key|
        buffer[url][normalized_key].each do |values|
          # record the <url>:<normalized_key>:<source>:<string_key>:<scope>:<separator> association.
          FirehoseClient.instance.put_record(
            :i18n,
            {url: url, normalized_key: normalized_key, source: values[0], string_key: values[1], scope: values[2], separator: values[3]}
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
