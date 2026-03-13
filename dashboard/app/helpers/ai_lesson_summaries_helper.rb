class OpenaiLessonSummaryTimeout < StandardError; end

module AiLessonSummariesHelper
  API_KEY = CDO.openai_lesson_summaries_api_key
  MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION

  def self.generate_lesson_summary(lesson_id, user_id = nil, response_format = AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])
    system_prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(lesson_id, user_id, response_format)
    client = Client.new(API_KEY, MODEL)

    begin
      response = client.request_lesson_summary(system_prompt, response_format)
    rescue Net::ReadTimeout
      raise OpenaiLessonSummaryTimeout.new("Timeout waiting for AI client to return lesson summary")
    rescue StandardError => exception
      raise StandardError.new("Error processing AI lesson summary: #{exception.message}")
    end
    if response.code == 200
      response_body = JSON.parse(response.body)
      response_body = response_body['choices'][0]['message']['content']
      evaluation =  {status: response.code, json: response_body}
      return {status: evaluation[:status], json: evaluation[:json]}
    else
      raise StandardError.new("Recieved status code #{response.code} when processing AI lesson summary: #{response.body}")
    end
  end

  # Retrieves existing AiLessonSummary with the desired response_format if it exists, otherwise generates and saves it it.
  def self.retrieve_and_save_ai_lesson_summary(lesson_id, user_id, generate_script)
    summary_record = AiLessonSummary.find_or_create_by(
      user_id: user_id,
      lesson_id: lesson_id
      )

    if (!summary_record.lesson_summary.nil? && !generate_script) || (!summary_record.script.nil? && generate_script)
      return summary_record
    end

    new_lesson_summary = if summary_record.lesson_summary.nil?
                           generate_lesson_summary(lesson_id, user_id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])[:json]
                         else
                           summary_record.lesson_summary
                         end

    new_script = nil
    if generate_script
      existing_script = AiLessonSummary.where(
        lesson_id: lesson_id
      ).where.not(script: nil)&.first
      new_script = if existing_script
                     existing_script.script
                   else
                     JSON.parse(generate_lesson_summary(lesson_id, user_id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT])[:json])['podcast_script']
                   end
    end

    summary_record.update!(lesson_summary: new_lesson_summary, script: new_script)
    return summary_record
  end

  def self.perform_ai_lesson_summaries_by_unit(unit, user_id)
    lesson_ids = []
    unit.lessons.each do |lesson|
      if lesson.has_lesson_plan
        lesson_ids << lesson.id
      end
    end
    request = {
      user_id: user_id,
      lesson_ids: lesson_ids,
      unit_id: unit.id
    }
    AiLessonSummariesJob.perform_later(request: request)
  end

  def self.perform_ai_lesson_summary_by_lesson(lesson, unit, user_id)
    if lesson.has_lesson_plan
      request = {
        user_id: user_id,
        lesson_ids: [lesson.id],
        unit_id: unit.id
      }
      AiLessonSummariesJob.perform_later(request: request)
    end
  end

  class Client
    attr_accessor :api_key, :model

    OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def request_lesson_summary(prompt, response_format)
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }

      response_props = response_format == AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY] ?
        {
          learning_objective: {type: "string"},
          lesson_beats: {type: "array", items: {type: "string"}},
          misconceptions: {type: "array", items: {type: "string"}},
          tips: {type: "array", items: {type: "string"}}
        } : {
          podcast_script: {type: "string"}
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
            name: "lesson_summary",
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
