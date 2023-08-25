class OpenaiChatController < ApplicationController
  include OpenaiChatHelper
  authorize_resource class: false

  # POST /openai/chat_completion
  def chat_completion
    unless DCDO.GET("open_ai_chat_completion", false)
      return render(status: :internal_server_error, json: {})
    end

    unless has_required_messages_param?
      return render(status: :bad_request, json: {})
    end

    messages = params[:messages]
    response = OpenaiChatHelper.request_chat_completion(messages)
    chat_completion_return_message = OpenaiChatHelper.get_chat_completion_response_message(response)
    return render(status: chat_completion_return_message[:status], json: chat_completion_return_message[:json])
  end

  def has_required_messages_param?
    params[:messages].present?
  end
end
