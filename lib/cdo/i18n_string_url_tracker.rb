require 'cdo/firehose'
require 'dynamic_config/dcdo'
require 'uri'

class I18nStringUrlTracker
  include Singleton

  I18N_STRING_TRACKING_DCDO_KEY = 'i18n_string_tracking'.freeze

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

    # record the string : url association.
    FirehoseClient.instance.put_record(
      :i18n,
      {url: url, string_key: string_key, source: source}
    )
  end

  private

  # Paths where everything everything will after it will be aggregated.
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
    # Example: https://studio.code.org/s/dance-2019/stage/1/puzzle/1
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
    # converts 'https://studio.code.org/s/dance-2019/stage/1/puzzle/1'
    # into 'https://studio.code.org/s/dance-2019'
    # Regex explanation:
    # (.*\/s\/) - The first major hint this this is a script URL is '/s/' in the URL. The parenthesis around
    # the expression make it a "capture group". Matches a string like "/s/"
    # .*?) - This matches the script name and year, and the '?' is included to make the matching is non-greedy.
    # Otherwise it would match to the end of the URL past the script year. Matches a string like "dance-2019"
    # /\.* - This matches the specific level/puzzle/stage information. This is the part we want to omit. Matches a
    # string like '/stage/1/puzzle/1'
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
end
