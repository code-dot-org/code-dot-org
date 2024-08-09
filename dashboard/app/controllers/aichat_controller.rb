ROLES_FOR_MODEL = %w(assistant user).freeze

class AichatController < ApplicationController
  include AichatSagemakerHelper
  authorize_resource class: false

  # params are
  # newMessage: {role: 'user'; chatMessageText: string; status: string}
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; chatMessageText: string; status: string} - does not include user's new message
  # aichatModelCustomizations: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # aichatContext: {currentLevelId: number; scriptId: number; channelId: string;}
  # POST /aichat/chat_completion
  def chat_completion
    return render status: :forbidden, json: {} unless AichatSagemakerHelper.can_request_aichat_chat_completion?
    unless chat_completion_has_required_params?
      return render status: :bad_request, json: {}
    end

    response_body = get_response_body

    render(status: :ok, json: response_body)
  end

  # params are newChatEvent: ChatEvent, aichatContext: {currentLevelId: number; scriptId: number; channelId: string;}
  # POST /aichat/log_chat_event
  def log_chat_event
    begin
      params.require([:newChatEvent, :aichatContext])
    rescue ActionController::ParameterMissing
      return render status: :bad_request, json: {}
    end

    context = params[:aichatContext]
    event = params[:newChatEvent]

    project_id = nil
    if context[:channelId]
      _, project_id = storage_decrypt_channel_id(context[:channelId])
    end

    begin
      logged_event = AichatEvent.create!(
        user_id: current_user.id,
        level_id: context[:currentLevelId],
        script_id: context[:scriptId],
        project_id: project_id,
        aichat_event: event.to_json
      )
    rescue StandardError => exception
      return render status: :bad_request, json: {error: exception.message}
    end

    response_body = {
      chat_event_id: logged_event.id,
      chat_event: logged_event.aichat_event
    }

    render(status: :ok, json: response_body)
  end

  def check_message_safety
    string_to_check = params[:message]
    response_body = AichatSafetyHelper.get_llmguard_response(string_to_check)
    render(status: :ok, json: response_body)
  end

  private def get_response_body
    # Check for profanity
    locale = params[:locale] || "en"
    filter_result = ShareFiltering.find_profanity_failure(params[:newMessage][:chatMessageText], locale)
    if filter_result&.type == ShareFiltering::FailureType::PROFANITY
      messages = [
        get_user_message(SharedConstants::AI_INTERACTION_STATUS[:PROFANITY_VIOLATION])
      ]

      return {
        messages: messages,
        flagged_content: filter_result.content,
      }
    end

    messages_for_model = params[:storedMessages].filter do |message|
      message[:status] == SharedConstants::AI_INTERACTION_STATUS[:OK] &&
        ROLES_FOR_MODEL.include?(message[:role])
    end

    latest_assistant_response_from_sagemaker = AichatSagemakerHelper.get_sagemaker_assistant_response(params[:aichatModelCustomizations], messages_for_model, params[:newMessage])

    filter_result = ShareFiltering.find_profanity_failure(latest_assistant_response_from_sagemaker, locale)
    if filter_result&.type == ShareFiltering::FailureType::PROFANITY
      messages = [
        get_user_message(SharedConstants::AI_INTERACTION_STATUS[:ERROR]),
        {
          role: "assistant",
          status: SharedConstants::AI_INTERACTION_STATUS[:ERROR],
          chatMessageText: '[redacted - model generated profanity]',
        }
      ]

      Honeybadger.notify(
        'Profanity returned from aichat model (blocked before reaching student)',
        context: {
          model_response: latest_assistant_response_from_sagemaker,
          flagged_content: filter_result.content,
        }
      )

      return {messages: messages}
    end

    assistant_message = {
      role: "assistant",
      status: SharedConstants::AI_INTERACTION_STATUS[:OK],
      chatMessageText: latest_assistant_response_from_sagemaker,
    }

    messages = [
      get_user_message(SharedConstants::AI_INTERACTION_STATUS[:OK]),
      assistant_message
    ]
    {messages: messages}
  end

  private def chat_completion_has_required_params?
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

  private def get_user_message(status)
    params[:newMessage].merge({status: status})
  end
end
