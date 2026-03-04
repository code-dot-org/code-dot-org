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

    begin
      response = client.request_lesson_insight(system_prompt)
    rescue Net::ReadTimeout
      raise StandardError.new("Timeout waiting for AI client to return lesson insight")
    rescue StandardError => exception
      raise StandardError.new("Error processing AI lesson insight: #{exception.message}")
    end
    if response.code == 200
      response_body = JSON.parse(response.body)
      response_body = response_body['choices'][0]['message']['content']
      evaluation =  {status: response.code, json: response_body}
      return {status: evaluation[:status], json: evaluation[:json]}
    else
      raise StandardError.new("Received status code #{response.code} when processing AI lesson insight: #{response.body}")
    end
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
      return {status: evaluation[:status], record: saved_record, json: feedback_json['feedback']}
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
