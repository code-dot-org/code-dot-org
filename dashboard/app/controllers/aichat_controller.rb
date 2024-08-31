require 'cdo/throttle'

AICHAT_PREFIX = "aichat/".freeze
DEFAULT_REQUEST_LIMIT_PER_MIN = 50
DEFAULT_POLLING_INTERVAL_MS = 1000
DEFAULT_POLLING_BACKOFF_RATE = 1.2

class AichatController < ApplicationController
  include AichatSagemakerHelper
  authorize_resource class: false

  rescue_from CanCan::AccessDenied do
    render status: :forbidden, json: {user_type: current_user&.user_type || 'signed_out'}
  end

  # POST /aichat/start_chat_completion
  # Initiate a chat completion request, which is performed asynchronously as an ActiveJob.
  # Returns the ID of the request and a base polling interval + backoff rate.
  # params are
  # newMessage: {role: 'user'; chatMessageText: string; status: string}
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; chatMessageText: string; status: string} - does not include user's new message
  # aichatModelCustomizations: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # aichatContext: {currentLevelId: number; scriptId: number; channelId: string;}
  def start_chat_completion
    return head :too_many_requests if should_throttle?
    return render status: :forbidden, json: {} unless AichatSagemakerHelper.can_request_aichat_chat_completion?
    unless chat_completion_has_required_params?
      return render status: :bad_request, json: {}
    end

    # Filter out non-OK messages (e.g. errors)
    messages_for_model = params[:storedMessages].select {|message| message[:status] == SharedConstants::AI_INTERACTION_STATUS[:OK]}
    context = params[:aichatContext]

    # Create the request object
    begin
      request = AichatRequest.create!(
        user_id: current_user.id,
        model_customizations: params[:aichatModelCustomizations].to_json,
        stored_messages: messages_for_model.to_json,
        new_message: params[:newMessage].to_json,
        level_id: context[:currentLevelId],
        script_id: context[:scriptId],
        project_id: get_project_id(context)
      )
    rescue StandardError => exception
      return render status: :bad_request, json: {error: exception.message}
    end

    # Start the job
    locale = params[:locale] || "en"
    AichatRequestChatCompletionJob.perform_later(request: request, locale: locale)

    # Return the request ID, polling interval, and backoff rate
    response_body = {
      requestId: request.id,
      pollingIntervalMs: get_polling_interval_ms,
      backoffRate: get_backoff_rate
    }
    render(status: :ok, json: response_body)
  end

  # GET /aichat/chat_request/:id
  # Get the chat completion request status and response for the given ID.
  def chat_request
    begin
      request = AichatRequest.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: {}
    end

    # Only the user who initiated the request can view the response and status
    return render status: :forbidden, json: {} if request.user_id != current_user.id

    response_body = {
      executionStatus: request.execution_status,
      response: request.response
    }
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

    aichat_events = AichatEvent.where(user_id: student_user_id, level_id: level_id, script_id: script_id).order(:created_at).pluck(:aichat_event).map do |event|
      JSON.parse(event)
    end
    render json: aichat_events
  end

  def check_message_safety
    string_to_check = params[:message]
    response_body = AichatSafetyHelper.get_llmguard_response(string_to_check)
    render(status: :ok, json: response_body)
  end

  # GET /aichat/user_has_aichat_access
  def user_has_aichat_access
    render(status: :ok, json: {user_has_aichat_access: current_user&.has_aichat_access?})
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

  private def get_polling_interval_ms
    DCDO.get("aichat_polling_interval_ms", DEFAULT_POLLING_INTERVAL_MS)
  end

  private def get_backoff_rate
    DCDO.get("aichat_polling_backoff_rate", DEFAULT_POLLING_BACKOFF_RATE)
  end

  private def get_project_id(context)
    if context[:channelId]
      _, project_id = storage_decrypt_channel_id(context[:channelId])
      project_id
    end
  end

  private def should_throttle?
    id = current_user&.id || session.id
    limit = DCDO.get('aichat_request_limit_per_min', DEFAULT_REQUEST_LIMIT_PER_MIN)
    Cdo::Throttle.throttle(AICHAT_PREFIX + id.to_s, limit, 60)
  end
end
