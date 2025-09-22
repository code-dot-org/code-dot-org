module AiEvaluationOpenaiHelper
  class Client
    attr_accessor :api_key, :model

    OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def request_evaluation(student_work)
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }

      data = {
        model: model,
        messages: student_work,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "overall_evaluation",
            schema: {
              type: "object",
              properties: {
                evaluationCriteria: {type: "string"},
                aiEvaluation: {type: "string"},
                aiReasoning: {type: "string"},
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

    def request_skill_evaluations(student_work)
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }

      data = {
        model: model,
        messages: student_work,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "skills_evaluation",
            schema: {
              type: "object",
              properties: {
                skillEvaluations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      skillId: {type: "integer"},
                      skillKey: {type: "string"},
                      evaluationCriteria: {type: "string"},
                      aiEvaluation: {type: "string"},
                      aiReasoning: {type: "string"}
                    }
                  }
                }
              }
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
