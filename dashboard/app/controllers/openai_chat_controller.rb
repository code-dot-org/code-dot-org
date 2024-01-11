class OpenaiChatController < ApplicationController
  include OpenaiChatHelper
  authorize_resource class: false

  # POST /openai/chat_completion
  def chat_completion
    unless has_required_messages_param?
      return render(status: :bad_request, json: {})
    end

    # Check for PII / Profanity
    locale = params[:locale] || "en"
    # Just look at the most recent message from the student.
    message = params[:messages].last[:content]
    filter_result = ShareFiltering.find_failure(message, locale) if message
    # If the content is inappropriate, we skip sending to OpenAI and instead hardcode a warning response on the front-end.
    return render(status: :ok, json: {status: filter_result.type, flagged_content: filter_result.content}) if filter_result

    if has_level_id_param?
      level_id = params[:levelId]
      test_file_contents = get_validated_level_test_file_contents(level_id)
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

  def get_validated_level_test_file_contents(level_id)
    level = Level.find(level_id)

    unless level
      return render(status: :bad_request, json: {message: "Couldn't find level with id=#{level_id}."})
    end

    if level.validation.values.empty?
      return render(status: :bad_request, json: {message: "There are no test files associated with level id=#{level_id}."})
    else
      test_file_contents = ""
      level.validation.values.each do |validation|
        test_file_contents += validation["text"]
      end
      return test_file_contents
    end
  end
end
