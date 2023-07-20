class OpenaiChatController < ApplicationController
  include OpenaiChatHelper
  authorize_resource class: false

  # POST /openai/chat_completion
  def chat_completion
    unless has_required_messages_param?
      return render(status: :bad_request, json: {})
    end

    messages = params[:messages]
    response = OpenaiChatHelper.request_chat_completion(messages)
    chat_completion_return_message = OpenaiChatHelper.get_chat_completion_response_message(response)
    return render(json: chat_completion_return_message[:json]) if chat_completion_return_message[:status] == 200
    return render(status: chat_completion_return_message[:status], json: chat_completion_return_message[:json])
  end

  private def has_required_messages_param?
    begin
      params.require([:messages])
    rescue ActionController::ParameterMissing
      return false
    end

    true
  end
end
