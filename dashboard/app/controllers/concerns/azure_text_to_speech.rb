require 'cdo/honeybadger'
require 'cdo/languages'
require 'net/http'
require 'dynamic_config/gatekeeper'

module AzureTextToSpeech
  # Azure authentication token is valid for 10 minutes, so cache it for 9.
  # https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#authentication
  TOKEN_CACHE_TTL = 9.minutes.freeze

  # Requests an authentication token from Azure, or returns the cached token if still valid.
  def self.get_token
    return nil unless allowed?

    Rails.cache.fetch("azure_speech_service/token", expires_in: TOKEN_CACHE_TTL) do
      token_uri = URI.parse("https://#{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken")
      token_http_request = Net::HTTP.new(token_uri.host, token_uri.port)
      token_http_request.use_ssl = true
      token_http_request.verify_mode = OpenSSL::SSL::VERIFY_PEER
      # TODO: Change read_timeout to write_timeout when we upgrade to Ruby 2.6+.
      token_http_request.read_timeout = timeout
      token_request = Net::HTTP::Post.new(token_uri.request_uri, {'Ocp-Apim-Subscription-Key': api_key})

      token_http_request.request(token_request)&.body
    end
  rescue => e
    Honeybadger.notify(e, error_message: 'Request for authentication token from Azure Speech Service failed')
    nil
  end

  # Requests the list of voices from Azure. Only returns voices that are available in 2+ genders.
  def self.get_voices
    return nil unless allowed?
    token = get_token
    return nil if token.nil_or_empty?

    Rails.cache.fetch("azure_speech_service/voices") do
      voice_uri = URI.parse("https://#{region}.tts.speech.microsoft.com/cognitiveservices/voices/list")
      voice_http_request = Net::HTTP.new(voice_uri.host, voice_uri.port)
      voice_http_request.use_ssl = true
      voice_http_request.verify_mode = OpenSSL::SSL::VERIFY_PEER
      voice_http_request.read_timeout = timeout
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
        voice_dictionary[native_name_s]["languageCode"] ||= voice["Locale"]
      end

      # Only keep voices that contain 2+ genders and a languageCode
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

  def self.timeout
    DCDO.get('azure_speech_service_timeout', 5)
  end
end
