require 'cdo/web_purify'

class ProfanityFilter
  # Look for profanity in a given text, return the first expletive found
  # or nil if no profanity is found.
  #
  # @param [String] text to check for profanity
  # @param [String] language_code a two-character ISO 639-1 language code
  def self.find_potential_profanity(text, language_code)
    return 'fu' if /\bfu\b/i =~ text && language_code != 'it'
    return 'fick' if /\bfick\b/i =~ text && language_code != 'sv'
    WebPurify.find_potential_profanity(text, ['en', language_code])
  end
end
