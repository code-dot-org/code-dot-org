# Class to optionally pass to AichatAiClient for logging/throttling.
# Note: this file uses TypeScript type declaration syntax to describe types in comments.
# This is in line with the TypeScript-like "RubyTypes" used to actually declare the types.
class AichatAiUsageReporter
  DEFAULT_TOKEN_LIMIT_PER_DAY = 10_000_000
  ONE_DAY_S = 60 * 60 * 24

  def initialize(model_id, user_id, project_id, level_id)
    @model_id = model_id
    @user_id = user_id
    @project_id = project_id
    @level_id = level_id
  end

  def report_usage_and_throttling_metrics(usage, config, request, context, response_time)
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

    message_and_file_counts = get_messages_and_files_counts(config, request, context)
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

  # Helper to calculate the number of "messages" that have at least one file. The concept of "message" here
  # is not the same as the concept of `Message` within the `config`(`AiConfig`),`request`(`AiRequest`), and
  # `context`(`AiContext`) data structures (where `context` is a `Message[]`, `request` is a `MessagePart[]`,
  # and `config.systemInstructions` is a `MessagePart[]`). When  counting the number of "messages" that have
  # at least one file, we are treating all `config.systemInstructions` as a single message and the `request`
  # as another single message. Thus, if there are 5 files in the system instructions and 3 files in the
  # request, this would be counted as 2 messages with at least on file.
  private def get_messages_with_file_count(config, request, context)
    message_with_files_count = 0

    # Request (with all its message parts) treated as a single "message" so increment count if any of those
    # parts is a file.
    if request.any? {|part| part[:type] == 'file'}
      message_with_files_count += 1
    end

    system_instructions = config[:systemInstructions]

    # System instructions (with all its message parts) treated as a single "message" so increment count if it
    # exists (system instructions are optional) and if any of those parts is a file.
    if system_instructions && system_instructions.any? {|part| part[:type] == 'file'}
      message_with_files_count += 1
    end

    context.each do |message|
      # Each context (history) message has multiple message parts so increment count if any of those
      # parts is a file.
      if message[:parts].any? {|part| part[:type] == 'file'}
        message_with_files_count += 1
      end
    end

    message_with_files_count
  end

  # `MessagePart`s exist at different levels in the config, request, context data structures.
  # This helper combines them all into a single array.
  private def get_all_message_parts(config, request, context)
    [
      # System instructions (`MessagePart[]`) are optional so combine its parts if it exists.
      *(config[:systemInstructions] ? config[:systemInstructions] : []),

      # The request is a `MessagePart[]` so just combine that directly.
      *request,

      # The context has a parts field which is a `MessagePart[]`, so combine that too.
      *context.flat_map {|c| c[:parts]}
    ]
  end

  private def get_messages_and_files_counts(config, request, context)
    message_parts = get_all_message_parts(config, request, context)

    message_with_files_count = get_messages_with_file_count(config, request, context)

    total_files_count = message_parts.count {|part| part[:type] == 'file'}

    pdfs_count = message_parts.count {|part| part[:type] == 'file' && part[:content][:mimeType] == 'application/pdf'}

    # Currently we don't have a shared (between frontend and backd) list of image mime types
    # so for now, we just assume if not a pdf, then it's an image
    images_count = total_files_count - pdfs_count

    return_value = {
      total: message_parts.count,
      withAssets: message_with_files_count,
      pdfs: pdfs_count,
      images: images_count
    }

    return_value
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
