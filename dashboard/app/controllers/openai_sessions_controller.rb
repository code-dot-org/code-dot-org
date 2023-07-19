class OpenaiSessionsController < ApplicationController
  authorize_resource class: false

  OPENAI_CHAT_API_KEY = CDO.openai_chat_api_key
  CODE_ORG_ID = CDO.openai_org_id
  TEMPERATURE = 0
  GPT_MODEL = 'gpt-3.5-turbo'
  OPEN_AI_URL = "https://api.openai.com/v1/chat/completions"

  # POST /openai/chat_completion
  def chat_completion
    puts "chat_completion"
    body = JSON.parse(request.body.read)
    messages = body["messages"]

    # Set up the API endpoint URL and request headers
    headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{OPENAI_CHAT_API_KEY}",
      "OpenAI-Organization" => CODE_ORG_ID
    }

    # Set up the API endpoint URL and request headers
    data = {
      model: GPT_MODEL,
      temperature: TEMPERATURE,
      messages: messages
    }

    # Send the request to the API endpoint
    response = HTTParty.post(OPEN_AI_URL, headers: headers, body: data.to_json)

    # Parse the response JSON and return the completed text
    if response.code == 200
      response_body = JSON.parse(response.body)
      response = response_body['choices'][0]['message']
      render json: response
    else
      render json: {error: "Chat completion failed: #{response.to_json}"}, status: :bad_request
    end
  end
end
