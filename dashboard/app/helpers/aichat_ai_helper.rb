require 'cdo/aws/metrics'

class OpenaiUserInputResponseTimeout < StandardError; end

# Prepares the input (user/level system prompt, context, existing chat history)
# from AI Chat lab to be sent to the AI API, and then sends the request to the API.

module AichatAiHelper
  TOKEN_THROTTLING_PREFIX = "aichat/tokens/".freeze
  DEFAULT_TOKEN_LIMIT_PER_DAY = 10_000_000
  ONE_DAY_S = 60 * 60 * 24

  class UsageReporter
    def initialize(model_id, user_id, project_id, level_id)
      @model_id = model_id
      @user_id = user_id
      @project_id = project_id
      @level_id = level_id
    end

    def report_usage_and_throttling_metrics(usage, message_and_file_counts, response_time)
      unless usage
        Honeybadger.notify("Response detected without usage statistics, which are required for throttling.")
        return
      end

      # Pull out token counts.
      prompt_tokens = usage['prompt_tokens']
      completion_tokens = usage['completion_tokens']
      cached_prompt_tokens = usage['cached_prompt_tokens']

      report_token_usage(prompt_tokens)

      # Calculate costs.
      input_rate = 0.15 / 1_000_000 # $0.15 per million tokens.
      cached_input_rate = 0.075 / 1_000_000 # $0.075 per million tokens.
      output_rate = 0.60 / 1_000_000 # $0.60 per million tokens.

      input_cost = (prompt_tokens * input_rate) + (cached_prompt_tokens * cached_input_rate)
      output_cost = completion_tokens * output_rate
      total_cost = input_cost + output_cost

      is_multimodal = message_and_file_counts[:withAssets] > 0

      log_payload = {
        event: 'aichat_openai_usage',
        multimodal: is_multimodal,
        usage: usage,
        messages: message_and_file_counts,
        cost: {
          input: "$#{format("%.6f", input_cost)}",
          output: "$#{format("%.6f", output_cost)}",
          total: "$#{format("%.6f", total_cost)}"
        },
        responseTime: response_time,
        levelId: @level_id,
        projectId: @project_id,
        userId: @user_id
      }

      CDO.log.info log_payload.to_json.to_s if DCDO.get('log_aichat_openai_usage', false)

      metrics = [
        ['PromptTokens', prompt_tokens], ['CompletionTokens', completion_tokens], ['CachedTokens', cached_prompt_tokens]
      ].map do |key, value|
        {
          metric_name: "AichatOpenaiRequest.#{key}",
          value: value,
          unit: 'Count',
          timestamp: Time.now,
          dimensions: [
            {name: 'Environment', value: CDO.rack_env},
            {name: 'Multimodal', value: is_multimodal.to_s},
          ]
        }
      end
      Cdo::Metrics.push(SharedConstants::AICHAT_METRICS_NAMESPACE, metrics)
    end

    private def report_token_usage(prompt_tokens)
      # Typical usage of our throttling module calls throttle at the point where it's deciding whether to throttle or not.
      # In this case, we are just reporting token usage, and subsequent calls to our aichat_request endpoint check whether
      # the user has been throttled.
      #
      # Prompt tokens are by far and away our largest cost driver (and the piece that users actually control),
      # so we throttle on that.
      limit = DCDO.get('aichat_token_limit_per_day', DEFAULT_TOKEN_LIMIT_PER_DAY)
      Cdo::Throttle.throttle(AichatAiHelper.token_throttling_key(@model_id, @user_id),
        limit,
        ONE_DAY_S,
        throttle_for: ONE_DAY_S,
        count: prompt_tokens
      )
    end
  end

  def self.get_api_model(model_id)
    # For now we just assume it's one of the gemini models if not 'gpt-4o-mini'.
    model_id == "gpt-4o-mini" ? SharedConstants::AICHAT_MODEL_VERSION : model_id
  end

  # Get message text, including any hidden context
  def self.get_message_text(message)
    text = message['chatMessageText']
    text = text + "\n" + message['hiddenContext'] if message['hiddenContext']
    text
  end

  def self.format_message_parts(message, encrypted_channel_id, level_name)
    parts = [
      {
        type: 'text',
        content: get_message_text(message)
      }
    ]

    message['assets']&.each do |asset|
      filename = asset["filename"]
      source = asset["source"]

      base64_string = AichatAssetHelper.get_asset_base64_string(filename, source, encrypted_channel_id, level_name)

      mime_type = Rack::Mime.mime_type(File.extname(filename))

      parts << {type: 'file', content: {name: filename, mime_type: mime_type, data: base64_string}}
    end

    parts
  end

  def self.get_config_request_context(stored_messages, new_message, temperature, system_prompt, retrieval_contexts,  model_id, level_id, encrypted_channel_id, user_id, project_id)
    level = Level.find_by(id: level_id)

    # Level system prompt - string or nil.
    level_system_prompt = level&.properties&.dig('aichat_settings', 'levelSystemPrompt')

    # Level name - string.
    level_name = level&.name

    system_instructions = []
    system_instructions << {type: 'text', content: level_system_prompt} if level_system_prompt.present?
    system_instructions << {type: 'text', content: system_prompt} if system_prompt.present?
    retrieval_contexts&.each do |retrieval_context|
      system_instructions << {type: 'text', content: retrieval_context}
    end

    config = {
      model: get_api_model(model_id),
      systemInstructions: system_instructions,
      temperature: temperature * 2
    }

    request = format_message_parts(new_message, encrypted_channel_id, level_name)

    context = []

    stored_messages&.each do |stored_message|
      # Convert stored message role from user/assistant (aichat) => user/model (internal representation)
      role = stored_message['role'] == 'assistant' ? 'model' : stored_message['role']
      context << {role: role, parts: format_message_parts(stored_message, encrypted_channel_id, level_name)}
    end

    return config, request, context
  end

  def self.get_openai_assistant_response(aichat_model_customizations, stored_messages, new_message, level_id, project_id, user_id)
    encrypted_channel_id = storage_encrypt_channel_id(storage_id_for_user_id(user_id), project_id)

    model_id = aichat_model_customizations["selectedModelId"]

    temperature = aichat_model_customizations['temperature'].to_f

    # System prompt - string or nil.
    system_prompt = aichat_model_customizations['systemPrompt']

    # System prompt - array of strings or nil.
    retrieval_contexts = aichat_model_customizations['retrievalContexts']

    usage_reporter = UsageReporter.new(model_id, user_id, project_id, level_id)
    client = AichatAiClient.create_instance(model_id, usage_reporter)

    begin
      response = client.get_response_text(
        stored_messages,
        new_message,
        temperature,
        system_prompt,
        retrieval_contexts,
        model_id,
        level_id,
        encrypted_channel_id,
        user_id,
        project_id
      )
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
