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

  WEBPURIFY_URL = URI('http://api1.webpurify.com/services/rest').freeze

  CONNECTION_OPTIONS = {
    read_timeout: DCDO.get('webpurify_http_read_timeout', 10),
    open_timeout: DCDO.get('webpurify_tcp_connect_timeout', 5)
  }

  # Returns the all profanities in text (if any) or nil (if none).
  # @param [String] text The text to search for profanity within.
  # @param [Array[String]] language_codes The set of languages to search for profanity in.
  # @return [Array<String>, nil] The profanities (if any) or nil (if none).
  def self.find_potential_profanities(text, language_codes = ['en'])
    return nil unless CDO.webpurify_key && Gatekeeper.allows('webpurify', default: true)
    return nil if text.nil?
    # Convert language codes to a list of two character codes, comma separated.
    language_codes = language_codes.
      map {|language_code| language_code[0..1]}.
      map {|code| ISO_639_1_TO_WEBPURIFY[code] || code}.
      uniq.
      join(',')

    form_data = [
      ['api_key', CDO.webpurify_key],
      ['format', 'json'],
      ['lang', language_codes],
      ['method', 'webpurify.live.return'],
      ['text', text]
    ]

    response = Net::HTTP.start(WEBPURIFY_URL.host, WEBPURIFY_URL.port, CONNECTION_OPTIONS) do |http|
      request = Net::HTTP::Post.new(WEBPURIFY_URL)
      request.set_form form_data, 'multipart/form-data'
      http.request(request)
    end

    body = JSON.parse(response.read_body)
    expletive = body['rsp'] && body['rsp']['expletive']
    return nil unless expletive
    expletive.is_a?(Array) ? expletive : [expletive]
  end
end
