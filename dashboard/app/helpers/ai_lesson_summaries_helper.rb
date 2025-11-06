class OpenaiLessonSummaryTimeout < StandardError; end

module AiLessonSummariesHelper
  API_KEY = CDO.openai_lesson_summaries_api_key
  MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION

  def self.get_ai_lesson_summary(lesson_id)
    system_prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(lesson_id)

    client = Client.new(API_KEY, MODEL)

    begin
      response = client.request_lesson_summary(system_prompt)
    rescue Net::ReadTimeout
      raise OpenaiLessonSummaryTimeout.new("Timeout waiting for AI client to return lesson summary.")
    end

    response_body = JSON.parse(response.body)
    response_body = response_body['choices'][0]['message']['content'] if response.code == 200
    evaluation =  {status: response.code, json: response_body}
    return {status: evaluation[:status], json: evaluation[:json]}
  end

  def self.retrieve_and_save_ai_lesson_summary(lesson_id, user_id)
    ai_lesson_summary = get_ai_lesson_summary(lesson_id)
    if ai_lesson_summary[:status] == 200
      AiLessonSummary.create!({user_id: user_id, lesson_id: lesson_id, lesson_summary: ai_lesson_summary[:json]})
    end
  end

  class Client
    attr_accessor :api_key, :model

    OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def request_lesson_summary(prompt)
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }

      data = {
        model: model,
        messages: [{
          role: "system",
          content: "You are an expert teaching assistant in a computer science classroom who has been asked to summarize the upcoming lesson to help the teacher prepare for class."
        },
                   {
                     role: "user",
                     content: prompt
                   }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lesson_summary",
            schema: {
              type: "object",
              properties: {
                learning_objective: {type: "string"},
                lesson_beats: {type: "array", items: {type: "string"}},
                misconceptions: {type: "array", items: {type: "string"}},
                tips: {type: "array", items: {type: "string"}}
              },
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
