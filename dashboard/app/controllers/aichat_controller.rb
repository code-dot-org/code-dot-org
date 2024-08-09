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
    response_body[:session_id] = log_chat_session(response_body[:messages])

    # Rails controller tests reuse the same controller instance across requests within a test,
    # which causes tests to fail. Nulling out the session ID before responding fixes this issue.
    # More detail/other confused developers here: https://github.com/rails/rails/issues/24566
    @session_id = nil
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

  # params are studentUserId: number, levelId: number, scriptId: number, (optional) scriptLevelId: number
  # GET /aichat/student_chat_history
  def student_chat_history
    # Request all chat events for a student at a given level/script.
    begin
      params.require([:studentUserId, :levelId, :scriptId])
    rescue ActionController::ParameterMissing
      return render status: :bad_request, json: {}
    end

    # If a script level ID is provided, ensure it matches the level ID or that
    # the level is a sublevel of the script level.
    script_id = params[:scriptId]
    level_id = params[:levelId]
    level = Level.find(level_id)
    script_level_id = params[:scriptLevelId]
    if script_level_id
      script_level = ScriptLevel.cache_find(script_level_id.to_i)
      same_level = script_level.oldest_active_level.id == level_id
      is_sublevel = ParentLevelsChildLevel.exists?(child_level_id: level_id, parent_level_id: script_level.oldest_active_level.id)
      return render(status: :forbidden, json: {error: "Access denied."}) unless same_level || is_sublevel
    else
      script_level = level.script_levels.find_by_script_id(script_id)
    end

    # Ensure that we have permission to view student's chat events, i.e., student is in teacher section.
    student_user_id = params[:studentUserId]
    user = User.find(student_user_id)
    unless can?(:view_as_user, script_level, user)
      return render(status: :forbidden, json: {error: "Access denied for student chat history."})
    end

    aichat_events = AichatEvent.where(user_id: student_user_id, level_id: level_id, script_id: script_id).order(created_at: :desc).pluck(:aichat_event)
    render json: aichat_events
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
          aichat_session_id: log_chat_session(messages)
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

  private def log_chat_session(new_messages)
    # Allows us to create/update a new session when we log to Honeybadger
    # and reuse it when we respond to the client.
    return @session_id if @session_id

    if params[:sessionId].present?
      session_id = params[:sessionId]
      session = AichatSession.find_by(id: session_id)
      if session && matches_existing_session?(session)
        @session_id = update_session(session, new_messages)
        return @session_id
      end
    end

    @session_id = create_session(new_messages)
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

    if params[:aichatModelCustomizations] != JSON.parse(session.model_customizations)
      return false
    end

    # Compare stored messages in sessions table with stored message from front-end
    # for the following fields only: chatMessageText, role, and status.
    sessions_stored_messages = JSON.parse(session.messages).map {|message| message.slice('chatMessageText', 'role', 'status')}
    frontend_stored_messages = params[:storedMessages].map {|message| message.slice('chatMessageText', 'role', 'status')}
    if sessions_stored_messages != frontend_stored_messages
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
