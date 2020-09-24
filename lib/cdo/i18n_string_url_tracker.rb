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

    url = I18nStringUrlTracker.normalize_url(url)
    return unless string_key && url && source

    # record the string : url association.
    FirehoseClient.instance.put_record(
      :i18n,
      {url: url, string_key: string_key, source: source}
    )
  end

  def self.normalize_url(url)
    return unless url

    parsed_url = URI(url)

    # strip query string
    parsed_url.query = nil

    # strip anchor tags
    parsed_url.fragment = nil

    # Aggregate /projects/<project_type>/<project_id> URLs because each project URL will have a unique identifier
    # converts 'https://studio.code.org/projects/flappy/zjiufOp0h-9GS-DywevS0d3tKJyjdbQZZqZVaiuAjiU/view'
    # into 'https://studio.code.org/projects/flappy'
    # Regex explanation:
    # \/projects\/ - The first major hint this this is a project URL is '/projects/' in the URL
    # .*? - This matches the project type and the '?' is included to make the matching is non-greedy. Otherwise it would
    # match to the end of the URL past the project type.
    # (?=\/) - This is a "positive lookahead" for a '/'. We use it so the '/' is not included in the match. Otherwise
    # there would be a trailing '/' in the URL.
    projects_regex = /\/projects\/.*?(?=\/)/
    if parsed_url.path&.match(projects_regex)
      parsed_url.path = parsed_url.path[projects_regex]
    end
    parsed_url.to_s
  end
end
