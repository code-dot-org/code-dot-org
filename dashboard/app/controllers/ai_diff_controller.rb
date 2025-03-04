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

    # Log messages if the response was successful and not flagged for PII.
    if response_body[:status] == SharedConstants::AI_INTERACTION_STATUS[:OK]
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
    end

    render(status: :ok, json: response_body)
  end

  private def contains_pii?
    response = Aws::Comprehend::Client.new.detect_pii_entities(
      {language_code: 'en', text: params[:inputText]}
    )

    # a string without pii concerns will contain no entities. example responses:
    # {
    #   "source": "the quick brown fox jumped over the lazy dog",
    #   "response": []
    # }
    # {
    #   "source": "the quick brown fox (206) 555-1212 jumped over the lazy dog at 55 main st",
    #   "response": [
    #     "{:score=>0.9999105930328369, :type=>\"PHONE\", :begin_offset=>20, :end_offset=>34}",
    #     "{:score=>0.9999832510948181, :type=>\"ADDRESS\", :begin_offset=>63, :end_offset=>73}"
    #   ]
    # }

    max_score = response.entities.map(&:score).max || 0

    max_score > 0.9
  end

  private def get_response_body(session_id)
    if contains_pii?
      return {
        role: "assistant",
        status: SharedConstants::AI_INTERACTION_STATUS[:PII_VIOLATION],
        chat_message_text: 'Sorry, I cannot accept messages that contain personal information.',
        session_id: session_id
      }
    end

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

    course_name = @unit_group.present? ? @unit_group.name : @unit&.name

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
    return false if params[:context].nil?

    begin
      if params[:context] == SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
        params.require([:inputText, :isPreset])
      elsif params[:context] == SharedConstants::AI_DIFF_CONTEXT[:LESSON] || params[:context] == SharedConstants::AI_DIFF_CONTEXT[:UNIT] || params[:context] == SharedConstants::AI_DIFF_CONTEXT[:COURSE]
        params.require([:inputText, :contextId, :unitDisplayName, :isPreset])
      end
    rescue ActionController::ParameterMissing
      return false
    end
    return true
  end
end
