class AiDiffController < ApplicationController
  include AiDiffBedrockHelper
  include LevelsHelper
  authorize_resource class: false

  # params are
  # context:
  # => type:
  # => levelId:
  # => lessonId:
  # => unitId:
  # => courseId:
  # inputText:
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
      @thread = AidiffThread.find_or_create_by!(
        user_id: current_user.id,
        external_id: response_body[:session_id],
        llm_version: AiDiffBedrockHelper::MODEL_ID,
        unit_id: @unit&.id,
        level_id: @level&.id,
        course_id: @unit_group&.id,
        lesson_id: @lesson&.id,
        context_type: params[:context][:type]
      )
    rescue StandardError => exception
      return render status: :bad_request, json: {error: exception.message}
    end

    # Log messages if the response was successful and not flagged for PII.
    if response_body[:status] == SharedConstants::AI_INTERACTION_STATUS[:OK]
      # Add user message to thread
      begin
        AidiffMessage.create!(
          aidiff_thread_id: @thread.id,
          external_id: @thread.external_id,
          role: :user,
          content: params[:inputText],
          raw_content: params[:inputText],
          is_preset: params[:isPreset],
        )
      rescue StandardError => exception
        return render status: :bad_request, json: {error: exception.message}
      end

      # Add response message to thread
      begin
        assistant_message = AidiffMessage.create!(
          aidiff_thread_id: @thread.id,
          external_id: @thread.external_id,
          role: :assistant,
          content: response_body[:chat_message_text],
          raw_content: response_body[:raw_content],
          source_links: response_body[:links],
          is_preset: params[:isPreset],
        )
        response_body[:messageId] = assistant_message.id
        response_body[:threadId] = @thread.id
      rescue StandardError => exception
        return render status: :bad_request, json: {error: exception.message}
      end
    end

    return_body = response_body.slice(:role, :status, :chat_message_text, :session_id)

    render(status: :ok, json: return_body)
  end

  def get_active_sections
    # all sections updated in the last year that have curriculum assigned
    contexts = @current_user&.sections&.where(hidden: false, updated_at: 1.year.ago..Time.now)&.select {|s| s.script_id || s.course_id}&.map do |section|
      context_scope = SharedConstants::AI_DIFF_CONTEXT[:COURSE]
      course_display_name = CourseOffering.find_by(id: section.course_offering_id)&.display_name
      course_names = [section.unit_group&.name]
      course_names.push(section.unit_group&.family_name) unless section.unit_group&.family_name.nil?
      {
        context: context_scope,
        course_display_name: course_display_name,
        course_names: course_names
      }
    end
    contexts
  end

  # POST /ai_diff/curriculum_courses
  def curriculum_courses
    unless validate_context?
      return render status: :bad_request, json: {}
    end

    context = params[:context]
    courses = []

    if context[:type] == SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
      get_active_sections.each do |c|
        courses.push(*c[:course_names])
      end
    else
      if context[:levelId]
        level = Level.find(context[:levelId])
      end

      if context[:lessonId]
        lesson = Lesson.find(context[:lessonId])
      elsif level
        script_level = level.script_levels&.first
        lesson = script_level&.lesson
      end

      if context[:unitId]
        unit = Unit.find(context[:unitId])
      elsif lesson
        unit = Unit.find(lesson.script_id)
      end

      if context[:courseId]
        unit_group = UnitGroup.find(context[:courseId])
      elsif unit
        unit_group = unit&.unit_groups&.first
      end

      courses.push(*(unit_group.present? ? [unit_group.name, unit_group.family_name] : ([unit&.name, unit&.family_name] if unit.present?)))
    end

    render(status: :ok, json: {courses: courses})
  end

  # Certain types of PII detected by Amazon Comprehend are actually allowed
  # for use in chat messages. We allow teachers to ask about lessons themed
  # on a favorite named celebrity, or how to help students at certain ages. etc.
  ALLOWED_TYPES = %w[NAME AGE DATE_TIME USERNAME PIN URL].freeze

  private def contains_pii?
    client =  if (Rails.application.config.respond_to?(:stub_aichat_external_services) && Rails.application.config.stub_aichat_external_services) || [:development, :test].include?(rack_env)
                Aws::Comprehend::Client.new(stub_responses: true)
              else
                Aws::Comprehend::Client.new
              end
    response = client.detect_pii_entities(
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

    max_score = response.entities.reject {|entity| ALLOWED_TYPES.include?(entity.type)}.map(&:score).max || 0

    max_score > 0.9
  end

  private def get_response_body(session_id)
    if contains_pii?
      return {
        role: "assistant",
        status: SharedConstants::AI_INTERACTION_STATUS[:PII_VIOLATION],
        chat_message_text: 'Sorry, I cannot accept messages that contain personal information.',
        raw_content: 'Sorry, I cannot accept messages that contain personal information.',
        links: nil,
        session_id: session_id
      }
    end

    # get lesson info for prompt generation
    context = params[:context]

    if context[:levelId]
      @level = Level.find(context[:levelId])
    end

    if context[:lessonId]
      @lesson = Lesson.find(context[:lessonId])
    elsif @level
      script_level = @level.script_levels&.first
      @lesson = script_level&.lesson
    end

    if context[:unitId]
      @unit = Unit.find(context[:unitId])
    elsif @lesson
      @unit = Unit.find(@lesson.script_id)
    end

    if context[:courseId]
      @unit_group = UnitGroup.find(context[:courseId])
    elsif @unit
      @unit_group = @unit&.unit_groups&.first
    end

    if context[:type] == SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
      @section_contexts = get_active_sections
    end

    lesson_name = @lesson&.name
    lesson_num = @lesson&.relative_position

    unit_num = @unit&.unit_group_units&.first&.position

    course_names = @unit_group.present? ? [@unit_group.name, @unit_group.family_name] : ([@unit&.name] if @unit.present?)

    course_display_name = CourseOffering.find_by(id: @unit_group&.course_version&.course_offering_id)&.display_name

    student_code = get_student_code(context[:viewAsUserId] || current_user.id, @level, @unit.id) if context[:type] == SharedConstants::AI_DIFF_CONTEXT[:LEVEL]

    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context[:type],
      course_display_name,
      params[:unitDisplayName],
      lesson_name,
      params[:isPreset],
      @section_contexts,
      @level&.long_instructions,
      student_code
    )

    response = AiDiffBedrockHelper.request_bedrock_rag_chat(params[:inputText], prompt, lesson_num, unit_num, course_names, session_id, @section_contexts)
    #TODO: check for profanity/PII in model response

    {
      role: "assistant",
      status: SharedConstants::AI_INTERACTION_STATUS[:OK],
      chat_message_text: response[:content],
      session_id: response[:session_id],
      raw_content: response[:raw_content],
      links: response[:links],
    }
  end

  private def has_required_params?
    return false unless validate_context?
    begin
      params.require([:inputText, :isPreset])
      unless params[:context][:type] == SharedConstants::AI_DIFF_CONTEXT[:COURSE] ||  params[:context][:type] == SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
        params.require(:unitDisplayName)
      end
    rescue ActionController::ParameterMissing
      return false
    end
    return true
  end

  private def validate_context?
    return false if params[:context].nil?
    begin
      params.require(:context)
      context = params[:context]
      context.require(:type)

      case context[:type]
      when SharedConstants::AI_DIFF_CONTEXT[:LESSON]
        context.require(:lessonId)
      when SharedConstants::AI_DIFF_CONTEXT[:LEVEL]
        context.require(:levelId)
      when SharedConstants::AI_DIFF_CONTEXT[:UNIT]
        context.require(:unitId)
      when SharedConstants::AI_DIFF_CONTEXT[:COURSE]
        context.require(:courseId)
      end
    rescue ActionController::ParameterMissing
      return false
    end
    return true
  end
end
