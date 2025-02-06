module OpenaiChatHelper
  class Client
    attr_accessor :api_key, :model

    OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"
    DEFAULT_TEMPERATURE = 0

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def request_chat_completion(messages, temperature = DEFAULT_TEMPERATURE)
      # Set up the API endpoint URL and request headers
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }
      headers["OpenAI-Organization"] = CDO.openai_chat_completion_org_id if CDO.openai_chat_completion_org_id

      data = {
        model: model,
        temperature: temperature,
        messages: messages
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
