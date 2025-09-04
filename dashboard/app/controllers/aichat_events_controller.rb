class AichatEventsController < ApplicationController
  authorize_resource class: false

  # params are newChatEvent: ChatEvent, aichatContext: {currentLevelId: number; scriptId: number; channelId: string;}
  # POST /aichat_events/log_chat_event
  def log_chat_event
    begin
      params.require([:newChatEvent, :aichatContext])
    rescue ActionController::ParameterMissing
      return render status: :bad_request, json: {}
    end

    unless can_log_aichat_events?(params[:aichatContext][:currentLevelId])
      return render status: :forbidden, json: {user_type: current_user.user_type}
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
        request_id: event[:requestId], # Only present if ChatEvent is a ChatMessage, otherwise nil
        aichat_event: event
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

  # params are userId: number, levelId: number, scriptId: number
  # GET /aichat_events/chat_history
  def chat_history
    # Request all chat events for a user at a given level/script.
    begin
      params.require([:userId, :levelId, :scriptId])
    rescue ActionController::ParameterMissing
      return render status: :bad_request, json: {}
    end

    script_id = params[:scriptId]
    level_id = params[:levelId]
    user_id = params[:userId].to_i
    unless can_view_chat_history?(user_id)
      return render(status: :forbidden, json: {error: "Access denied for chat history."})
    end

    aichat_events = AichatEvent.where(user_id: user_id, level_id: level_id, script_id: script_id).order(:created_at).map do |event|
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

  private def can_log_aichat_events?(level_id)
    current_user.has_aichat_access? || current_user.can_access_ai_tutor2?(level_id)
  end

  private def can_view_chat_history?(user_id)
    current_user.id == user_id || User.find_by_id(user_id)&.student_of?(current_user)
  end

  private def can_submit_feedback?(user_id)
    User.find_by_id(user_id)&.student_of?(current_user)
  end
end
