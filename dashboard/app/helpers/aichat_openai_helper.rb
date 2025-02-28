# Prepares the input (user/level system prompt, context, existing chat history)
# from AI Chat lab to be sent to the OpenAI API, and sends the request to the API.
#
# This module is structured very similarly to the AichatSagemakerHelper module,
# which manages AI Chat lab's interaction with models that use AWS Sagemaker.
module AichatOpenaiHelper
  API_KEY = CDO.openai_student_learning_api_key
  MODEL = SharedConstants::AICHAT_MODEL_VERSION

  def self.get_openai_assistant_response(aichat_model_customizations, stored_messages, new_message, level_id)
    messages = format_messages(
      aichat_model_customizations,
      stored_messages,
      new_message,
      level_id
    )

    # We expose a temperature scale of 0.1-1 to users of AI Chat Lab, but OpenAI's API allows a scale of 0-2.
    request_chat_completion(
      messages,
      aichat_model_customizations['temperature'].to_f * 2
    )
  end

  def self.format_messages(aichat_model_customizations, stored_messages, new_message, level_id)
    level_system_prompt = Level.find_by(id: level_id)&.properties&.dig('aichat_settings', 'levelSystemPrompt') || ""
    instructions = get_instructions(
      aichat_model_customizations['systemPrompt'],
      level_system_prompt,
      aichat_model_customizations['retrievalContexts']
    )

    r = [{role: "system", content: instructions}]

    messages_to_add = stored_messages.map do |message|
      value =
        if message['image']
          {role: message['role'], content: [{type: "image_url", image_url: {url: message['image']}}]}
        else
          {role: message['role'], content: message['chatMessageText']}
        end
      value
    end
    r.append(*messages_to_add)

    r <<
      if new_message['image']
        {role: 'user', content: [{type: "image_url", image_url: {url: new_message['image']}}]}
      else
        {role: 'user', content: new_message['chatMessageText']}
      end

    puts r
    r
  end

  def self.request_chat_completion(messages, temperature)
    http_response = client.request_chat_completion(messages, temperature)
    puts JSON.parse(http_response.body)
    JSON.parse(http_response.body)['choices'][0]['message']['content']
  end

  def self.get_instructions(system_prompt, level_system_prompt, retrieval_contexts)
    instructions = ""
    instructions = level_system_prompt + " " unless level_system_prompt.empty?
    instructions << (system_prompt + " ") unless system_prompt.empty?
    instructions << retrieval_contexts.join(" ") if retrieval_contexts
    instructions
  end

  def self.client
    OpenaiChatHelper::Client.new(API_KEY, MODEL)
  end
end
