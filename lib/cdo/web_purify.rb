require 'open-uri'
require 'json'
require 'dynamic_config/gatekeeper'
require_relative '../../pegasus/src/env'

module WebPurify
  ISO_639_1_TO_WEBPURIFY = {
    'es' => 'sp',
    'ko' => 'kr',
    'ja' => 'jp'
  }.freeze

  # Returns the all profanities in text (if any) or nil (if none).
  # @param [String] text The text to search for profanity within.
  # @param [Array[String]] language_codes The set of languages to search for profanity in.
  # @return [Array<String>, nil] The profanities (if any) or nil (if none).
  def self.find_potential_profanities(text, language_codes = ['en'])
    return nil unless CDO.webpurify_key && Gatekeeper.allows('webpurify', default: true)
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
    result = JSON.
      parse(
        open(
          url,
          open_timeout: DCDO.get('webpurify_tcp_connect_timeout', 5),
          read_timeout: DCDO.get('webpurify_http_read_timeout', 10)
        ).
        read
      )

    expletive = result['rsp'] && result['rsp']['expletive']
    return nil unless expletive
    expletive.is_a?(Array) ? expletive : [expletive]
  end
end
