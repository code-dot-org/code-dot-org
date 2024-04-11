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
    new_message_text = params[:chatContext]["userMessage"]
    puts "new_message_text = #{new_message_text}"
    filter_result = ShareFiltering.find_failure(new_message_text, locale) if new_message_text
    # If the content is inappropriate, we skip sending to endpoint and instead hardcode a warning response on the front-end.
    return render(status: :ok, json: {status: filter_result.type, flagged_content: filter_result.content}) if filter_result
    # TODO: Format input to send to Sagemaker.
    payload = {
      inputs: [params[:inputs]],
      parameters: {"temperature": params[:temperature]},
    }
    response = request_chat_completion(payload)
    render(status: response[:status], json: response[:json])
  end

  def has_required_params?
    params[:inputs].present? && params[:temperature].present? && params[:chatContext].present?
  end

  def request_chat_completion(payload)
    puts "Requesting chat completion from Sagemaker"
    response_body = {role: "assistant", content: "This is an assistant response from Sagemaker"}
    response_code = 200
    return {status: response_code, json: response_body}
  end
end
