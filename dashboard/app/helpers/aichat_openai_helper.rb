# Prepares the input (user/level system prompt, context, existing chat history)
# from AI Chat lab to be sent to the OpenAI API, and sends the request to the API.
#
# This module is structured very similarly to the AichatSagemakerHelper module,
# which manages AI Chat lab's interaction with models that use AWS Sagemaker.
module AichatOpenaiHelper
  API_KEY = CDO.openai_student_learning_api_key
  MODEL = SharedConstants::AICHAT_MODEL_VERSION

  def self.get_openai_assistant_response(aichat_model_customizations, stored_messages, new_message, level_id, encrypted_channel_id)
    messages = format_messages(
      aichat_model_customizations,
      stored_messages,
      new_message,
      level_id,
      encrypted_channel_id
    )

    # We expose a temperature scale of 0.1-1 to users of AI Chat Lab, but OpenAI's API allows a scale of 0-2.
    request_chat_completion(
      messages,
      aichat_model_customizations['temperature'].to_f * 2
    )
  end

  def self.format_messages(aichat_model_customizations, stored_messages, new_message, level_id, encrypted_channel_id)
    level = Level.find_by(id: level_id)
    level_system_prompt = level&.properties&.dig('aichat_settings', 'levelSystemPrompt') || ""
    level_name = level&.name

    instructions = get_instructions(
      aichat_model_customizations['systemPrompt'],
      level_system_prompt,
      aichat_model_customizations['retrievalContexts']
    )

    [
      {role: "system", content: instructions},
      *stored_messages.map {|message| format_message(message, encrypted_channel_id, level_name)},
      format_message(new_message, encrypted_channel_id, level_name)
    ]
  end

  def self.format_message(message, encrypted_channel_id, level_name)
    formatted = {role: message['role'], content: [{type: "text", text: message['chatMessageText']}]}
    message['assets']&.each do |asset|
      data = AichatAssetHelper.get_asset_data_uri(asset, encrypted_channel_id, level_name)
      is_pdf = File.extname(asset["filename"]) == '.pdf'
      formatted[:content] << if is_pdf
                               {type: 'file', file: {filename: asset["filename"], file_data: data}}
                             else
                               {type: "image_url", image_url: {url: data}}
                             end
    end
    formatted
  end

  def self.request_chat_completion(messages, temperature)
    http_response = client.request_chat_completion(messages, temperature)
    body = JSON.parse(http_response.body)
    raise StandardError.new(body['error']) if body['error']
    response = body&.dig("choices")&.first&.dig('message', 'content')
    raise StandardError.new("Unexpected response from OpenAI: #{body}") unless response
    response
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
