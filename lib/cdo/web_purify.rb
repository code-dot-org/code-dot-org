require 'net/http'
require 'open-uri'
require 'json'
require 'dynamic_config/gatekeeper'
require_relative '../../pegasus/src/env'

module WebPurify
  # WebPurify limits us to 30,000 characters per request and 4 simultaneous requests per API key
  API_ENDPOINT = URI('http://api1.webpurify.com/services/rest').freeze
  CHARACTER_LIMIT = 30_000
  REQUEST_LIMIT = 4
  CONNECTION_OPTIONS = {
    read_timeout: DCDO.get('webpurify_http_read_timeout', 10),
    open_timeout: DCDO.get('webpurify_tcp_connect_timeout', 5)
  }
  ISO_639_1_TO_WEBPURIFY = {
    'es' => 'sp',
    'ko' => 'kr',
    'ja' => 'jp'
  }.freeze

  class TextTooLongError < StandardError
    attr_reader :text_length

    def initialize(text_length)
      @text_length = text_length
      super
    end
  end

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

    # This is an artificial limit to prevent us from profanity-checking a file up to 5MB (the project size limit)
    # The request limit here happens to be the same as the simultaneous request limit for our WebPurify plan
    # The choice is arbitrary because requests are not currently parallelized, though they could be in the future
    if text.length > CHARACTER_LIMIT * REQUEST_LIMIT
      raise TextTooLongError.new(text.length)
    end

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
        result = JSON.parse(response.body)

        # Check that we can dig for keys here due to edge case where response.body = {"rsp": false}
        status = result["rsp"].respond_to?(:dig) ? result.dig("rsp", "@attributes", "stat") : nil

        if !response.is_a?(Net::HTTPSuccess) || status != "ok"
          message = "Profanity check failed"
          err_code = err_msg = nil

          if result["rsp"].respond_to?(:key?) && result["rsp"].key?("err")
            err_code = result.dig('rsp', 'err', '@attributes', 'code')
            err_msg = result.dig('rsp', 'err', '@attributes', 'msg')
          end

          message += " with code #{err_code}" if err_code
          message += ": #{err_msg}" if err_msg && !err_msg.empty?
          raise StandardError.new(message)
        end

        expletive = result.dig('rsp', 'expletive')
        expletives.concat(expletive.is_a?(Array) ? expletive : [expletive]) if expletive
      end
    end

    return nil if expletives.empty?
    expletives
  end
end
