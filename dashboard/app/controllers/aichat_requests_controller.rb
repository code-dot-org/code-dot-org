require 'cdo/throttle'

class AichatRequestsController < ApplicationController
  include AichatSagemakerHelper
  authorize_resource class: false

  AICHAT_REQUEST_COUNT_PREFIX = "aichat/requests/".freeze
  DEFAULT_REQUEST_LIMIT_PER_MIN = 50

  DEFAULT_POLLING_INTERVAL_MS = 1000
  DEFAULT_POLLING_BACKOFF_RATE = 1.2

  rescue_from CanCan::AccessDenied do
    render status: :forbidden, json: {user_type: current_user&.user_type || 'signed_out'}
  end

  # POST /aichat_request/start_chat_completion
  # Initiate a chat completion request, which is performed asynchronously as an ActiveJob.
  # Returns the ID of the request and a base polling interval + backoff rate.
  # params are
  # newMessage: {role: 'user'; chatMessageText: string; status: string}
  # storedMessages: Array of {role: <'user', 'system', or 'assistant'>; chatMessageText: string; status: string} - does not include user's new message
  # aichatModelCustomizations: {temperature: number; retrievalContexts: string[]; systemPrompt: string;}
  # aichatContext: {currentLevelId: number; scriptId: number; channelId: string;}
  def start_chat_completion
    return render status: :forbidden, json: {} unless AichatSagemakerHelper.can_request_aichat_chat_completion?
    unless chat_completion_has_required_params?
      return render status: :bad_request, json: {}
    end

    return head :too_many_requests if should_throttle_request_count?

    model_id = params[:aichatModelCustomizations][:selectedModelId]
    if model_id == SharedConstants::AI_CHAT_MODEL_IDS[:CHATGPT] && should_throttle_token_count?(model_id, current_user.id)
      log_token_throttling(current_user.id)

      return head :too_many_requests
    end

    # Filter out non-OK messages (e.g. errors)
    messages_for_model = params[:storedMessages].select {|message| message[:status] == SharedConstants::AI_INTERACTION_STATUS[:OK]}
    context = params[:aichatContext]

    # Create the request object
    begin
      request = AichatRequest.create!(
        user_id: current_user.id,
        model_customizations: params[:aichatModelCustomizations],
        stored_messages: messages_for_model,
        new_message: params[:newMessage],
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

  # GET /aichat_request/chat_request/:id
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

  private def should_throttle_request_count?
    id = current_user.id
    limit = DCDO.get('aichat_request_limit_per_min', DEFAULT_REQUEST_LIMIT_PER_MIN)
    Cdo::Throttle.throttle(AICHAT_REQUEST_COUNT_PREFIX + id.to_s, limit, 60)
  end

  # Since we don't know the token count of the current request at the outset,
  # we check whether the user's most recent request exceeded the daily token limit.
  private def should_throttle_token_count?(model_id, user_id)
    throttle_key = AichatOpenaiHelper.token_throttling_key(model_id, user_id)
    Cdo::Throttle.throttled?(throttle_key)
  end

  private def log_token_throttling(user_id)
    log_payload = {
      event: 'aichat_openai_token_limit_exceeded',
      userId: current_user.id
    }
    CDO.log.info log_payload.to_json.to_s
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

  private def get_project_id(context)
    if context[:channelId]
      _, project_id = storage_decrypt_channel_id(context[:channelId])
      project_id
    end
  end

  private def get_polling_interval_ms
    DCDO.get("aichat_polling_interval_ms", DEFAULT_POLLING_INTERVAL_MS)
  end

  private def get_backoff_rate
    DCDO.get("aichat_polling_backoff_rate", DEFAULT_POLLING_BACKOFF_RATE)
  end
end
