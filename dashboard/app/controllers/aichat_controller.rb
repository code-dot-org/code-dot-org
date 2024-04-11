class AichatController < ApplicationController
  # POST /aichat/chat_completion
  def chat_completion
    unless has_required_params?
      return render(status: :bad_request, json: {})
    end
    # Check for PII / Profanity
    # Copied from ai_tutor_interactions_controller.rb - not sure if filtering is working.
    locale = params[:locale] || "en"
    # Check only the newest message from the user for inappropriate content.
    newMessageText = params[:newMessage][:chatMessageText]
    filter_result = ShareFiltering.find_failure(newMessageText, locale) if newMessageText
    # If the content is inappropriate, we skip sending to endpoint and instead hardcode a warning response on the front-end.   
    return render(status: :ok, json: {status: filter_result.type, flagged_content: filter_result.content}) if filter_result
  
    # TODO: Format input to send to Sagemaker - for now, send the messages as is.
    all_messages = params[:storedMessages].push(params[:newMessage])
    response = request_chat_completion(all_messages)
    return render(status: 200, json: {response: response})
  end

  def has_required_params?
    params[:aiCustomizations].present? && params[:newMessage].present? && params[:storedMessages].present? && params[:userId].present?
  end

  def request_chat_completion(messages)
    puts "Requesting chat completion from Sagemaker"
    messages
  end
end
