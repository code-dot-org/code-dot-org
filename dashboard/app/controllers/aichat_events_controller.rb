class AichatEventsController < ApplicationController
  authorize_resource class: false

  # No shared constant for chat roles; AichatAiHelper spells them out too.
  ASSISTANT_ROLE = 'assistant'.freeze
  USER_ROLE = 'user'.freeze

  # responseSignature is transport; teacherFeedback is authorization-bearing.
  UNPERSISTED_EVENT_KEYS = %w[responseSignature teacherFeedback].freeze

  # POST /aichat_events/log_chat_event
  # ----------------------------------
  # params are:
  #   newChatEvent: ChatEvent
  #   aichatContext: {
  #     clientType: AiChatClientType;
  #     currentLevelId: number | null;
  #     scriptId: number | null;
  #     channelId: string | undefined;
  #     lessonId: number | null;
  #  }

  def log_chat_event
    begin
      params.require([:newChatEvent, :aichatContext])
    rescue ActionController::ParameterMissing
      return render status: :bad_request, json: {}
    end

    context = params[:aichatContext]
    unless can_log_aichat_events?(context[:currentLevelId], context[:clientType])
      return render status: :forbidden, json: {user_type: current_user.user_type}
    end

    event = params[:newChatEvent]

    integrity = event_integrity(event, context)
    if integrity[:error]
      log_integrity_failure(event, context, integrity[:error])
      if require_response_signature?
        return render status: :unprocessable_entity, json: {error: 'chat event failed integrity check'}
      end
    end

    project_id = nil
    if context[:channelId]
      _, project_id = get_storage_id_and_project_id(context[:channelId])
    end

    begin
      logged_event = AichatEvent.create!(
        user_id: current_user.id,
        level_id: context[:currentLevelId],
        script_id: context[:scriptId],
        project_id: project_id,
        lesson_id: context[:lessonId],
        request_id: event[:requestId], # Only present if ChatEvent is a ChatMessage, otherwise nil
        aichat_event: persistable_event(event)
      )
    rescue StandardError => exception
      return render status: :bad_request, json: {error: exception.message}
    end

    response_body = {
      id: logged_event.id,
      **logged_event.aichat_event
    }

    render(status: :ok, json: response_body)
  end

  # params are userId: number, levelId: number, scriptId: number, channelId: string, lessonId: number
  # GET /aichat_events/chat_history
  def chat_history
    # Request all chat events for a user at a given level/script.
    begin
      params.require([:userId])
      unless (params[:scriptId].present? && params[:levelId].present?) || params[:channelId].present? || params[:lessonId].present?
        raise ActionController::ParameterMissing, 'Either both scriptId and levelId, or channelId, or lessonId must be provided'
      end
    rescue ActionController::ParameterMissing
      return render status: :bad_request, json: {}
    end

    script_id = params[:scriptId]
    channel_id = params[:channelId]
    level_id = params[:levelId]
    lesson_id = params[:lessonId]
    user_id = params[:userId].to_i
    unless can_view_chat_history?(user_id)
      return render(status: :forbidden, json: {error: "Access denied for chat history."})
    end

    aichat_events = AichatEvent.none
    if script_id.present? && level_id.present?
      aichat_events = AichatEvent.where(user_id: user_id, script_id: script_id, level_id: level_id)
    elsif channel_id.present?
      _, project_id = get_storage_id_and_project_id(channel_id)
      aichat_events = AichatEvent.where(user_id: user_id, project_id: project_id)
    elsif lesson_id.present?
      aichat_events = AichatEvent.where(user_id: user_id, lesson_id: lesson_id)
    end

    aichat_events = aichat_events.order(:id).map do |event|
      chat_event = event[:aichat_event].is_a?(String) ? JSON.parse(event[:aichat_event]) : event[:aichat_event]
      {
        id: event.id,
        **chat_event
      }
    end
    render json: aichat_events
  end

  # params are eventId: number, feedback?: 'clean_disagree' | 'profanity_agree' | 'profanity_disagree'
  # POST /aichat_events/submit_teacher_feedback
  # Update a given chat message with teacher feedback. If feedback is nil, remove any existing feedback.
  # Also has the side effect of fixing up any chat events that were stored as strings.
  def submit_teacher_feedback
    begin
      params.require([:eventId])
    rescue ActionController::ParameterMissing
      return render status: :bad_request, json: {}
    end

    chat_event_id = params[:eventId]
    feedback = params[:feedback]

    return render status: :bad_request, json: {} if feedback && !SharedConstants::AI_CHAT_TEACHER_FEEDBACK.value?(feedback)

    begin
      chat_event = AichatEvent.find(chat_event_id)
      unless can_submit_feedback?(chat_event.user_id)
        return render(status: :forbidden, json: {error: "Access denied for submitting teacher feedback."})
      end

      # Parse aichat_event if it's stored as a string
      chat_event.aichat_event = JSON.parse(chat_event.aichat_event) if chat_event.aichat_event.is_a?(String)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: {}
    end

    chat_event.aichat_event.delete('teacherFeedback') if chat_event.aichat_event['teacherFeedback']
    chat_event.aichat_event['teacherFeedback'] = feedback if feedback
    chat_event.save!

    render status: :ok, json: {}
  end

  # Both halves are checked. Provenance is not client-selected: a gateway turn
  # has the worker's signature, a Rails-only turn has columns our job wrote.
  private def event_integrity(event, context)
    role = event[:role].to_s
    return {error: nil} if event[:chatMessageText].blank?
    return {error: nil} unless [USER_ROLE, ASSISTANT_ROLE].include?(role)
    return {error: nil, status: :no_model_call} if no_model_call?(event, role)

    result = AichatResponseSignature.verify(
      signature: event[:responseSignature],
      text: event[:chatMessageText],
      user: current_user,
      context: context,
      covers: role == USER_ROLE ? :prompt : :response
    )
    return {error: nil, status: result.status} if result.verified?

    # Absent is normal for a Rails-only event; a failed signature is not.
    if result.status == :absent
      legacy_error = legacy_mismatch(event, role)
      return {error: nil, status: :server_executed} if legacy_error.nil?
      return {error: legacy_error, status: :absent}
    end

    {error: result.error || result.status.to_s, status: result.status}
  end

  # Compares against columns our own job wrote, not against client input.
  private def legacy_mismatch(event, role)
    request_id = event[:requestId]
    return "#{role} message without requestId or response signature" if request_id.blank?

    request = AichatRequest.find_by(id: request_id)
    return 'requestId not found' if request.nil?
    # requestId is client-supplied, so ownership needs an explicit check.
    return 'requestId belongs to another user' if request.user_id != current_user.id

    if role == USER_ROLE
      # What the job actually sent, whatever the client now claims.
      recorded = request.new_message.is_a?(Hash) ? request.new_message['chatMessageText'] : nil
      return 'request has no recorded message' if recorded.nil?
    else
      recorded = request.response
      return 'request has no recorded response' if recorded.nil?
    end

    expected = AichatResponseSignature.sha256(recorded)
    actual = AichatResponseSignature.sha256(event[:chatMessageText])
    return nil if ActiveSupport::SecurityUtils.secure_compare(expected, actual)
    "chatMessageText does not match the recorded #{role == USER_ROLE ? 'message' : 'response'}"
  end

  # Matched exactly, never by a loose rule: role, status and text all come from
  # the client, so a broad carve-out would bypass the whole check.
  private def no_model_call?(event, role)
    if role == ASSISTANT_ROLE
      # submitChatContents logs this fixed placeholder when a completion never
      # produced a response at all.
      return event[:status].to_s == SharedConstants::AI_INTERACTION_STATUS[:ERROR] &&
          event[:chatMessageText].to_s == 'error' &&
          event[:requestId].blank?
    end

    # Input moderation rejected the message before the model was invoked, so the
    # worker never saw it and could not sign it.
    return true if [
      SharedConstants::AI_INTERACTION_STATUS[:PROFANITY_VIOLATION],
      SharedConstants::AI_INTERACTION_STATUS[:PII_VIOLATION],
    ].include?(event[:status].to_s)

    # The request never reached a completion (403, 429, network failure), so no
    # row exists to compare against.
    event[:status].to_s == SharedConstants::AI_INTERACTION_STATUS[:ERROR] &&
      event[:requestId].blank?
  end

  private def persistable_event(event)
    event.except(*UNPERSISTED_EVENT_KEYS)
  end

  private def require_response_signature?
    DCDO.get('aichat_require_response_signature', false)
  end

  # Kept distinct: :invalid/:replayed are attack signals, :key_unavailable ours.
  private def log_integrity_failure(event, context, reason)
    CDO.log.info({
      event: 'aichat_event_integrity_failure',
      reason: reason,
      requestId: event[:requestId],
      userId: current_user.id,
      clientType: context[:clientType],
      enforcing: require_response_signature?,
    }.to_json.to_s
)
  end

  private def can_log_aichat_events?(level_id, client_type)
    current_user.has_aichat_access?(level_id) || current_user.trust_chat_client?(client_type)
  end

  private def can_view_chat_history?(user_id)
    current_user.id == user_id || User.find_by_id(user_id)&.student_of?(current_user)
  end

  private def can_submit_feedback?(user_id)
    student = User.find_by_id(user_id)
    student&.student_of?(current_user) && can?(:manage, student)
  end
end
