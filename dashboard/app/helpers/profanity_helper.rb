require 'digest/md5'
require 'cdo/throttle'

module ProfanityHelper
  PROFANITY_PREFIX = "profanity/".freeze

  # If the given id is not throttled, cache the response from ProfanityFilter and yield the result to a block.
  # @param [String] text
  # @param [String] locale
  # @param [String] id - Unique identifier for throttling.
  # @param [Integer] limit - Number of requests allowed over period.
  # @param [Integer] period - Period of time in seconds.
  def self.throttled_find_profanities(text, locale, id, limit, period)
    return yield(nil) if text.nil_or_empty?
    key = cache_key(text, locale)
    return yield(CDO.shared_cache.read(key)) if CDO.shared_cache.exist?(key)
    return if Cdo::Throttle.throttle(PROFANITY_PREFIX + id.to_s, limit, period)

    profanities = ProfanityFilter.find_potential_profanities(text, locale)
    CDO.shared_cache.write(key, profanities)
    yield(profanities)
  end

  def self.cache_key(text, locale)
    # Hash text in cache_key to avoid long cache keys.
    PROFANITY_PREFIX + "#{locale}/#{Digest::MD5.hexdigest(text)}"
  end
end
