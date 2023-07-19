module OpenaiChatHelper
    OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"
    def self.get_chat_completion_response(headers, data)
      HTTParty.post(OPEN_AI_URL, headers: headers, body: data.to_json)
    end
end
