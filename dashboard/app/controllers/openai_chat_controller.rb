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
    filter_result = ShareFiltering.find_failure(message, locale, {}) if message
    # If the content is profane, we skip sending to OpenAI and instead hardcode a warning response on the front-end.
    return render(status: :ok, json: {safety_status: filter_result.type, flagged_content: filter_result.content}) if filter_result && filter_result.type == 'profanity'

    # The system prompt can be passed in as a param for testing purposes. If there isn't a custom
    # system prompt, create one based on the level context.
    level_id = params[:levelId]
    script_id = params[:scriptId]

    system_prompt = !!params[:systemPrompt] ? params[:systemPrompt] : AitutorSystemPromptHelper.get_system_prompt(level_id, script_id)

    messages = prepend_system_prompt(system_prompt, params[:messages])

    response = OpenaiChatHelper.request_chat_completion(messages)
    chat_completion_return_message = OpenaiChatHelper.get_chat_completion_response_message(response)
    # We currently allow PII flagged content through to OpenAI because false positives were impacting user experience.
    # We send the flagged content along in the request so we can log it for analysis.
    chat_completion_return_message[:json][:safety_status] = filter_result.type if filter_result
    chat_completion_return_message[:json][:flagged_content] = filter_result.content if filter_result
    return render(status: chat_completion_return_message[:status], json: chat_completion_return_message[:json])
  end

  def has_required_messages_param?
    params[:messages].present?
  end

  private def prepend_system_prompt(system_prompt, messages)
    system_prompt_message = {
      content: system_prompt,
      role: "system"
    }

    messages.unshift(system_prompt_message)
    messages
  end
end
