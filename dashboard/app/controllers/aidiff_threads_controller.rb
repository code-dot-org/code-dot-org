class AidiffThreadsController < ApplicationController
  include AiDiffBedrockHelper
  include LevelsHelper

  before_action :authenticate_user!
  load_and_authorize_resource

  # POST /aidiff_threads
  def create
    unless validate_context? && has_required_chat_params?
      return render status: :bad_request, json: {}
    end

    context = params[:context]

    get_curriculum_contexts(context[:levelId], context[:lessonId], context[:unitId], context[:courseId], context[:type])

    response_body = get_response_body(nil, context[:type])

    # Create thread and log messages if the response was successful and not flagged for PII.
    if response_body[:status] == SharedConstants::AI_INTERACTION_STATUS[:OK]
      begin
        @aidiff_thread = AidiffThread.create!(
          user_id: current_user.id,
          external_id: response_body[:session_id],
          llm_version: AiDiffBedrockHelper::MODEL_ID,
          unit_id: @unit&.id,
          level_id: @level&.id,
          course_id: @unit_group&.id,
          lesson_id: @lesson&.id,
          context_type: params[:context][:type]
        )
        # Add user message to thread
        log_messages(response_body)
        response_body[:message_id] = @assistant_message.id
        response_body[:thread_id] = @aidiff_thread.id
      rescue StandardError => exception
        return render status: :bad_request, json: {error: exception.message}
      end
    end

    return_body = response_body.slice(:role, :status, :chat_message_text, :message_id, :thread_id)

    render(json: return_body)
  end

  # GET /aidiff_threads
  def index
    render json: @aidiff_threads&.map(&:summarize)
  end

  # GET /aidiff_threads/:id
  def show
    render json: @aidiff_thread.summarize_with_messages
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
      get_curriculum_contexts(context[:levelId], context[:lessonId], context[:unitId], context[:courseId], context[:type])

      courses.push(*(@unit_group.present? ? [@unit_group.name, @unit_group.family_name] : ([@unit&.name, @unit&.family_name] if @unit.present?)))
    end

    render(json: {courses: courses})
  end

  # params are
  # input_text
  # is_preset
  # preset_chip_text
  # POST /aidiff_threads/:id/chat_completion
  def chat_completion
    unless has_required_chat_params?
      return render status: :bad_request, json: {}
    end

    #TODO
    #check if session is valid
    #if session valid set session_id
    #if session invalid, concatenate prior messages

    session_id = @aidiff_thread.external_id
    get_curriculum_contexts(@aidiff_thread.level_id, @aidiff_thread.lesson_id, @aidiff_thread.unit_id, @aidiff_thread.course_id, @aidiff_thread.context_type)
    response_body = get_response_body(session_id, @aidiff_thread.context_type)

    # Log messages if the response was successful and not flagged for PII.
    if response_body[:status] == SharedConstants::AI_INTERACTION_STATUS[:OK]
      # Add user message to thread
      begin
        log_messages(response_body)
        response_body[:message_id] = @assistant_message.id
        response_body[:thread_id] = @aidiff_thread.id
      rescue StandardError => exception
        return render status: :bad_request, json: {error: exception.message}
      end
    end

    return_body = response_body.slice(:role, :status, :chat_message_text, :message_id, :thread_id)

    render(json: return_body)
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

  private def get_response_body(session_id, context_type)
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

    lesson_name = @lesson&.name
    lesson_num = @lesson&.relative_position

    unit_num = @unit&.unit_group_units&.first&.position

    course_names = @unit_group.present? ? [@unit_group.name, @unit_group.family_name] : ([@unit&.name] if @unit.present?)

    course_display_name = CourseOffering.find_by(id: @unit_group&.course_version&.course_offering_id)&.display_name

    unit_display_name = @unit&.title_for_display(unit_group_unit: @unit&.unit_group_units&.first)
    student_code = get_student_code(params[:viewAsUserId] || current_user.id, @level, @unit.id) if context_type == SharedConstants::AI_DIFF_CONTEXT[:LEVEL]

    prompt = AiDiffBedrockHelper.get_prompt_for_context(
      context_type,
      course_display_name,
      unit_display_name,
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

  private def get_active_sections
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

  private def get_curriculum_contexts(level_id, lesson_id, unit_id, course_id, context_type)
    if level_id
      @level = Level.find(level_id)
    end

    if lesson_id
      @lesson = Lesson.find(lesson_id)
    elsif @level
      script_level = @level.script_levels&.first
      @lesson = script_level&.lesson
    end

    if unit_id
      @unit = Unit.find(unit_id)
    elsif @lesson
      @unit = Unit.find(@lesson.script_id)
    end

    if course_id
      @unit_group = UnitGroup.find(course_id)
    elsif @unit
      @unit_group = @unit&.unit_groups&.first
    end

    if context_type == SharedConstants::AI_DIFF_CONTEXT[:GENERAL]
      @section_contexts = get_active_sections
    end
  end

  private def log_messages(response_body)
    AidiffMessage.create!(
      aidiff_thread_id: @aidiff_thread.id,
      external_id: @aidiff_thread.external_id,
      role: :user,
      content: params[:inputText],
      raw_content: params[:inputText],
      is_preset: params[:isPreset],
      preset_chip_text: params[:presetChipText]
    )

    @assistant_message = AidiffMessage.create!(
      aidiff_thread_id: @aidiff_thread.id,
      external_id: @aidiff_thread.external_id,
      role: :assistant,
      content: response_body[:chat_message_text],
      raw_content: response_body[:raw_content],
      source_links: response_body[:links],
      is_preset: params[:isPreset],
    )
  end

  private def has_required_chat_params?
    begin
      params.require([:inputText, :isPreset])
      if params[:isPreset] == true
        params.require(:presetChipText)
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
