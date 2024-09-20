module AichatSafetyOpenaiHelper
  OPEN_AI_URL = 'https://api.openai.com/v1/chat/completions'
  OPENAI_API_KEY = CDO.openai_aichat_safety_api_key
  GPT_MODEL = 'gpt-4o-mini-2024-07-18'
  CHECK_FOR_INAPPROPRIATE_PROMPT = 'You are a content filter trying to keep a school teacher out of trouble. Determine if chat text is inappropriate for an american public middle school classroom. Examples of innapropriate content: profanity, swears, illegal behavior, insults, bullying, slurs, sex, violence, racism, sexism, threats, weapons, dirty slang, etc. If text is innapropriate respond with the single word `INAPPROPRIATE`, otherwise respond with the single word `OK`.'
  VALID_EVALUATION_RESPONSES = ['INAPPROPRIATE', 'OK']

  def self.safe?(text)
    # Try twice in case of both network errors, or model not correctly following directions and
    # replying with something other than 'INAPPROPRIATE' or 'OK'.
    Retryable.retryable(tries: 2) do
      _openai_check_safe?(text)
    end
  end

  def self._openai_check_safe?(text)
    # Call OpenAI with CHECK_FOR_INAPPROPRIATE_PROMPT to check if text is inappropriate or safe
    response = HTTParty.post(
      OPEN_AI_URL,
      headers: {
        "Content-Type" => "application/json",
        "Authorization" => "Bearer #{OPENAI_API_KEY}"
      },
      body: {
        model: GPT_MODEL,
        messages: [
          {
            content: CHECK_FOR_INAPPROPRIATE_PROMPT,
            role: "system",
          },
          {
            content: text,
            role: "user",
          }
        ]
      }.to_json,
      open_timeout: DCDO.get('openai_http_open_timeout', 5),
      read_timeout: DCDO.get('openai_http_read_timeout', 30)
    )

    raise "OpenAI request failed with status #{response.code}: #{response.body}" unless response.success?

    evaluation = JSON.parse(response.body)['choices'][0]['message']['content']
    raise "Unexpected response from OpenAI: #{evaluation}" unless VALID_EVALUATION_RESPONSES.include?(evaluation)
    return evaluation == 'OK'
  end
end
