# Prepares the input (user/level system prompt, context, existing chat history)
# from AI Chat lab to be sent to the OpenAI API, and sends the request to the API.
#
# This module is structured very similarly to the AichatSagemakerHelper module,
# which manages AI Chat lab's interaction with models that use AWS Sagemaker.
module AichatOpenaiHelper
  def self.get_openai_assistant_response(aichat_model_customizations, stored_messages, new_message, level_id)
    messages = format_messages(
      aichat_model_customizations,
      stored_messages,
      new_message,
      level_id
    )

    request_chat_completion(
      messages,
      aichat_model_customizations['temperature'],
      SharedConstants::AICHAT_MODEL_VERSION
    )
  end

  def self.format_messages(aichat_model_customizations, stored_messages, new_message, level_id)
    level_system_prompt = Level.find_by(id: level_id)&.properties&.dig('aichat_settings', 'levelSystemPrompt') || ""
    instructions = get_instructions(
      aichat_model_customizations['systemPrompt'],
      level_system_prompt,
      aichat_model_customizations['retrievalContexts']
    )

    [
      {role: "system", content: instructions},
      *stored_messages.map {|message| {role: message['role'], content: message['chatMessageText']}},
      {role: 'user', content: new_message['chatMessageText']}
    ]
  end

  def self.request_chat_completion(messages, temperature, model_version)
    http_response = OpenaiChatHelper.request_chat_completion(
      messages,
      temperature,
      model_version
    )
    JSON.parse(http_response.body)['choices'][0]['message']['content']
  end

  def self.get_instructions(system_prompt, level_system_prompt, retrieval_contexts)
    instructions = ""
    instructions = level_system_prompt + " " unless level_system_prompt.empty?
    instructions << (system_prompt + " ") unless system_prompt.empty?
    instructions << retrieval_contexts.join(" ") if retrieval_contexts
    instructions
  end
end
