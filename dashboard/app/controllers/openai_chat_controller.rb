class OpenaiChatController < ApplicationController
  authorize_resource class: false

  API_KEY = CDO.openai_student_learning_api_key

  AI_TUTOR = SharedConstants::AI_FEATURES[:AI_TUTOR]
  AI_TUTOR_MODEL = SharedConstants::AI_TUTOR_CHAT_MODEL_VERSION

  EVALUATION = SharedConstants::AI_FEATURES[:EVALUATION]
  EVALUATE_MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION

  FEATURE_DETAILS = {
    AI_TUTOR => {
      api_key: API_KEY,
      model: AI_TUTOR_MODEL
    },
    EVALUATION => {
      api_key: API_KEY,
      model: EVALUATE_MODEL,
    }
  }

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

    feature = params[:feature]
    level_id = params[:levelId]
    unit_id = params[:unitId] ? params[:unitId] : params[:scriptId]

    # The system prompt can be passed in as a param for testing purposes. If there isn't a custom
    # system prompt, create one based on the level and feature context.
    system_prompt = !!params[:systemPrompt] ? params[:systemPrompt] : AiSystemPrompts::SystemPromptHelper.get_system_prompt(feature, level_id, unit_id)

    messages = prepend_system_prompt(system_prompt, params[:messages])

    if feature == SharedConstants::AI_FEATURES[:EVALUATION]
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
    client = client(feature)
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

  private def client(feature)
    api_key = FEATURE_DETAILS[feature][:api_key]
    model = FEATURE_DETAILS[feature][:model]
    OpenaiChatHelper::Client.new(api_key, model)
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
