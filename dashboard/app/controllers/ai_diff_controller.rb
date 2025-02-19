class AiDiffController < ApplicationController
  include AiDiffBedrockHelper
  authorize_resource class: false

  # params are
  # context:
  # inputText:
  # contextId:
  # unitDisplayName:
  # sessionId:
  # isPreset:
  # POST /ai_diff/chat_completion
  def chat_completion
    unless has_required_params?
      return render status: :bad_request, json: {}
    end

    session_id = params[:sessionId].presence

    response_body = get_response_body(session_id)
    # get or create thread obj
    begin
      @thread = AichatThread.find_or_create_by!(
        user_id: current_user.id,
        external_id: response_body[:session_id],
        llm_version: AiDiffBedrockHelper::MODEL_ID,
        unit_id: @unit&.id,
        level_id: @lesson&.id,
      )
    rescue StandardError => exception
      return render status: :bad_request, json: {error: exception.message}
    end

    # Add user message to thread
    begin
      AichatMessage.create!(
        aichat_thread_id: @thread.id,
        external_id: @thread.external_id,
        role: :user,
        content: params[:inputText],
        is_preset: params[:isPreset],
      )
    rescue StandardError => exception
      return render status: :bad_request, json: {error: exception.message}
    end

    # Add response message to thread
    begin
      AichatMessage.create!(
        aichat_thread_id: @thread.id,
        external_id: @thread.external_id,
        role: :assistant,
        content: response_body[:chat_message_text],
        is_preset: params[:isPreset],
      )
    rescue StandardError => exception
      return render status: :bad_request, json: {error: exception.message}
    end

    render(status: :ok, json: response_body)
  end

  private def get_response_body(session_id)
    # TODO: Check for profanity/ PII in input text

    # get lesson info for prompt generation

    case params[:context]
    when SharedConstants::AI_DIFF_CONTEXT[:LESSON]
      @lesson = Lesson.find_by(id: params[:contextId])
      @unit = Unit.find_by(id: @lesson&.script_id)
      @unit_group = @unit&.unit_groups&.first
    when SharedConstants::AI_DIFF_CONTEXT[:UNIT]
      @unit = Unit.find_by(id: params[:contextId])
      @unit_group = @unit&.unit_groups&.first
    when SharedConstants::AI_DIFF_CONTEXT[:COURSE]
      @unit_group = UnitGroup.find_by(id: params[:contextId]) #should this be a course offering instead?
    end

    lesson_name = @lesson&.name
    lesson_num = @lesson&.relative_position

    unit_num = @unit&.unit_group_units&.first&.position

    course_name = @unit_group.name

    course_display_name = CourseOffering.find_by(id: @unit_group&.course_version&.course_offering_id)&.display_name
    prompt = AiDiffBedrockHelper.get_prompt_for_context(params[:context], course_display_name, params[:unitDisplayName], lesson_name)

    bedrock_rag_response = AiDiffBedrockHelper.request_bedrock_rag_chat(params[:inputText], prompt, lesson_num, unit_num, course_name, session_id)
    #TODO: check for profanity/PII in model response

    {
      role: "assistant",
      status: SharedConstants::AI_INTERACTION_STATUS[:OK],
      chat_message_text: bedrock_rag_response.output.text,
      session_id: bedrock_rag_response.session_id
    }
  end

  private def has_required_params?
    begin
      params.require([:context, :inputText, :contextId, :unitDisplayName, :isPreset])
    rescue ActionController::ParameterMissing
      return false
    end
    return true
  end
end
