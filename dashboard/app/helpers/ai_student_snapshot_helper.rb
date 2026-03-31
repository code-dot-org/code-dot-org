module AiStudentSnapshotHelper
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

  API_KEY = CDO.openai_lesson_summaries_api_key # TODO before merge: CHANGE TO NEW KEY
  MODEL = SharedConstants::STUDENT_SNAPSHOT_MODEL_VERSION

  def self.generate_lesson_insight(unit_id, lesson_id, teacher_id, student_id, section_id)
    system_prompt = AiSystemPrompts::StudentSnapshotPromptHelper.get_insight_system_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)
    client = Client.new(API_KEY, MODEL)
    start_time = Time.now

    begin
      response = client.request_lesson_insight(system_prompt)
    rescue Net::ReadTimeout
      raise StandardError.new("Timeout waiting for AI client to return lesson insight")
    rescue StandardError => exception
      raise StandardError.new("Error processing AI lesson insight: #{exception.message}")
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
        system_prompt: system_prompt,
        output: content,
        usage: response_body['usage'],
        start_time: start_time,
        end_time: end_time,
      )

      return {status: response.code, json: content}
    else
      raise StandardError.new("Received status code #{response.code} when processing AI lesson insight: #{response.body}")
    end
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

  # Returns true when the stored insight should be regenerated.
  def self.lesson_insight_stale?(insight, unit_id, lesson_id, student_id)
    # Never regenerate if the insight is less than 5 minutes old.
    return false if insight.updated_at >= 5.minutes.ago

    current_max = max_user_level_updated_at(unit_id, lesson_id, student_id)
    # Stale when any UserLevel was touched after the insight was last generated.
    current_max.present? && current_max > insight.updated_at
  end

  def self.generate_lesson_feedback(unit_id, lesson_id, teacher_id, student_id, section_id)
    system_prompt = AiSystemPrompts::StudentSnapshotPromptHelper.get_feedback_system_prompt(lesson_id, unit_id, student_id, teacher_id, section_id)
    client = Client.new(API_KEY, MODEL)

    begin
      response = client.request_lesson_feedback(system_prompt)
    rescue Net::ReadTimeout
      raise StandardError.new("Timeout waiting for AI client to return lesson feedback")
    rescue StandardError => exception
      raise StandardError.new("Error processing AI lesson feedback: #{exception.message}")
    end
    if response.code == 200
      response_body = JSON.parse(response.body)
      response_body = response_body['choices'][0]['message']['content']
      evaluation =  {status: response.code, json: response_body}

      feedback_json = JSON.parse(response_body)
      feedback_string = feedback_json.is_a?(Hash) ? feedback_json['feedback'] : feedback_json
      saved_record = save_lesson_feedback(feedback_string, student_id, lesson_id, section_id, teacher_id)
      return {status: evaluation[:status], record: saved_record}
    else
      raise StandardError.new("Received status code #{response.code} when processing AI lesson feedback: #{response.body}")
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

      response_props =
        {
          progress: {type: "string"},
          misconceptions: {type: "string"},
          assessment: {type: "string"},
          next_steps: {type: "string"},
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
end
