module OpenaiChatHelper
  OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"
  OPENAI_CHAT_COMPLETION_API_KEY = CDO.openai_chat_completion_api_key
  TEMPERATURE = 0
  OPENAI_AICHAT_SAFETY_API_KEY = CDO.openai_aichat_safety_api_key

  # We should always specify a version for the LLM so the results don't unexpectedly change.
  GPT_MODEL = SharedConstants::AI_TUTOR_CHAT_MODEL_VERISON
  AICHAT_SAFETY_GPT_MODEL = SharedConstants::AICHAT_SAFETY_MODEL_VERSION

  def self.request_chat_completion(messages)
    # Set up the API endpoint URL and request headers
    headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{OPENAI_CHAT_COMPLETION_API_KEY}"
    }
    headers["OpenAI-Organization"] = CDO.openai_chat_completion_org_id if CDO.openai_chat_completion_org_id

    data = {
      model: GPT_MODEL,
      temperature: TEMPERATURE,
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
  def self.request_safety_check(text, safety_system_prompt)
    # Set up the API endpoint URL and request headers
    headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{OPENAI_AICHAT_SAFETY_API_KEY}"
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
      model: AICHAT_SAFETY_GPT_MODEL,
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

  def self.get_chat_completion_response_message(response)
    # Parse the response JSON and return the chat response message and status
    response_body = JSON.parse(response.body)
    response_body = response_body['choices'][0]['message'] if response.code == 200
    return {status: response.code, json: response_body}
  end
end
