class Api::V1::TextToSpeechController < Api::V1::JsonApiController
  include AzureTextToSpeech

  # Allowed number of unique requests per minute before that client is throttled.
  # These values are fallbacks for DCDO-configured values used below.
  REQUEST_LIMIT_PER_MIN_DEFAULT = 100
  REQUEST_LIMIT_PER_MIN_IP = 1000

  # POST /dashboardapi/v1/text_to_speech/azure
  # @param [String] params[:text] Text to convert to speech
  # @param [String] params[:gender] Gender of voice
  # @param [String] params[:locale] I18n locale of voice. Optional. Uses request locale if not provided.
  # @returns [ArrayBuffer] Binary data that can be played as sound in the browser.
  def azure
    id = current_user&.id || session.id
    # Only throttle by IP if no user or session ID is available.
    throttle_ip = id.blank?
    id ||= request.ip
    limit = throttle_ip ?
      DCDO.get('azure_tts_request_limit_per_min_ip', REQUEST_LIMIT_PER_MIN_IP) :
      DCDO.get('azure_tts_request_limit_per_min_default', REQUEST_LIMIT_PER_MIN_DEFAULT)
    period = 60

    AzureTextToSpeech.throttled_get_speech(params[:text], params[:gender], locale, id, limit, period) do |speech_array_buffer|
      if speech_array_buffer.nil_or_empty?
        return head :bad_request
      else
        return send_data speech_array_buffer, type: 'arraybuffer'
      end
    end

    # If we make it here, the request should be throttled.
    head :too_many_requests
  end

  private

  def locale
    params[:locale] || request.locale
  end
end
