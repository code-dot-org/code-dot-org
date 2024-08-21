class AiDiffController < ApplicationController
  include AiDiffBedrockHelper
  load_and_authorize_resource except: [:chat_completion]

  # params are
  # inputText:
  # lessonId:
  # unitDisplayName:
  # sessionId:
  # POST /ai_diff/chat_completion
  def chat_completion
    return render status: :forbidden, json: {} unless current_user&.teacher?
    unless has_required_params?
      return render status: :bad_request, json: {}
    end

    session_id = params[:sessionId].presence

    response_body = get_response_body(session_id)

    render(status: :ok, json: response_body)
  end

  private def get_response_body(session_id)
    # TODO: Check for profanity/ PII in input text

    # get lesson info for prompt generation
    @lesson = Lesson.find_by(id: params[:lessonId])

    lesson_name = @lesson.name
    lesson_num = @lesson.relative_position

    @unit = Unit.find_by(id: @lesson.script_id)
    @unit_group = @unit.unit_groups.first
    course_name = CourseOffering.find_by(id: @unit_group.course_version.course_offering_id).display_name
    full_unit_name = format("%{course_name} %{unit_name}", course_name: course_name, unit_name: params[:unitDisplayName])

    bedrock_rag_response = AiDiffBedrockHelper.request_bedrock_rag_chat(params[:inputText], lesson_name, lesson_num, full_unit_name, session_id)

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
      params.require([:inputText, :lessonId, :unitDisplayName])
    rescue ActionController::ParameterMissing
      return false
    end
    return true
  end
end
