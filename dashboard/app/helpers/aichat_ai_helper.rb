require 'cdo/aws/metrics'

class OpenaiUserInputResponseTimeout < StandardError; end

# Prepares the input (user/level system prompt, context, existing chat history)
# from AI Chat lab to be sent to the AI API, and then sends the request to the API.

module AichatAiHelper
  TOKEN_THROTTLING_PREFIX = "aichat/tokens/".freeze

  def self.get_api_model(model_id)
    # For now we just assume it's one of the gemini models if not 'gpt-4o-mini'.
    model_id == "gpt-4o-mini" ? SharedConstants::AICHAT_MODEL_VERSION : model_id
  end

  def self.format_message_parts(message, encrypted_channel_id, level_name)
    parts = [
      AichatAiClientTypes::TextMessagePart.new(
        type: 'text',
        content: message['chatMessageText']
      )
    ]

    message['assets']&.each do |asset|
      filename = asset["filename"]
      source = asset["source"]

      base64_string = AichatAssetHelper.get_asset_base64_string(filename, source, encrypted_channel_id, level_name)

      parts << AichatAiClientTypes::FileMessagePart.new(
        type: 'file',
        content: AichatAiClientTypes::FileMessagePartContent.new(
          name: filename,
          mimeType: Rack::Mime.mime_type(File.extname(filename)),
          data: base64_string
        )
      )
    end

    parts
  end

  # Parse the AI Chat message format and convert it to the AI-API-endpoint-agnostic
  # "config" object and "request" and "context" arrays.
  #
  # See 'aichat_ai_client.rb' for typescript definitions of these objects.
  def self.get_config_request_context(stored_messages, new_message, temperature, system_prompt, retrieval_contexts,  model_id, level_id, encrypted_channel_id, user_id, project_id, client_type)
    level = Level.find_by(id: level_id)

    # Level system prompt - string or nil.
    level_system_prompt = level&.properties&.dig('aichat_settings', 'levelSystemPrompt')

    # Level name - string.
    level_name = level&.name

    system_instructions = []
    system_instructions << AichatAiClientTypes::TextMessagePart.new(type: 'text', content: level_system_prompt) if level_system_prompt.present?
    system_instructions << AichatAiClientTypes::TextMessagePart.new(type: 'text', content: system_prompt) if system_prompt.present?
    retrieval_contexts&.each do |retrieval_context|
      system_instructions << AichatAiClientTypes::TextMessagePart.new(type: 'text', content: retrieval_context)
    end

    system_instructions <<  AichatAiClientTypes::TextMessagePart.new(type: 'text', content: new_message['hiddenContext']) if new_message['hiddenContext']

    temperature *= if model_id == "gpt-4o-mini"
                     # If OpenAI:
                     #   We expose a temperature scale of 0.1-1 to users, but OpenAI's API allows a scale of 0-2.
                     #   As of 7/11/25, testing revealed temperatures exceeding 1.5 generate garbage and trigger timeouts/false moderation calls
                     DCDO.get('openai_temperature_scaling_factor', 1.5)
                   else
                     # Else Gemini:
                     #   We expose a temperature scale of 0.1-1 to users, but Gemini's API allows a scale of 0-2.
                     2
                   end

    config = AichatAiClientTypes::AiConfig.new(
      model: get_api_model(model_id),
      systemInstructions: system_instructions,
      temperature: temperature,
      clientType: client_type
    )

    request = format_message_parts(new_message, encrypted_channel_id, level_name)

    context = []

    stored_messages&.each do |stored_message|
      # Convert stored message role from user/assistant (aichat) => user/model (internal representation)
      role = stored_message['role'] == 'assistant' ? 'model' : stored_message['role']
      context << AichatAiClientTypes::Message.new(
        role: role,
        parts: format_message_parts(stored_message, encrypted_channel_id, level_name)
      )
    end

    return config, request, context
  end

  def self.get_openai_assistant_response(aichat_model_customizations, stored_messages, new_message, level_id, project_id, user_id)
    encrypted_channel_id = storage_encrypt_channel_id(storage_id_for_user_id(user_id), project_id) if project_id

    model_id = aichat_model_customizations["selectedModelId"]

    temperature = aichat_model_customizations['temperature'].to_f

    client_type = aichat_model_customizations['clientType']

    # System prompt - string or nil.
    system_prompt = aichat_model_customizations['systemPrompt']

    # System prompt - array of strings or nil.
    retrieval_contexts = aichat_model_customizations['retrievalContexts']

    usage_reporter = AichatAiUsageReporter.new(model_id, user_id, project_id, level_id)
    client = AichatAiClient.create_instance(model_id, usage_reporter)

    config, request, context = get_config_request_context(stored_messages, new_message, temperature, system_prompt, retrieval_contexts,  model_id, level_id, encrypted_channel_id, user_id, project_id, client_type)

    begin
      response = client.get_response_text(config, request, context)
    rescue Net::ReadTimeout
      raise OpenaiUserInputResponseTimeout.new("Timeout waiting for AI client to provide response to user input.")
    end

    response
  end

  def self.token_throttling_key(model_id, user_id)
    # "/user/" included to leave space for potential throttling at the classroom/teacher level.
    # Token throttling also only currently in place for gpt-4o-mini, but inclusion of model ID leaves space for other models.
    TOKEN_THROTTLING_PREFIX + 'model/' + model_id + '/user/' + user_id.to_s
  end
end
