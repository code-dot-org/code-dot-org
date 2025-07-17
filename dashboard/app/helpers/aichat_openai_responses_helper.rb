module AichatOpenaiResponsesHelper
  class Client
    attr_accessor :api_key, :model

    OPEN_AI_URL = "https://api.openai.com/v1/responses"
    DEFAULT_TEMPERATURE = 0

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    # Optional "options" parameter is included to provide generic coverage for additional OpenAI parameters.
    # Examples include "response_format" for JSON response formatting, and "tools" for function calling.
    def request_chat_completion(input, temperature = DEFAULT_TEMPERATURE, options: {})
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }

      data = {
        model: model,
        temperature: temperature,
        input: input
      }.merge(options)

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
