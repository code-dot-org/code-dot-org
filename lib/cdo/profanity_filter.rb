require 'cdo/web_purify'

class ProfanityFilter
  # List of languages that Web Purify supports according to
  # https://www.webpurify.com/documentation/additional/language
  WEB_PURIFY_SUPPORTED_LANGUAGES = {
    ar: "Arabic",
    de: "German",
    en: "English",
    es: "Spanish",
    fr: "French",
    hi: "Hindi",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean", # in beta
    pa: "Punjabi", # in beta
    pt: "Portuguese",
    ru: "Russian",
    th: "Thai",
    tr: "Turkish",
    zh: "Chinese (Simplified and Traditional)" # in beta
  }

  # List of words that should be allowed only in specific languages.
  #
  # Entries are in the format
  #   foobar: %w(en es)
  # Where the key "foobar" is the word in question,
  # and the value is a list of languages that should allow that word.
  #
  # Words in this list will be blocked for all languages _except_ for those
  # listed along with the word.
  # Words in this list should be _unblocked_ on WebPurify, since we are
  # handling them with our custom code, here.
  LANGUAGE_SPECIFIC_ALLOWLIST = {
    fu: %w(it), # past-tense "to be" in Italian
    fick: %w(sv) # "got" in Swedish
  }

  # Look for profanities in a given text, return true if any expletive found
  # or false if no profanities found. Checks against all locales.
  #
  # @param [String] text to check for profanity
  # @return [String, nil] The first instance of profanity (if any) or nil (if none)
  def self.find_potential_profanity_in_any_language(text)
    WEB_PURIFY_SUPPORTED_LANGUAGES.each do |language_code|
      expletive = find_potential_profanity(text, language_code)
      break unless expletive.nil?
    end
    expletive
  end

  # Look for profanity in a given text, return the first expletive found
  # or nil if no profanity is found.
  #
  # @param [String] text to check for profanity
  # @param [String] language_code a two-character ISO 639-1 language code
  # @return [String, nil] The first instance of profanity (if any) or nil (if none)
  def self.find_potential_profanity(text, language_code)
    expletive = find_potential_profanities(text, language_code)
    expletive.is_a?(Array) ? expletive.first : expletive
  end

  # Look for profanities in a given text, return all expletives found
  # or nil if no profanities are found.
  #
  # @param [String] text to check for profanities
  # @param [String] language_code a two-character ISO 639-1 language code
  # @return [Array<String>, nil] The profanities (if any) or nil (if none)
  def self.find_potential_profanities(text, language_code)
    LANGUAGE_SPECIFIC_ALLOWLIST.each do |word, languages|
      next if languages.include? language_code
      r = Regexp.new "\\b#{word}\\b", Regexp::IGNORECASE
      return word.to_s if r =~ text
    end
    WebPurify.find_potential_profanities(text, ['en', language_code])
  end
end
