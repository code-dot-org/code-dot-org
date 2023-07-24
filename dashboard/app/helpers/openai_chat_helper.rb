require 'cdo/throttle'

module OpenaiChatHelper
  OPENAI_CHAT_PREFIX = "openai_chat/".freeze
  OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"
  OPENAI_CHAT_API_KEY = CDO.openai_chat_api_key
  CODE_ORG_ID = CDO.openai_org_id
  TEMPERATURE = 0
  GPT_MODEL = 'gpt-3.5-turbo'

  # Requests a chat completion from OpenAI's API.
  # This method is throttled because it makes a third-party request to OpenAI.
  # @param [String] messages - Array of messages
  # @param [String] id - Unique identifier for throttling.
  # @param [Integer] limit - Number of requests allowed over period.
  # @param [Integer] period - Period of time in seconds.
  def self.throttled_request_chat_completion(messages, id, limit, period)
    return if Cdo::Throttle.throttle(OPENAI_CHAT_PREFIX + id.to_s, limit, period)
    # Set up the API endpoint URL and request headers
    headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{OPENAI_CHAT_API_KEY}",
      "OpenAI-Organization" => CODE_ORG_ID
    }

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
      read_timeout: DCDO.get('openai_http_read_timeout', 5)
    )
  end

  def self.get_chat_completion_response_message(response)
    # Parse the response JSON and return the chat response message and status
    response_body = JSON.parse(response.body)
    response_body = response_body['choices'][0]['message'] if response.code == 200
    return {status: response.code, json: response_body}
  end
end
