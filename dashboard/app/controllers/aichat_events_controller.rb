class AichatEventsController < ApplicationController
  authorize_resource class: false

  # Matches Role.ASSISTANT in apps/src/aiComponentLibrary/chatMessage/types.ts.
  # Ruby has no shared constant for chat roles -- the rest of the backend spells
  # it out too (see AichatAiHelper) -- so keep the literal local rather than
  # inventing a cross-language enum for one comparison.
  ASSISTANT_ROLE = 'assistant'.freeze
  USER_ROLE = 'user'.freeze

  # Fields the client must not be able to write into stored history.
  #
  # `responseSignature` is transport, not content: it is verified above and has
  # no business in the transcript. `teacherFeedback` is authorization-bearing --
  # submit_teacher_feedback guards it with can_submit_feedback?, and accepting it
  # here verbatim would let a student mark their own message as teacher-reviewed.
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

  # Both halves of a chat turn are checked: the student's message must match what
  # the model was asked, and the assistant message must match what it answered.
  # Either one invented is a forgery a teacher would later read as evidence.
  #
  # Everything else -- notifications, model updates, user actions -- is
  # client-authored by construction and carries no integrity claim that could be
  # checked. That is acceptable only because each is stored with its own
  # discriminator (notificationType, updatedField, descriptionKey) and cannot
  # present itself as part of the conversation.
  #
  # Two provenances, and note that neither is selected by the client:
  #
  #   gateway  the browser both sent the message and reported the reply, so the
  #            only evidence is the worker's signature. It covers a digest of
  #            each half, so each is checked against its own claim.
  #   legacy   AichatRequestChatCompletionJob ran the completion in-process from
  #            aichat_requests.new_message and wrote aichat_requests.response, so
  #            both columns are what we sent and received. The event must match.
  #
  # The legacy comparison is only sound because AichatRequestsController#update
  # refuses to write `response` without a matching signature. That route is not
  # restricted to the gateway path -- any user may PUT their own request -- so
  # without that guard a legacy user could overwrite the job's response with
  # forged text and then log an event matching it.
  #
  # Returns {error:} with a short reason, or {error: nil, status:} when accepted.
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

    # No signature is the expected shape for a legacy event, so fall through to
    # the server-authored comparison rather than treating it as a failure. A
    # signature that was supplied and did not check out is never downgraded this
    # way -- that is an attack signal, not a legacy event.
    if result.status == :absent
      legacy_error = legacy_mismatch(event, role)
      return {error: nil, status: :server_executed} if legacy_error.nil?
      return {error: legacy_error, status: :absent}
    end

    {error: result.error || result.status.to_s, status: result.status}
  end

  # Compares an unsigned event against what our own job sent to the model, or
  # what it recorded coming back.
  private def legacy_mismatch(event, role)
    request_id = event[:requestId]
    return "#{role} message without requestId or response signature" if request_id.blank?

    request = AichatRequest.find_by(id: request_id)
    return 'requestId not found' if request.nil?
    # requestId is client-supplied, so ownership has to be checked explicitly or
    # an event could reference another user's request.
    return 'requestId belongs to another user' if request.user_id != current_user.id

    if role == USER_ROLE
      # What AichatRequestChatCompletionJob read from the row and sent to the
      # model, so it is what was asked regardless of what the client now claims.
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

  # Cases where no completion was performed, so there is nothing signed to check
  # and nothing recorded to compare against.
  #
  # Each is matched exactly rather than by a loose rule like "any errored
  # message": a broad carve-out here would be the bypass for the whole check,
  # since role, status and text all come from the client. None of these can claim
  # the model saw or said anything -- that is precisely why they are safe to
  # admit unchecked.
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

  # Separate signals on purpose. An invalid or replayed signature is an attack
  # signal; :key_unavailable is our own misprovisioning and :absent an
  # un-upgraded worker. Folding them together buries the interesting one.
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
