require 'open-uri'
require 'json'
require 'dynamic_config/gatekeeper'
require_relative '../../pegasus/src/env'

module WebPurify
  API_ENDPOINT = URI('http://api1.webpurify.com/services/rest').freeze
  CHARACTER_LIMIT = 30_000
  ISO_639_1_TO_WEBPURIFY = {
    'es' => 'sp',
    'ko' => 'kr',
    'ja' => 'jp'
  }.freeze

  CONNECTION_OPTIONS = {
    read_timeout: DCDO.get('webpurify_http_read_timeout', 10),
    open_timeout: DCDO.get('webpurify_tcp_connect_timeout', 5)
  }

  # Note: If text has a string of text without whitespace longer than CHARACTER_LIMIT,
  # the entire substring will count as one long chunk and be given its own request to WebPurify.
  def self.split_text(text, max_chunk_length = CHARACTER_LIMIT)
    words = text.split(/\s/)
    chunks = []
    current_chunk = ""

    words.each do |word|
      if current_chunk.length + word.length + 1 <= max_chunk_length
        current_chunk += " " unless current_chunk.empty?
        current_chunk += word
      else
        chunks << current_chunk unless current_chunk.empty?
        current_chunk = word
      end
    end

    chunks << current_chunk unless current_chunk.empty?
    chunks
  end

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

    chunks = split_text(text)
    expletives = []
    Net::HTTP.start(API_ENDPOINT.host, API_ENDPOINT.port, CONNECTION_OPTIONS) do |http|
      chunks.each do |chunk|
        request = Net::HTTP::Post.new(API_ENDPOINT)
        form_data = [
          ['api_key', CDO.webpurify_key],
          ['format', 'json'],
          ['lang', language_codes],
          ['method', 'webpurify.live.return'],
          ['text', chunk]
        ]
        request.set_form form_data, 'multipart/form-data'

        response = http.request(request)

        next if !response.is_a?(Net::HTTPSuccess)
        result = JSON.parse(response.body)
        if result.key?('rsp') && result['rsp'].key?('expletive')
          expletive = result['rsp']['expletive']
          expletives.concat(expletive.is_a?(Array) ? expletive : [expletive])
        end
      end
    end

    return nil if expletives.empty?
    expletives
  end
end
