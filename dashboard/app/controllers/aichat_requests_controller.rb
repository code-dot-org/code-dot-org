require 'cdo/throttle'

class AichatRequestsController < ApplicationController
  authorize_resource class: false
  before_action :reassign_model_customizations, only: [:start_chat_completion]

  AICHAT_REQUEST_COUNT_PREFIX = "aichat/requests/".freeze
  DEFAULT_REQUEST_LIMIT_PER_MIN = 50

  DEFAULT_POLLING_INTERVAL_MS = 1000
  DEFAULT_POLLING_BACKOFF_RATE = 1.2

  rescue_from CanCan::AccessDenied do
    render status: :forbidden, json: {user_type: current_user&.user_type || 'signed_out'}
  end

  # POST /aichat_request/start_chat_completion
  # ------------------------------------------
  # Initiate a chat completion request, which is performed asynchronously as an ActiveJob.
  # Returns the ID of the request and a base polling interval + backoff rate.
  # params are:
  #   newMessage: {role: 'user'; chatMessageText: string; status: string}
  #   storedMessages: Array of {role: <'user', 'system', or 'assistant'>; chatMessageText: string; status: string}
  #     - does not include user's new message
  #   modelParameters: {temperature: number; retrievalContexts: string[]; systemPrompt: string; responseJsonSchema?: object;}
  #   aichatContext: {
  #     clientType: AiChatClientType;
  #     currentLevelId: number | null;
  #     scriptId: number | null;
  #     channelId: string | undefined;
  #   }

  def start_chat_completion
    unless chat_completion_has_required_params?
      return render status: :bad_request, json: {}
    end
    unless current_user.can_access_aichat_chat_completion?(params[:aichatContext][:clientType], params[:aichatContext][:currentLevelId])
      return render status: :forbidden, json: {user_type: current_user.user_type}
    end
    return head :too_many_requests if should_throttle_request_count?

    model_id = params[:modelParameters][:selectedModelId]
    if model_id == SharedConstants::AI_CHAT_MODEL_IDS[:CHATGPT] && should_throttle_token_count?(model_id, current_user.id)
      log_token_throttling(current_user.id)

      return head :too_many_requests
    end

    # Create the request object.
    begin
      request = create_request
    rescue StandardError => exception
      return render status: :bad_request, json: {error: exception.message}
    end

    # Start the job.
    locale = params[:locale] || "en"
    AichatRequestChatCompletionJob.perform_later(request: request, locale: locale)

    # Return the request ID, polling interval, and backoff rate.
    response_body = {
      requestId: request.id,
      pollingIntervalMs: get_polling_interval_ms,
      backoffRate: get_backoff_rate
    }
    render(status: :ok, json: response_body)
  end

  # GET /aichat_request/chat_request/:id
  # ------------------------------------
  # Get the chat completion request status and response for the given ID.
  def chat_request
    begin
      request = AichatRequest.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: {}
    end

    # Only the user who initiated the request can view the response and status.
    return render status: :forbidden, json: {} if request.user_id != current_user.id

    response_body = {
      executionStatus: request.execution_status,
      response: request.response
    }
    render(status: :ok, json: response_body)
  end

  # POST /aichat_requests
  # -----------------------
  # Create a new AichatRequest record without enqueuing a job.
  # Used for scenarios where the actual request will be carried out elsewhere (e.g. on the client).
  def create
    unless chat_completion_has_required_params?
      return render status: :bad_request, json: {}
    end
    unless current_user.can_access_aichat_chat_completion?(params[:aichatContext][:clientType], params[:aichatContext][:currentLevelId])
      return render status: :forbidden, json: {user_type: current_user.user_type}
    end

    request = create_request
    render json: {requestId: request.id}
  end

  # PUT /aichat_requests/:id
  # -----------------------
  # Update an existing AichatRequest record with execution status and response.
  # Used for scenarios where the request has been carried out elsewhere (e.g. on the client).
  def update
    begin
      request = AichatRequest.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: {}
    end

    # Only the user who initiated the request can update it.
    return render status: :forbidden, json: {} if request.user_id != current_user.id

    # This is not the admission decision for chat history -- that is
    # AichatEventsController#log_chat_event. This guards the value log_chat_event
    # compares an *unsigned* assistant message against, and this route is open to
    # any user who owns the request, gateway path or not. Without the guard a
    # legacy user could overwrite the job's response with forged text here and
    # then log an event matching it.
    #
    # So `response` is written only when the worker's signature covers exactly
    # this value. Note that deliberately includes the no-signature case: text the
    # worker did not sign is client-authored, whether the client omitted the
    # signature or never had one.
    #
    # Single use is scoped to :request_response, so spending it here does not
    # spend the separate use log_chat_event needs to admit the event to history.
    # A repeat PUT with the same signature reports :replayed and leaves the
    # already-stored response alone.
    result = AichatResponseSignature.verify(
      signature: params[:responseSignature],
      response_text: params[:response],
      user: current_user,
      context: signature_context(request),
      purpose: :request_response
    )
    log_signature_result(result, request)

    attributes = update_params.to_h
    unless result.verified?
      # Content-filter and failure paths legitimately report a
      # client-synthesized string the worker never produced and cannot sign.
      # Keep the status, drop the text.
      attributes.delete('response')
    end

    if request.update(attributes)
      render status: :ok, json: {requestId: request.id, responseVerified: result.verified?}
    else
      render status: :unprocessable_entity, json: {errors: request.errors}
    end
  end

  def create_request
    # TODO: confirm request shape and data usage https://codedotorg.atlassian.net/browse/TEACHING-60
    request_params = params.permit!.to_h.deep_symbolize_keys

    attributes = AichatAiHelper.build_request_attributes(current_user.id, request_params)

    AichatRequest.new(attributes).tap(&:save!)
  end

  # The signature binds to the context the inbound token proved; compare it
  # against what this request row was created with.
  private def signature_context(request)
    {
      currentLevelId: request.level_id,
      scriptId: request.script_id,
      lessonId: nil,
      channelId: params.dig(:aichatContext, :channelId),
    }
  end

  # Separate signals on purpose. :invalid means a signature was supplied and did
  # not check out, which is an attack signal. :key_unavailable is our own
  # misprovisioning and :absent is an un-upgraded worker; folding those together
  # would bury the interesting one.
  private def log_signature_result(result, request)
    CDO.log.info({
      event: 'aichat_response_signature',
      status: result.status,
      requestId: request.id,
      userId: current_user.id,
      error: result.error,
    }.to_json.to_s
)
  end

  private def should_throttle_request_count?
    id = current_user.id
    limit = DCDO.get('aichat_request_limit_per_min', DEFAULT_REQUEST_LIMIT_PER_MIN)
    Cdo::Throttle.throttle(AICHAT_REQUEST_COUNT_PREFIX + id.to_s, limit, 60)
  end

  # Since we don't know the token count of the current request at the outset,
  # we check whether the user's most recent request exceeded the daily token limit.
  private def should_throttle_token_count?(model_id, user_id)
    throttle_key = AichatAiHelper.token_throttling_key(model_id, user_id)
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
      params.require([:newMessage, :modelParameters, :aichatContext])
    rescue ActionController::ParameterMissing
      return false
    end
    # It is possible that storedMessages is an empty array.
    # If so, the above require check will not pass.
    # Check storedMessages param separately.
    params[:storedMessages].is_a?(Array)
  end

  # Reassign model customizations from aichatModelCustomizations to modelParameters
  # for compatibility with the existing API.
  # Note that this is only required for clients with stale JavaScript code using the
  # old parameter name. This should be removed in the future.
  private def reassign_model_customizations
    if params[:aichatModelCustomizations].present?
      params[:modelParameters] = params[:aichatModelCustomizations]
      params.delete(:aichatModelCustomizations)
    end
  end

  private def get_polling_interval_ms
    DCDO.get("aichat_polling_interval_ms", DEFAULT_POLLING_INTERVAL_MS)
  end

  private def get_backoff_rate
    DCDO.get("aichat_polling_backoff_rate", DEFAULT_POLLING_BACKOFF_RATE)
  end

  private def update_params
    params.permit(:execution_status, :response)
  end
end
