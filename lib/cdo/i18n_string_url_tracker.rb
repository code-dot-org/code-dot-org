require 'cdo/firehose'
require 'dynamic_config/dcdo'

class I18nStringUrlTracker
  include Singleton

  I18N_STRING_TRACKING_DCDO_KEY = 'i18n_string_tracking'.freeze

  # Records the given string_key and URL so we can analyze later what strings are present on what pages.
  # @param string_key [String] The key used to review the translated string from our i18n system.
  # @param url [String] The url which required the translation of the given string_key.
  # @param source [String] Context about where the string lives e.g. 'ruby', 'maze', 'turtle', etc
  def log(string_key, url, source)
    return unless string_key && url && source
    return unless DCDO.get(I18N_STRING_TRACKING_DCDO_KEY, false)

    # record the string : url association.
    FirehoseClient.instance.put_record(
      :i18n,
      {url: url, string_key: string_key, source: source}
    )
  end
end
