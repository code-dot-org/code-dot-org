class OpenaiChatController < ApplicationController
  include OpenaiChatHelper
  authorize_resource class: false

  # POST /openai/chat_completion
  def chat_completion
    unless has_required_messages_param?
      return render(status: :bad_request, json: {})
    end

    if has_level_id_param?
      level_id = params[:levelId]
      level = Level.find(level_id)
      test_file_contents = level.validation.values.first["text"]
      messages = params[:messages]
      messages.first["content"] = messages.first["content"] + " The contents of the test file are: #{test_file_contents}"
      messages.second["content"] = "The student's code is: " + messages.second["content"]
    else
      messages = params[:messages]
    end

    response = OpenaiChatHelper.request_chat_completion(messages)
    chat_completion_return_message = OpenaiChatHelper.get_chat_completion_response_message(response)
    return render(status: chat_completion_return_message[:status], json: chat_completion_return_message[:json])
  end

  def has_required_messages_param?
    params[:messages].present?
  end

  # levelId will be present if we need to get the level's validation files to send along with the
  # request to openai
  def has_level_id_param?
    params[:levelId].present?
  end
end
