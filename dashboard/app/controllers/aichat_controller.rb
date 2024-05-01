class AichatController < ApplicationController
  include AichatSagemakerHelper
  authorize_resource class: false

  # params are
  # newMessage: string
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; content: string} - does not include user's new message
  # aichatModelCustomizations: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # aichatContext: {currentLevelId: number; scriptId: number; channelId: string;}
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
    sagemaker_response = AichatSagemakerHelper.request_sagemaker_chat_completion(input_json, params[:aichatModelCustomizations][:selectedModelId])
    latest_assistant_response = AichatSagemakerHelper.get_sagemaker_assistant_response(sagemaker_response)
    assistant_message = {
      role: "assistant",
      content: latest_assistant_response,
    }

    session_id = log_chat_session(assistant_message)
    return render(status: :ok, json: assistant_message.merge({sessionId: session_id}).to_json)
  end

  private def has_required_params?
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

  private def log_chat_session(assistant_message)
    if params[:sessionId].present?
      session_id = params[:sessionId]
      session = AichatSession.find_by(id: session_id)
      if session && matches_existing_session?(session)
        return update_session(session, assistant_message)
      end
    end

    create_session(assistant_message)
  end

  private def matches_existing_session?(session)
    context = params[:aichatContext]
    if session.level_id != context[:currentLevelId] ||
        session.script_id != context[:scriptId] ||
        current_user.id != session.user_id
      return false
    end

    _, project_id = storage_decrypt_channel_id(context[:channelId])
    if session.project_id != project_id
      return false
    end

    if params[:aichatModelCustomizations] != JSON.parse(session.model_customizations) ||
        params[:storedMessages] != JSON.parse(session.messages)
      return false
    end

    true
  end

  private def update_session(session, assistant_message)
    session.messages = updated_message_list(assistant_message).to_json
    session.save

    session.id
  end

  private def create_session(assistant_message)
    context = params[:aichatContext]
    _, project_id = storage_decrypt_channel_id(context[:channelId])

    AichatSession.create(
      user_id: current_user.id,
      level_id: context[:currentLevelId],
      script_id: context[:scriptId],
      project_id: project_id,
      model_customizations: params[:aichatModelCustomizations].to_json,
      messages: updated_message_list(assistant_message).to_json
    ).id
  end

  private def updated_message_list(assistant_message)
    [
      *params[:storedMessages],
      {role: 'user', content: params[:newMessage]},
      assistant_message
    ]
  end
end
