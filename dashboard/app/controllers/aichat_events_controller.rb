class AichatEventsController < ApplicationController
  authorize_resource class: false

  # Matches Role.ASSISTANT in apps/src/aiComponentLibrary/chatMessage/types.ts.
  # Ruby has no shared constant for chat roles -- the rest of the backend spells
  # it out too (see AichatAiHelper) -- so keep the literal local rather than
  # inventing a cross-language enum for one comparison.
  ASSISTANT_ROLE = 'assistant'.freeze

  # Fields the client must not be able to write into stored history.
  #
  # `attestation` is transport, not content: it is verified above and has no
  # business in the transcript. `teacherFeedback` is authorization-bearing --
  # submit_teacher_feedback guards it with can_submit_feedback?, and accepting it
  # here verbatim would let a student mark their own message as teacher-reviewed.
  UNPERSISTED_EVENT_KEYS = %w[attestation teacherFeedback].freeze

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

    integrity = assistant_event_integrity(event, context)
    if integrity[:error]
      log_integrity_failure(event, context, integrity[:error])
      if require_response_attestation?
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

  # Assistant-role messages are the only events that claim to be model output,
  # and so the only ones a forger gains anything by inventing. They must match a
  # response we can vouch for.
  #
  # Everything else -- the user's own messages, notifications, model updates,
  # user actions -- is client-authored by construction and carries no integrity
  # claim that could be checked. That is acceptable only because each is stored
  # with its own discriminator (notificationType, updatedField, descriptionKey)
  # and cannot present itself as model output.
  #
  # Two provenances, and note that neither is selected by the client:
  #
  #   gateway  the browser called the worker, so the only evidence is the
  #            worker's attestation, verified here against chatMessageText.
  #   legacy   AichatRequestChatCompletionJob ran the completion in-process, so
  #            aichat_requests.response is ours and the event must match it.
  #
  # The legacy comparison is only sound because AichatRequestsController#update
  # refuses to write `response` without a matching attestation. Without that,
  # `response` would be client-writable and comparing against it would prove
  # nothing.
  #
  # Returns {error:} with a short reason, or {error: nil, status:} when accepted.
  private def assistant_event_integrity(event, context)
    return {error: nil} unless assistant_message?(event)
    return {error: nil, status: :placeholder} if failed_completion_placeholder?(event)

    result = AichatResponseAttestation.verify(
      attestation: event[:attestation],
      response_text: event[:chatMessageText],
      user: current_user,
      context: context
    )
    return {error: nil, status: result.status} if result.verified?

    # No attestation is the expected shape for a legacy event, so fall through
    # to the server-authored comparison rather than treating it as a failure.
    # An attestation that was supplied and did not check out is never downgraded
    # this way -- that is an attack signal, not a legacy event.
    if result.status == :absent
      legacy_error = legacy_response_mismatch(event)
      return {error: nil, status: :server_executed} if legacy_error.nil?
      return {error: legacy_error, status: :absent}
    end

    {error: result.error || result.status.to_s, status: result.status}
  end

  # Compares an unattested assistant message against the response our own job
  # wrote for its request.
  private def legacy_response_mismatch(event)
    request_id = event[:requestId]
    return 'assistant message without requestId or attestation' if request_id.blank?

    request = AichatRequest.find_by(id: request_id)
    return 'requestId not found' if request.nil?
    # requestId is client-supplied, so ownership has to be checked explicitly or
    # an event could reference another user's request.
    return 'requestId belongs to another user' if request.user_id != current_user.id
    return 'request has no recorded response' if request.response.nil?

    expected = AichatResponseAttestation.sha256(request.response)
    actual = AichatResponseAttestation.sha256(event[:chatMessageText])
    return nil if ActiveSupport::SecurityUtils.secure_compare(expected, actual)
    'chatMessageText does not match the recorded response'
  end

  private def assistant_message?(event)
    event[:role].to_s == ASSISTANT_ROLE && event[:chatMessageText].present?
  end

  # submitChatContents logs a fixed placeholder when a completion never produced
  # a response at all. It has no requestId because no model output exists to
  # attest.
  #
  # Deliberately exact rather than "any errored assistant message": a loose
  # carve-out here would be the bypass for the whole check, since status and
  # text both come from the client.
  private def failed_completion_placeholder?(event)
    event[:status].to_s == SharedConstants::AI_INTERACTION_STATUS[:ERROR] &&
      event[:chatMessageText].to_s == 'error' &&
      event[:requestId].blank?
  end

  private def persistable_event(event)
    event.except(*UNPERSISTED_EVENT_KEYS)
  end

  private def require_response_attestation?
    DCDO.get('aichat_require_response_attestation', false)
  end

  # Separate signals on purpose. An invalid or replayed attestation is an attack
  # signal; :key_unavailable is our own misprovisioning and :absent an
  # un-upgraded worker. Folding them together buries the interesting one.
  private def log_integrity_failure(event, context, reason)
    CDO.log.info({
      event: 'aichat_event_integrity_failure',
      reason: reason,
      requestId: event[:requestId],
      userId: current_user.id,
      clientType: context[:clientType],
      enforcing: require_response_attestation?,
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
