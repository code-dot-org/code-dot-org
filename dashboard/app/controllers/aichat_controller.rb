class AichatController < ApplicationController
  authorize_resource class: false
  # params are
  # newMessage: string
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; content: string} - does not include user's new message
  # aichatParameters: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # chatContext: {userId: number; currentLevelId: string; scriptId: number; channelId: string;}
  # POST /aichat/chat_completion
  def chat_completion
    return render status: :forbidden, json: {} unless can_request_aichat_chat_completion?
    unless has_required_params?
      return render status: :bad_request, json: {}
    end

    # Check for PII / Profanity
    # Copied from ai_tutor_interactions_controller.rb - not sure if filtering is working.
    locale = params[:locale] || "en"
    new_message_text = params[:newMessage]
    # Check only the newest message from the user for inappropriate content.
    filter_result = ShareFiltering.find_failure(new_message_text, locale) if new_message_text
    # If the content is inappropriate, we skip sending to endpoint and instead hardcode a warning response on the front-end.
    return render(status: :ok, json: {status: filter_result.type, flagged_content: filter_result.content}) if filter_result
    # TODO: Format input to send to Sagemaker.
    payload = {
      message: new_message_text
    }
    response = request_chat_completion(payload)
    render(status: response[:status], json: response[:json])
  end

  def request_chat_completion(payload)
    response_body = {role: "assistant", content: "This is an assistant response from Sagemaker"}
    response_code = 200
    return {status: response_code, json: response_body}
  end

  private def can_request_aichat_chat_completion?
    DCDO.get('aichat_chat_completion', true)
  end

  private def has_required_params?
    begin
      params.require([:newMessage, :aichatParameters, :chatContext])
    rescue ActionController::ParameterMissing
      return false
    end
    true
  end
end
