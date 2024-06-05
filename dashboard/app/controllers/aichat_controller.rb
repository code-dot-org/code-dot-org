ROLES_FOR_MODEL = %w(assistant user).freeze

class AichatController < ApplicationController
  include AichatSagemakerHelper
  authorize_resource class: false

  # params are
  # newMessage: ChatCompletionMessage
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; content: string} - does not include user's new message
  # aichatModelCustomizations: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # aichatContext: {currentLevelId: number; scriptId: number; channelId: string;}
  # POST /aichat/chat_completion
  def chat_completion
    return render status: :forbidden, json: {} unless AichatSagemakerHelper.can_request_aichat_chat_completion?
    unless has_required_params?
      return render status: :bad_request, json: {}
    end

    response_body = get_response_body
    response_body[:session_id] = log_chat_session(response_body[:messages])
    render(status: :ok, json: response_body)
  end

  private def get_response_body
    # Check for profanity
    locale = params[:locale] || "en"
    filter_result = ShareFiltering.find_failure(params[:newMessage][:chatMessageText], locale)
    if filter_result&.type == ShareFiltering::FailureType::PROFANITY
      messages = [
        get_user_message(SharedConstants::AI_INTERACTION_STATUS[:PROFANITY_VIOLATION])
      ]

      return {
        messages: messages,
        flagged_content: filter_result.content,
      }
    end

    messages_for_model = params.to_unsafe_h[:storedMessages].filter do |message|
      message[:status] == SharedConstants::AI_INTERACTION_STATUS[:OK] &&
        ROLES_FOR_MODEL.include?(message[:role])
    end

    # Use to_unsafe_h here to allow testing this function.
    # Safe params are primarily targeted at preventing "mass assignment vulnerability"
    # which isn't relevant here.
    input = AichatSagemakerHelper.format_inputs_for_sagemaker_request(
      params.to_unsafe_h[:aichatModelCustomizations],
      messages_for_model,
      params.to_unsafe_h[:newMessage]
    )
    sagemaker_response = AichatSagemakerHelper.request_sagemaker_chat_completion(input, params[:aichatModelCustomizations][:selectedModelId])
    latest_assistant_response = AichatSagemakerHelper.get_sagemaker_assistant_response(sagemaker_response)

    filter_result = ShareFiltering.find_failure(latest_assistant_response, locale)
    if filter_result&.type == ShareFiltering::FailureType::PROFANITY
      messages = [
        get_user_message(SharedConstants::AI_INTERACTION_STATUS[:ERROR]),
        {
          role: "assistant",
          status: SharedConstants::AI_INTERACTION_STATUS[:ERROR],
          chatMessageText: '[profane]',
        }
      ]

      Honeybadger.notify(
        'Profanity returned from aichat model (blocked before reaching student)',
        context: {
          model_response: latest_assistant_response,
          flagged_content: filter_result.content,
          aichat_session_id: session_id
        }
      )

      return {messages: messages}
    end

    assistant_message = {
      role: "assistant",
      status: SharedConstants::AI_INTERACTION_STATUS[:OK],
      chatMessageText: latest_assistant_response,
    }

    messages = [
      get_user_message(SharedConstants::AI_INTERACTION_STATUS[:OK]),
      assistant_message
    ]
    {messages: messages}
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

    if context[:channelId]
      _, project_id = storage_decrypt_channel_id(context[:channelId])
      if session.project_id != project_id
        return false
      end
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

    project_id = nil
    if context[:channelId]
      _, project_id = storage_decrypt_channel_id(context[:channelId])
    end

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

  private def get_user_message(status)
    params[:newMessage].merge({status: status})
  end
end
