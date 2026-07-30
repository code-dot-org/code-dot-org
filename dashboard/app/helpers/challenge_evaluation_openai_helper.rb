# Thin OpenAI chat completions client for challenge response evaluation.
# The caller supplies the messages and response_format (built by
# ChallengeEvaluationPromptHelper); this class only handles transport.
# Modeled on AiEvaluationOpenaiHelper::Client, with the response_format
# passed in rather than hardcoded because the schema varies per rubric.
module ChallengeEvaluationOpenaiHelper
  class Client
    attr_accessor :api_key, :model

    OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    # @param messages [Array<Hash>] chat messages, may include image_url parts
    # @param response_format [Hash] json_schema response_format param
    # @return [HTTParty::Response]
    def request_evaluation(messages, response_format)
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }

      data = {
        model: model,
        messages: messages,
        response_format: response_format,
      }

      HTTParty.post(
        OPEN_AI_URL,
        headers: headers,
        body: data.to_json,
        open_timeout: DCDO.get('openai_http_open_timeout', 5),
        # Image inputs make these requests slower than text-only evaluations,
        # so the read timeout default is higher than the shared
        # openai_http_read_timeout (30s).
        read_timeout: DCDO.get('challenge_evaluation_read_timeout', 60)
      )
    end
  end
end
