require 'cdo/honeybadger'
require 'cdo/languages'
require 'net/http'
require 'dynamic_config/gatekeeper'
require 'cdo/throttle'

module AzureTextToSpeech
  # Azure authentication token is valid for 10 minutes, so cache it for 9.
  # https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#authentication
  TOKEN_CACHE_TTL = 9.minutes.freeze

  AZURE_SERVICE_PREFIX = "azure_speech_service/".freeze
  AZURE_TTS_PREFIX = "azure_tts/".freeze

  # Requests an authentication token from Azure, or returns the cached token if still valid.
  def self.get_token
    return nil unless allowed?

    CDO.shared_cache.fetch(AZURE_SERVICE_PREFIX + "token", expires_in: TOKEN_CACHE_TTL) do
      token_uri = URI.parse("https://#{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken")
      token_http_request = Net::HTTP.new(token_uri.host, token_uri.port)
      token_http_request.use_ssl = true
      token_http_request.verify_mode = OpenSSL::SSL::VERIFY_PEER
      # TODO: Change read_timeout to write_timeout when we upgrade to Ruby 2.6+.
      token_http_request.read_timeout = default_timeout
      token_request = Net::HTTP::Post.new(token_uri.request_uri, {'Ocp-Apim-Subscription-Key': api_key})

      token_http_request.request(token_request)&.body
    end
  rescue => e
    Honeybadger.notify(e, error_message: 'Request for authentication token from Azure Speech Service failed')
    nil
  end

  # Converts text to speech and yields the result to a block unless the request was throttled.
  # This method is throttled because it makes a paid third-party request to Azure.
  # @param [String] text
  # @param [String] gender
  # @param [String] locale - I18n locale.
  # @param [String] id - Unique identifier for throttling.
  # @param [Integer] limit - Number of requests allowed over period.
  # @param [Integer] period - Period of time in seconds.
  def self.throttled_get_speech(text, gender, locale, id, limit, period)
    return if Cdo::Throttle.throttle(AZURE_TTS_PREFIX + id.to_s, limit, period)
    return yield(nil) unless allowed?
    token = get_token
    return yield(nil) if token.nil_or_empty?

    uri = URI.parse("https://#{region}.tts.speech.microsoft.com/cognitiveservices/v1")
    http_request = Net::HTTP.new(uri.host, uri.port)
    http_request.use_ssl = true
    http_request.verify_mode = OpenSSL::SSL::VERIFY_PEER
    http_request.read_timeout = speech_timeout
    headers = {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3'
    }
    request = Net::HTTP::Post.new(uri.request_uri, headers)
    request.body = ssml(text, gender, locale)
    return yield(nil) if request.body.nil_or_empty?

    yield(http_request.request(request)&.body)
  rescue => e
    Honeybadger.notify(e, error_message: 'Request for speech from Azure Speech Service failed')
    yield(nil)
  end

  # Requests the list of voices from Azure. Only returns voices that are available in 2+ genders.
  def self.get_voices
    return nil unless allowed?
    token = get_token
    return nil if token.nil_or_empty?

    CDO.shared_cache.fetch(AZURE_SERVICE_PREFIX + "voices") do
      voice_uri = URI.parse("https://#{region}.tts.speech.microsoft.com/cognitiveservices/voices/list")
      voice_http_request = Net::HTTP.new(voice_uri.host, voice_uri.port)
      voice_http_request.use_ssl = true
      voice_http_request.verify_mode = OpenSSL::SSL::VERIFY_PEER
      voice_http_request.read_timeout = default_timeout
      voice_request = Net::HTTP::Get.new(voice_uri.request_uri, {'Authorization': 'Bearer ' + token})

      response = voice_http_request.request(voice_request)&.body
      voices = response.length > 2 ? JSON.parse(response) : nil
      return nil unless (voices&.length || 0) > 0

      voice_dictionary = {}
      voices.each do |voice|
        native_locale_name = Languages.get_native_name_by_locale(voice["Locale"])
        next if native_locale_name.empty?
        native_name_s = native_locale_name[0][:native_name_s]
        voice_dictionary[native_name_s] ||= {}
        voice_dictionary[native_name_s][voice["Gender"].downcase] ||= voice["ShortName"]
        voice_dictionary[native_name_s]["locale"] ||= voice["Locale"]
      end

      # Only keep voices that contain 2+ genders and a locale
      voice_dictionary.reject {|_, opt| opt.length < 3}
    end
  rescue => e
    Honeybadger.notify(e, error_message: 'Request for list of voices from Azure Speech Service failed')
    nil
  end

  def self.allowed?
    Gatekeeper.allows('azure_speech_service', default: true) && api_key.present? && region.present?
  end

  def self.api_key
    CDO.azure_speech_service_key
  end

  def self.region
    CDO.azure_speech_service_region
  end

  def self.default_timeout
    DCDO.get('azure_speech_service_default_timeout', 5)
  end

  def self.speech_timeout
    DCDO.get('azure_speech_service_tts_timeout', 10)
  end

  def self.get_voice_by(locale, gender)
    voice = get_voices&.values&.find {|v| v["locale"] == locale}
    return nil unless voice.present?
    voice[gender]
  end

  def self.ssml(text, gender, locale)
    voice_name = get_voice_by(locale, gender)
    return nil unless voice_name.present?
    "<speak version='1.0' xmlns='https://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='#{voice_name}'>#{text}</voice></speak>"
  end
end
