class OpenaiSessionsController < ApplicationController
  include OpenaiChatHelper
  authorize_resource class: false

  OPENAI_CHAT_API_KEY = CDO.openai_chat_api_key
  CODE_ORG_ID = CDO.openai_org_id
  TEMPERATURE = 0
  GPT_MODEL = 'gpt-3.5-turbo'

  # POST /openai/chat_completion
  def chat_completion
    puts "chat_completion"
    puts "#{request.body}"
    puts "#{request.body.read}"
    body = JSON.parse(request.body.read)
    messages_to_send = body["messages"]

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
      messages: message_to_send
    }

    # Send the request to the API endpoint
    response = OpenaiChatHelper.get_chat_completion_response(headers, data)

    # Parse the response JSON and return the completed text
    if response.code == 200
      response_body = JSON.parse(response.body)
      response = response_body['choices'][0]['message']
      render json: response
    else
      render json: {error: "Chat completion failed: #{response.to_json}"}, status: :bad_request
    end
  end

  private def has_required_params?(params)
    begin
      params.require(params)
    rescue ActionController::ParameterMissing
      return false
    end
    true
  end
end
