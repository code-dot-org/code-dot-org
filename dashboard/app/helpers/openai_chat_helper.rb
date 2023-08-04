module OpenaiChatHelper
  OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"
  OPENAI_CHAT_COMPLETION_API_KEY = CDO.openai_chat_completion_api_key
  TEMPERATURE = 0
  GPT_MODEL = 'gpt-3.5-turbo'

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
      read_timeout: DCDO.get('openai_http_read_timeout', 10)
    )
  end

  def self.get_chat_completion_response_message(response)
    # Parse the response JSON and return the chat response message and status
    response_body = JSON.parse(response.body)
    response_body = response_body['choices'][0]['message'] if response.code == 200
    return {status: response.code, json: response_body}
  end
end
