class OpenaiChatController < ApplicationController
  authorize_resource class: false

  API_KEY = CDO.openai_student_learning_api_key
  # MODEL = SharedConstants::AI_TUTOR_CHAT_MODEL_VERSION
  MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION
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
    feature = params[:feature]
    level_id = params[:levelId]
    unit_id = params[:unitId] ? params[:unitId] : params[:scriptId]

    system_prompt = !!params[:systemPrompt] ? params[:systemPrompt] : AiSystemPrompts::SystemPromptHelper.get_system_prompt(feature, level_id, unit_id)

    puts "------"
    puts
    puts "system_prompt"
    puts
    puts system_prompt

    puts "------"
    puts
    puts "params[:messages]"
    puts
    puts params[:messages]
    messages = prepend_system_prompt(system_prompt, params[:messages])

    puts "------"
    puts
    puts "messages"
    puts
    puts print messages

    if feature == 'evaluation'
      response_format = {
        type: "json_schema",
        json_schema: {
          name: "evaluation",
          schema: {
            type: "object",
            properties: {
              evaluation_criteria: {type: "string"},
              ai_evaluation: {type: "string"},
              ai_reasoning: {type: "string"}
            },
          }
        }
      }
    end
    response = client.request_chat_completion(messages, response_format)
    response_body = JSON.parse(response.body)
    response_body = response_body['choices'][0]['message'] if response.code == 200
    chat_completion_return_message =  {status: response.code, json: response_body}

    # We currently allow PII flagged content through to OpenAI because false positives were impacting user experience.
    # We send the flagged content along in the request so we can log it for analysis.
    chat_completion_return_message[:json][:safety_status] = filter_result.type if filter_result
    chat_completion_return_message[:json][:flagged_content] = filter_result.content if filter_result
    return render(status: chat_completion_return_message[:status], json: chat_completion_return_message[:json])
  end

  def has_required_messages_param?
    params[:messages].present?
  end

  private def client
    OpenaiChatHelper::Client.new(API_KEY, MODEL)
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
