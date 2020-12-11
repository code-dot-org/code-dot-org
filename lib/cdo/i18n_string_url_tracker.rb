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

    url = normalize_url(url)
    return unless string_key && url && source

    # record the string : url association.
    FirehoseClient.instance.put_record(
      :i18n,
      {url: url, string_key: string_key, source: source}
    )
  end

  private

  def normalize_url(url)
    return unless url

    parsed_url = URI(url)

    # strip query string
    parsed_url.query = nil

    # strip anchor tags
    parsed_url.fragment = nil

    # Aggregate /projects/<project_type>/<project_id> URLs because each project URL will have a unique identifier
    # converts 'https://studio.code.org/projects/flappy/zjiufOp0h-9GS-DywevS0d3tKJyjdbQZZqZVaiuAjiU/view'
    # into 'https://studio.code.org/projects/flappy/view'
    # Regex explanation:
    # (.*\/projects\/) - The first major hint this this is a project URL is '/projects/' in the URL. The parenthesis around
    # the expression make it a "capture group". Matches a string like "https://code.org/projects/"
    # .*?\/ - This matches the project type and the '?' is included to make the matching is non-greedy. Otherwise it would
    # match to the end of the URL past the project type. Matches a string like "maze/"
    # .*?\/ - This matches the unique project ID. This is the part we want to omit. Matches a string like
    # "zjiufOp0h-9GS-DywevS0d3tKJyjdbQZZqZVaiuAjiU/"
    # (.*) - This matches the rest of the path. The parenthesis around the expression make it a "capture group". Matches
    # a string like "view".
    projects_regex = /(.*\/projects\/.*?\/).*?\/(.*)/
    parsed_url.path&.match(projects_regex) do |m|
      # capture group m[1] is the part of the URL before the project ID.
      # capture group m[2] is the part of the URL after the project ID.
      parsed_url.path = m[1] + m[2]
    end
    parsed_url.to_s
  end
end
