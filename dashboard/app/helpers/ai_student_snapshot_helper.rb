module AiStudentSnapshotHelper
  # Minimum time between regenerations of a lesson insight.
  LESSON_INSIGHT_COOLDOWN = 5.minutes

  def self.save_lesson_feedback(feedback_json, student_id, lesson_id, section_id, teacher_id)
    feedback_record = LessonFeedback.find_or_initialize_by(
      lesson_id: lesson_id,
      student_id: student_id
    )
    feedback_record.teacher_id = teacher_id
    feedback_record.section_id = section_id
    feedback_record.saved_feedback = feedback_json
    feedback_record.save!
    feedback_record
  end

  # Returns the max updated_at across all UserLevels this student has in this lesson/unit.
  # Uses Unit.get_from_cache so lesson/level data comes from memory, not extra DB queries.
  def self.max_user_level_updated_at(unit_id, lesson_id, student_id)
    unit = Unit.get_from_cache(unit_id)
    lesson = unit.lessons.find {|l| l.id == lesson_id.to_i}
    level_ids = lesson.script_levels.map(&:level_id)
    UserLevel.where(user_id: student_id, script_id: unit_id, level_id: level_ids).
      maximum(:updated_at)
  end

  # Returns true when a lesson insight should be (re)generated.
  def self.should_generate_lesson_insight?(insight, unit_id, lesson_id, student_id)
    return true if insight.nil?
    # Never regenerate if the insight is less than 5 minutes old.
    return false if insight.updated_at >= LESSON_INSIGHT_COOLDOWN.ago

    current_max = max_user_level_updated_at(unit_id, lesson_id, student_id)
    # Regenerate when any UserLevel was touched after the insight was last generated.
    current_max.present? && current_max > insight.updated_at
  end

  def self.fetch_or_generate_lesson_insight(unit_id, lesson_id, teacher_id, student_id, section_id)
    insight = LessonInsight.find_by(section_id: section_id, lesson_id: lesson_id, student_id: student_id)

    should_generate = should_generate_lesson_insight?(insight, unit_id, lesson_id, student_id)

    if should_generate
      response = generate_lesson_insight(unit_id, lesson_id, teacher_id, student_id, section_id)
      if response[:status] == 200
        insight = LessonInsight.find_or_initialize_by(
          section_id: section_id,
          lesson_id: lesson_id,
          student_id: student_id
        )
        insight.teacher_id = teacher_id
        insight.insight_response = response[:json]
        insight.save!
      end
      {status: response[:status], json: response[:json], updated_at: insight&.updated_at}
    else
      {status: 200, json: insight.insight_response, updated_at: insight.updated_at}
    end
  rescue ActiveRecord::RecordNotUnique
    insight = LessonInsight.find_by!(section_id: section_id, lesson_id: lesson_id, student_id: student_id)
    {status: 200, json: insight.insight_response, updated_at: insight.updated_at}
  end

  MODEL = SharedConstants::STUDENT_SNAPSHOT_MODEL_VERSION

  LESSON_INSIGHT_FIELDS = %w[progress misconceptions assessment next_steps].freeze

  LESSON_FEEDBACK_FIELDS = %w[id saved_feedback submitted_feedback submitted_at created_at updated_at].freeze

  def self.notify_and_raise(message, context)
    exception = StandardError.new(message)
    Observability::Errors.report(exception, context: context)
    raise exception
  end

  def self.generate_lesson_insight(unit_id, lesson_id, teacher_id, student_id, section_id)
    prompt = AiSystemPrompts::StudentSnapshotPromptHelper.get_insight_system_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)
    system_prompt = prompt[:content]
    start_time = Time.now
    context = {unit_id: unit_id, lesson_id: lesson_id, teacher_id: teacher_id, student_id: student_id, section_id: section_id}

    begin
      response = client.request_lesson_insight(system_prompt)
    rescue Net::ReadTimeout
      notify_and_raise("Timeout waiting for AI client to return lesson insight", context)
    rescue StandardError => exception
      notify_and_raise("Error processing AI lesson insight: #{exception.message}", context)
    end

    if response.code == 200
      response_body = JSON.parse(response.body)
      content = response_body['choices'][0]['message']['content']
      end_time = Time.now

      LangfuseHelper.trace_lesson_insight(
        model: MODEL,
        teacher_id: teacher_id,
        lesson_id: lesson_id,
        lesson_name: Lesson.find(lesson_id).name,
        unit_id: unit_id,
        unit_name: Unit.find(unit_id).name,
        section_id: section_id,
        student_id: student_id,
        variables: prompt[:variables],
        prompt_name: prompt[:prompt_name],
        prompt_version: prompt[:prompt_version],
        output: content,
        usage: response_body['usage'],
        start_time: start_time,
        end_time: end_time,
      )

      parsed_content = JSON.parse(content)
      notify_and_raise("AI lesson insight response was not a JSON object: #{content}", context) unless parsed_content.is_a?(Hash)

      return {status: response.code, json: parsed_content.slice(*LESSON_INSIGHT_FIELDS).to_json}
    else
      notify_and_raise("Received status code #{response.code} when processing AI lesson insight: #{response.body}", context.merge(status: response.code))
    end
  end

  def self.generate_lesson_feedback(unit_id, lesson_id, teacher_id, student_id, section_id)
    prompt = AiSystemPrompts::StudentSnapshotPromptHelper.get_feedback_system_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)
    system_prompt = prompt[:content]
    start_time = Time.now
    context = {unit_id: unit_id, lesson_id: lesson_id, teacher_id: teacher_id, student_id: student_id, section_id: section_id}

    begin
      response = client.request_lesson_feedback(system_prompt)
    rescue Net::ReadTimeout
      notify_and_raise("Timeout waiting for AI client to return lesson feedback", context)
    rescue StandardError => exception
      notify_and_raise("Error processing AI lesson feedback: #{exception.message}", context)
    end
    if response.code == 200
      response_body = JSON.parse(response.body)
      content = response_body['choices'][0]['message']['content']
      end_time = Time.now

      LangfuseHelper.trace_lesson_feedback(
        model: MODEL,
        teacher_id: teacher_id,
        lesson_id: lesson_id,
        lesson_name: Lesson.find(lesson_id).name,
        unit_id: unit_id,
        unit_name: Unit.find(unit_id).name,
        section_id: section_id,
        student_id: student_id,
        variables: prompt[:variables],
        prompt_name: prompt[:prompt_name],
        prompt_version: prompt[:prompt_version],
        output: content,
        usage: response_body['usage'],
        start_time: start_time,
        end_time: end_time,
      )

      feedback_json = JSON.parse(content)
      feedback_string = feedback_json.is_a?(Hash) ? feedback_json['feedback'] : feedback_json
      saved_record = save_lesson_feedback(feedback_string, student_id, lesson_id, section_id, teacher_id)
      return {status: response.code, record: saved_record.as_json(only: LESSON_FEEDBACK_FIELDS)}
    else
      notify_and_raise("Received status code #{response.code} when processing AI lesson feedback: #{response.body}", context.merge(status: response.code))
    end
  end

  class Client
    attr_accessor :api_key, :model

    OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def request_lesson_feedback(prompt)
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }

      response_props = {
        feedback: {type: "string"},
      }

      data = {
        model: model,
        messages: [{
          role: "system",
          content: prompt
        }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lesson_feedback",
            schema: {
              type: "object",
              properties: response_props,
            }
          }
        }
      }

      HTTParty.post(
        OPEN_AI_URL,
        headers: headers,
        body: data.to_json,
        open_timeout: DCDO.get('openai_http_open_timeout', 5),
        read_timeout: DCDO.get('openai_http_read_timeout', 30)
      )
    end

    def request_lesson_insight(prompt)
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }

      response_props = LESSON_INSIGHT_FIELDS.to_h {|field| [field.to_sym, {type: "string"}]}

      data = {
        model: model,
        messages: [{
          role: "system",
          content: prompt
        }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lesson_insight",
            schema: {
              type: "object",
              properties: response_props,
            }
          }
        }
      }

      HTTParty.post(
        OPEN_AI_URL,
        headers: headers,
        body: data.to_json,
        open_timeout: DCDO.get('openai_http_open_timeout', 5),
        read_timeout: DCDO.get('openai_http_read_timeout', 30)
      )
    end
  end

  def self.client
    Client.new(CDO.openai_lesson_summaries_api_key, MODEL)
  end
end
