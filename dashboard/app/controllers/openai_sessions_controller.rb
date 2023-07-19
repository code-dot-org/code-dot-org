class OpenaiSessionsController < ApplicationController
  include OpenaiChatHelper
  authorize_resource class: false

  OPENAI_CHAT_API_KEY = CDO.openai_chat_api_key
  CODE_ORG_ID = CDO.openai_org_id
  TEMPERATURE = 0
  GPT_MODEL = 'gpt-3.5-turbo'

  # POST /openai/chat_completion
  def chat_completion
    messages = params[:messages]

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

    response = OpenaiChatHelper.request_chat_completion(headers, data)
    render json: OpenaiChatHelper.get_chat_completion_response_message(response)
  end
end
