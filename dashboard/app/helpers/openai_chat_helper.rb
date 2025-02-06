module OpenaiChatHelper
  OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"
  OPENAI_CHAT_COMPLETION_API_KEY = CDO.openai_chat_completion_api_key
  TEMPERATURE = 0
  OPENAI_AICHAT_SAFETY_API_KEY = CDO.openai_aichat_safety_api_key

  # We should always specify a version for the LLM so the results don't unexpectedly change.
  GPT_MODEL = SharedConstants::AI_TUTOR_CHAT_MODEL_VERISON
  AICHAT_GPT_MODEL = SharedConstants::AICHAT_MODEL_VERSION

  # A class that takes in an API key and a model type in the constructor and
  # provides a method to request chat completions from the OpenAI API.
  class OpenAIChatRequester
    attr_accessor :api_key, :model

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def request_chat_completion(messages, temperature = TEMPERATURE)
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

    # Used to check safety content given text with the given moderation system prompt.
    def request_safety_check(text, safety_system_prompt)
      # Set up the API endpoint URL and request headers
      headers = {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{api_key}"
      }

      # Format messages with text to be checked for safety and moderation system prompt.
      messages = [
        {
          role: "system",
          content: safety_system_prompt
        },
        {
          role: "user",
          content: text
        }
      ]
      data = {
        model: model,
        messages: messages
      }

      response = HTTParty.post(
        OPEN_AI_URL,
        headers: headers,
        body: data.to_json,
        open_timeout: DCDO.get('openai_http_open_timeout', 5),
        read_timeout: DCDO.get('openai_http_read_timeout', 30)
      )
      raise "OpenAI request failed with status #{response.code}: #{response.body}" unless response.success?
      response.body
    end
  end

  def self.aichat_base_model_client
    OpenAIChatRequester.new(OPENAI_CHAT_COMPLETION_API_KEY, AICHAT_GPT_MODEL)
  end

  def self.aichat_safety_client
    OpenAIChatRequester.new(OPENAI_AICHAT_SAFETY_API_KEY, AICHAT_GPT_MODEL)
  end

  def self.aitutor_client
    OpenAIChatRequester.new(OPENAI_CHAT_COMPLETION_API_KEY, GPT_MODEL)
  end
end
