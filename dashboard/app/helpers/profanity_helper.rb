require 'digest/md5'

module ProfanityHelper
  # Uses ProfanityFilter to find any profanities in the given text + locale. Caches the response.
  # @param [String] text
  # @param [String] locale
  # returns [Array<String>|nil] Array of profane words, if any are found.
  def find_profanities(text, locale)
    return nil if text.nil_or_empty?
    # Hash text in cache_key to avoid long cache keys.
    cache_key = "profanity/#{locale}/#{Digest::MD5.hexdigest(text)}"
    Rails.cache.fetch(cache_key) {ProfanityFilter.find_potential_profanities(text, locale)}
  end
end
