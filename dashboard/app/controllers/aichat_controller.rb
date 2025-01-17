class AichatController < ApplicationController
  authorize_resource class: false

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
        request_id: event[:requestId], # Only present if ChatEvent is a ChatMessage, otherwise nil
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

  # GET /aichat/user_has_access
  def user_has_access
    render(status: :ok, json: {userHasAccess: current_user&.has_aichat_access?})
  end

  # POST /aichat/find_toxicity
  # Finds toxicity in the given system prompt and retrieval contexts and returns a list of flagged fields.
  def find_toxicity
    locale = params[:locale] || "en"
    flagged_fields = []

    if params[:systemPrompt].present?
      toxicity = AichatSafetyHelper.find_toxicity('user', params[:systemPrompt], locale)
      flagged_fields << {field: 'systemPrompt', toxicity: toxicity} if toxicity.present?
    end

    if params[:retrievalContexts].present?
      retrieval_joined = params[:retrievalContexts].join(' ')
      toxicity = AichatSafetyHelper.find_toxicity('user', retrieval_joined, locale)
      flagged_fields << {field: 'retrievalContexts', toxicity: toxicity} if toxicity.present?
    end

    render json: {flagged_fields: flagged_fields}.deep_transform_keys {|key| key.to_s.camelize(:lower)}
  end
end
