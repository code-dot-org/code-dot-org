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

    # Check for profanity
    locale = params[:locale] || "en"
    filter_result = ShareFiltering.find_failure(params[:newMessage], locale)
    if filter_result&.type == ShareFiltering::FailureType::PROFANITY
      new_messages = [
        {
          role: 'user',
          content: params[:newMessage],
          status: SharedConstants::AI_INTERACTION_STATUS[:PROFANITY_VIOLATION]
        }
      ]
      session_id = log_chat_session(new_messages)
      return render(
        status: :ok,
        json: {
          status: SharedConstants::AICHAT_ERROR_TYPE[:PROFANITY_USER],
          flagged_content: filter_result.content,
          session_id: session_id
        }
      )
    end

    # Use to_unsafe_h here to allow testing this function.
    # Safe params are primarily targeted at preventing "mass assignment vulnerability"
    # which isn't relevant here.
    input = AichatSagemakerHelper.format_inputs_for_sagemaker_request(
      params.to_unsafe_h[:aichatModelCustomizations],
      params.to_unsafe_h[:storedMessages].filter {|message| message[:status] == SharedConstants::AI_INTERACTION_STATUS[:OK]},
      params.to_unsafe_h[:newMessage]
    )
    sagemaker_response = AichatSagemakerHelper.request_sagemaker_chat_completion(input, params[:aichatModelCustomizations][:selectedModelId])
    latest_assistant_response = AichatSagemakerHelper.get_sagemaker_assistant_response(sagemaker_response)

    filter_result = ShareFiltering.find_failure(latest_assistant_response, locale)
    if filter_result&.type == ShareFiltering::FailureType::PROFANITY
      new_messages = [
        {
          role: 'user',
          content: params[:newMessage],
          status: SharedConstants::AI_INTERACTION_STATUS[:ERROR]
        }
      ]
      session_id = log_chat_session(new_messages)

      Honeybadger.notify(
        'Profanity returned from aichat model (blocked before reaching student)',
        context: {
          model_response: latest_assistant_response,
          flagged_content: filter_result.content,
          aichat_session_id: session_id
        }
      )
      return render(
        status: :ok,
        json: {
          status: SharedConstants::AICHAT_ERROR_TYPE[:PROFANITY_MODEL],
          session_id: session_id
        }
      )
    end

    assistant_message = {role: "assistant", content: latest_assistant_response, status: SharedConstants::AI_INTERACTION_STATUS[:OK]}
    new_messages = [
      {role: 'user', content: params[:newMessage], status: SharedConstants::AI_INTERACTION_STATUS[:OK]},
      assistant_message,
    ]
    session_id = log_chat_session(new_messages)

    render(status: :ok, json: assistant_message.merge({session_id: session_id}).to_json)
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

  private def log_chat_session(new_messages)
    if params[:sessionId].present?
      session_id = params[:sessionId]
      session = AichatSession.find_by(id: session_id)
      if session && matches_existing_session?(session)
        return update_session(session, new_messages)
      end
    end

    create_session(new_messages)
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

  private def update_session(session, new_messages)
    session.messages = updated_message_list(new_messages).to_json
    session.save
    session.id
  end

  private def create_session(new_messages)
    context = params[:aichatContext]
    _, project_id = storage_decrypt_channel_id(context[:channelId])

    AichatSession.create(
      user_id: current_user.id,
      level_id: context[:currentLevelId],
      script_id: context[:scriptId],
      project_id: project_id,
      model_customizations: params[:aichatModelCustomizations].to_json,
      messages: updated_message_list(new_messages).to_json
    ).id
  end

  private def updated_message_list(new_messages)
    params[:storedMessages] + new_messages
  end
end
