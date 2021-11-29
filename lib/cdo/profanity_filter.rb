require 'cdo/web_purify'

class ProfanityFilter
  # List of words that should be allowed only in specific languages.
  #
  # Entries are in the format
  #   foobar: %w(en es)
  # Where the key "foobar" is the word in question,
  # and the value is a list of languages that should allow that word.
  #
  # Words in this list will be blocked for all languages _except_ for those
  # listed along with the word.
  # Words in this list should be added to the allowlist on WebPurify, since we are
  # handling them with our custom code, here. Webpurify credentials are in LastPass.
  LANGUAGE_SPECIFIC_ALLOWLIST = {
    fu: %w(it), # past-tense "to be" in Italian
    fick: %w(sv) # "got" in Swedish
  }

  # Look for profanity in a given text, return the first expletive found
  # or nil if no profanity is found.
  #
  # @param [String] text to check for profanity
  # @param [String] language_code a two-character ISO 639-1 language code ('en').
  #   Will also convert a four-character locale code ('en-US').
  # @return [String, nil] The first instance of profanity (if any) or nil (if none)
  def self.find_potential_profanity(text, language_code)
    expletive = find_potential_profanities(text, language_code)
    expletive.is_a?(Array) ? expletive.first : expletive
  end

  # Look for profanities in a given text, return the expletives found
  # or nil if no profanities are found.
  #
  # @param [String] text to check for profanity
  # @param [String] language_code a two-character ISO 639-1 language code ('en').
  #   Will also convert a four-character locale code ('en-US').
  # @return [Array<String>, nil] The profanities (if any) or nil (if none)
  def self.find_potential_profanities(text, language_code)
    language_code = language(language_code)
    LANGUAGE_SPECIFIC_ALLOWLIST.each do |word, languages|
      next if languages.include? language_code
      r = Regexp.new "\\b#{word}\\b", Regexp::IGNORECASE
      return [word.to_s] if r =~ text
    end
    WebPurify.find_potential_profanities(text, ['en', language_code])
  end

  # Converts a locale ('en-US') to its language ('en').
  #
  # Copied from LocaleHelper (dashboard/app/helpers/locale_helper.rb) as we don't
  # have access to that module in lib/.
  def self.language(code)
    code.to_s.split('-').first
  end
end
