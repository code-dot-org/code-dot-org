class AichatController < ApplicationController
  include AichatHelper
  authorize_resource class: false

  # params are
  # newMessage: string
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; content: string} - does not include user's new message
  # aichatParameters: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # chatContext: {userId: number; currentLevelId: string; scriptId: number; channelId: string;}
  # POST /aichat/chat_completion
  def chat_completion
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

    input_json = AichatHelper.format_inputs_for_sagemaker_request(params[:aichatParameters], params[:storedMessages], params[:newMessage])
    sagemaker_response = AichatHelper.request_sagemaker_chat_completion(input_json)
    parsed_response = JSON.parse(sagemaker_response.body.string)
    generated_text = parsed_response[0]["generated_text"]
    parts = generated_text.split("[/INST]")
    latest_assistant_response = parts.last

    payload = {
      role: "assistant",
      content: latest_assistant_response
    }
    return render(status: :ok, json: payload.to_json)
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
