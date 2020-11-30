class Api::V1::TextToSpeechController < Api::V1::JsonApiController
  include AzureTextToSpeech

  # POST /dashboardapi/v1/text_to_speech/azure
  # @param [String] params[:text] Text to convert to speech
  # @param [String] params[:gender] Gender of voice
  # @param [String] params[:locale] I18n locale of voice. Optional. Uses request locale if not provided.
  # @returns [ArrayBuffer] Binary data that can be played as sound in the browser.
  def azure
    speech_array_buffer = AzureTextToSpeech.get_speech(params[:text], params[:gender], locale)
    if speech_array_buffer.nil_or_empty?
      return head :bad_request
    else
      send_data speech_array_buffer, type: 'arraybuffer'
    end
  end

  private

  def locale
    params[:locale] || request.locale
  end
end
