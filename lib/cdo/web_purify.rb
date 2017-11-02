require 'open-uri'
require 'json'
require_relative '../../pegasus/src/env'

module WebPurify
  ISO_639_1_TO_WEBPURIFY = {
    'es' => 'sp',
    'ko' => 'kr',
    'ja' => 'jp'
  }.freeze

  # Returns the first instance of profanity in text (if any) or nil (if none).
  # @param [String] text The text to search for profanity within.
  # @param [Array[String]] language_codes The set of languages to search for profanity in.
  # @return [String, nil] The first instance of profanity (if any) or nil (if none).
  def self.find_potential_profanity(text, language_codes = ['en'])
    return nil unless CDO.webpurify_key
    # Convert language codes to a list of two character codes, comma separated.
    language_codes = language_codes.
      map {|language_code| language_code[0..1]}.
      map {|code| ISO_639_1_TO_WEBPURIFY[code] || code}.
      uniq.
      join(',')
    url = "http://api1.webpurify.com/services/rest/" \
      "?api_key=#{CDO.webpurify_key}" \
      "&method=webpurify.live.return" \
      "&text=#{URI.encode(text)}" \
      "&lang=#{language_codes}" \
      "&format=json"
    result = JSON.parse(open(url).read)

    expletive = result['rsp'] && result['rsp']['expletive']
    expletive.is_a?(Array) ? expletive.first : expletive
  end
end
