class AichatController < ApplicationController
  include AichatSagemakerHelper
  authorize_resource class: false

  # params are
  # newMessage: string
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; content: string} - does not include user's new message
  # aichatModelCustomizations: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # aichatContext: {userId: number; currentLevelId: string; scriptId: number; channelId: string;}
  # POST /aichat/chat_completion
  def chat_completion
    return render status: :forbidden, json: {} unless AichatSagemakerHelper.can_request_aichat_chat_completion?
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

    input_json = AichatSagemakerHelper.format_inputs_for_sagemaker_request(params[:aichatModelCustomizations], params[:storedMessages], params[:newMessage])
    sagemaker_response = AichatSagemakerHelper.request_sagemaker_chat_completion(input_json)
    latest_assistant_response = AichatSagemakerHelper.get_sagemaker_assistant_response(sagemaker_response)
    payload = {
      role: "assistant",
      content: latest_assistant_response
    }
    return render(status: :ok, json: payload.to_json)
  end

  def has_required_params?
    begin
      params.require([:newMessage, :aichatModelCustomizations, :aichatContext])
    rescue ActionController::ParameterMissing
      return false
    end
    # It is possible that storedMessages is an empty array.
    # If so, the above require check will not pass.
    # Check storedMessages param separately.
    params[:storedMessages].is_a?(Array)
  end
end
