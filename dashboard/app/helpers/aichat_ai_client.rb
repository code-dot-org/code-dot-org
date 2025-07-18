# Combined class to hold shared logic for multiple AI API backends. This is essentially an "abstract" class
# that is never instantiated directly. The derived classes hold implementation details in required overridden
# methods. Currently the two implemented APIs (OpenAI and Gemini) are POST based REST APIs.
class AichatAiClient
  # Create an instance of the appropriate derived class based on model id.
  def self.create_instance(model_id)
    # For now we just assume it's one of the gemini models if not 'gpt-4o-mini'.
    if model_id == "gpt-4o-mini"
      return AichatOpenaiResponsesClient.new(CDO.openai_student_learning_api_key, SharedConstants::AICHAT_MODEL_VERSION)
    else
      return AichatGeminiClient.new(CDO.google_gemini_student_learning_api_key, model_id)
    end
  end

  # Call the API (through methods overridden in derived class) and get response text to send back to user.
  def get_response_text(stored_messages, new_message, temperature, system_prompt, retrieval_contexts,  model_id, level_id, encrypted_channel_id, user_id, project_id)
    start_time = Time.now

    level = Level.find_by(id: level_id)

    # Level system prompt - string or nil.
    level_system_prompt = level&.properties&.dig('aichat_settings', 'levelSystemPrompt')

    # Level name - string.
    level_name = level&.name

    system_instructions = combine_system_instructions(
      system_prompt,
      level_system_prompt,
      retrieval_contexts
    )

    body = create_body(
      stored_messages,
      new_message,
      system_instructions,
      temperature,
      level_name,
      encrypted_channel_id
    )

    http_response = HTTParty.post(
      url,
      headers: headers,
      body: body.to_json,
      open_timeout: DCDO.get('openai_http_open_timeout', 5),
      read_timeout: DCDO.get('openai_http_read_timeout', 30)
    )

    response_body = JSON.parse(http_response.body)

    raise_possible_response_errors_from_body(response_body)

    response_text = extract_text_response_from_body(response_body)

    usage = get_usage_from_body(response_body)
    messages_with_assets_count = get_messages_with_assets_count(stored_messages, new_message)

    response_time = Time.now - start_time
    report_usage_and_throttling_metrics(usage, messages_with_assets_count, level_id, project_id, user_id, model_id, response_time)

    raise StandardError.new("Unexpected response from AI API: #{http_response.body}") unless response_text

    response_text
  end

  attr_accessor :api_key, :model

  TOKEN_THROTTLING_PREFIX = "aichat/tokens/".freeze
  DEFAULT_TOKEN_LIMIT_PER_DAY = 10_000_000
  ONE_DAY_S = 60 * 60 * 24
  DEFAULT_TEMPERATURE = 0

  # Private initializer - all instances should be created with `create_instance` factory.
  private def initialize(api_key, model)
    @api_key = api_key
    @model = model
  end

  # The following methods MUST be Implemented By Derived class.
  # ------------------------------------------------------------
  # Raise NotImplementedError if these aren't implemented.
  # ------------------------------------------------------------

  # The url to send with the post request.
  private def url
    raise_not_implemented_error
  end

  # Take response_body and raise any errors if appropriate.
  private def raise_possible_response_errors_from_body
    raise_not_implemented_error
  end

  # Take response_body and extract the text response.
  private def extract_text_response_from_body
    raise_not_implemented_error
  end

  # Take response_body and extract usage data for reporting.
  private def get_usage_from_body
    raise_not_implemented_error
  end

  # Create request body from stored_messages, new_message, system_instructions, temperature,
  # level_name, and encrypted_channel_id.
  private def create_body
    raise_not_implemented_error
  end
  # ------------------------------------------------------------
  # End methods be Implemented By Derived class.

  # The default headers to be sent with the HTTParty post request.
  # The derived class can optionally override this (e.g. by extending).
  private def headers
    {
      "Content-Type" => "application/json",
    }
  end

  # Create a single system instruction from system_prompt + level_system_prompt + retrieval_contexts.
  private def combine_system_instructions(system_prompt, level_system_prompt, retrieval_contexts)
    instructions = ""
    instructions << (level_system_prompt + " ") if level_system_prompt.present?
    instructions << (system_prompt + " ") if system_prompt.present?
    instructions << retrieval_contexts.join(" ") if retrieval_contexts.present?
    instructions
  end

  # Helper to determine if a filename is an image (by extension).
  private def file_is_image?(filename)
    # Assumes if not PDF than is an image but this could be improved
    # with a list of supported extensions shared w/ frontend.
    !file_is_pdf?(filename)
  end

  # Helper to determine if a filename is a PDF (by extension).
  private def file_is_pdf?(filename)
    File.extname(filename) == '.pdf'
  end

  # Get message text, including any hidden context
  private def get_message_text(message)
    text = message['chatMessageText']
    text = text + "\n" + message['hiddenContext'] if message['hiddenContext']
    text
  end

  # Helper to get message and asset counts used for logging.
  private def get_messages_with_assets_count(stored_messages, new_message)
    messages = stored_messages + [new_message]

    pdfs_count = images_count = messages_with_assets_count = 0

    messages.each do |message|
      if message['assets'].is_a?(Array)

        messages_with_assets_count +=1 if message['assets'].size > 1

        message['assets'].each do |asset|
          filename = asset['filename']
          pdfs_count += 1 if file_is_pdf?(filename)
          images_count += 1 if file_is_image?(filename)
        end
      end
    end

    {
      total: messages.count,
       withAssets: messages_with_assets_count,
       pdfs: pdfs_count,
       images: images_count
    }
  end

  # Note - this is temporarily disabled for gemini by overriding this method there with a "no-op".
  # Reports and logs usage metrics to Cloudwatch and our throttling system.
  private def report_usage_and_throttling_metrics(usage, message_and_file_counts, level_id, project_id, user_id, model_id, response_time)
    unless usage
      Honeybadger.notify("OpenAI response detected without usage statistics, which are required for throttling.")
      return
    end

    # Pull out token counts.
    prompt_tokens = usage['prompt_tokens']
    completion_tokens = usage['completion_tokens']
    cached_prompt_tokens = usage['cached_prompt_tokens']

    # Typical usage of our throttling module calls throttle at the point where it's deciding whether to throttle or not.
    # In this case, we are just reporting token usage, and subsequent calls to our aichat_request endpoint check whether
    # the user has been throttled.
    #
    # Prompt tokens are by far and away our largest cost driver (and the piece that users actually control),
    # so we throttle on that.
    limit = DCDO.get('aichat_token_limit_per_day', DEFAULT_TOKEN_LIMIT_PER_DAY)
    Cdo::Throttle.throttle(AichatAiHelper.token_throttling_key(model_id, user_id),
      limit,
      ONE_DAY_S,
      throttle_for: ONE_DAY_S,
      count: prompt_tokens
    )

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
      levelId: level_id,
      projectId: project_id,
      userId: user_id
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

  private def raise_not_implemented_error
    raise NotImplementedError, "This method must be implemented in the derived class"
  end
end
