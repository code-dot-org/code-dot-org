module OpenaiChatHelper
  OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"

  def self.request_chat_completion(headers, data)
    HTTParty.post(OPEN_AI_URL, headers: headers, body: data.to_json)
  end

  def self.get_chat_completion_response_message(response)
    # Parse the response JSON and return the chat response message
    if response.code == 200
      response_body = JSON.parse(response.body)
      return response_body['choices'][0]['message']
    else
      return {error: "Chat completion failed: #{response.to_json}"}, status: :bad_request
    end
  end
end
