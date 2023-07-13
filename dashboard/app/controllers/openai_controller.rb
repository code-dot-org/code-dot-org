class OpenaiController < ApplicationController
  authorize_resource class: false

  OPENAI_CHAT_API_KEY = CDO.openai_chat_api_key
  CODE_ORG_ID = CDO.openai_org
  TEMPERATURE = 0
  GPT_MODEL = 'gpt-3.5-turbo'

  # POST /openapi/chat_completion
  def openai_chat_completion
    # Set up the API endpoint URL and request headers
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{OPENAI_CHAT_API_KEY}"
    }
    headers["OpenAI-Organization"] = CODE_ORG_ID

    body = JSON.parse(request.body.read)
    # Set up the API endpoint URL and request headers
    data = {
      model: GPT_MODEL,
      temperature: TEMPERATURE,
      messages: body["messages"],
    }

    # Send the request to the API endpoint
    response = HTTParty.post(url, headers: headers, body: data.to_json)

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
