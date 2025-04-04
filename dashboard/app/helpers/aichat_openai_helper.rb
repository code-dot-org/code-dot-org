require 'cdo/aws/metrics'

# Prepares the input (user/level system prompt, context, existing chat history)
# from AI Chat lab to be sent to the OpenAI API, and sends the request to the API.
#
# This module is structured very similarly to the AichatSagemakerHelper module,
# which manages AI Chat lab's interaction with models that use AWS Sagemaker.
module AichatOpenaiHelper
  API_KEY = CDO.openai_student_learning_api_key
  MODEL = SharedConstants::AICHAT_MODEL_VERSION

  def self.get_openai_assistant_response(aichat_model_customizations, stored_messages, new_message, level_id, encrypted_channel_id, user_id)
    messages = format_messages(
      aichat_model_customizations,
      stored_messages,
      new_message,
      level_id,
      encrypted_channel_id
    )

    # We expose a temperature scale of 0.1-1 to users of AI Chat Lab, but OpenAI's API allows a scale of 0-2.
    response, usage = request_chat_completion(
      messages,
      aichat_model_customizations['temperature'].to_f * 2
    )
    report_usage_metrics(usage, messages, level_id, encrypted_channel_id, user_id)
    response
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
    [response, body&.dig('usage')]
  end

  def self.get_instructions(system_prompt, level_system_prompt, retrieval_contexts)
    instructions = ""
    instructions = level_system_prompt + " " unless level_system_prompt.empty?
    instructions << (system_prompt + " ") unless system_prompt.empty?
    instructions << retrieval_contexts.join(" ") if retrieval_contexts
    instructions
  end

  # Reports and logs usage metrics to Cloudwatch
  def self.report_usage_metrics(usage, messages, level_id, encrypted_channel_id, user_id)
    return unless usage

    filtered = messages.reject {|message| message[:content].is_a?(String)}
    messages_with_assets_count = filtered.count {|message| message[:content].any? {|c| c[:type] != 'text'}}
    pdfs_count = filtered.sum {|message| message[:content].count {|c| c[:type] == 'file'}}
    images_count = filtered.sum {|message| message[:content].count {|c| c[:type] == 'image_url'}}

    is_multimodal = messages_with_assets_count > 0

    input_rate = 0.15 / 1_000_000 # $0.15 per million tokens
    output_rate = 0.60 / 1_000_000 # $0.60 per million tokens
    input_cost = usage['prompt_tokens'] * input_rate
    output_cost = usage['completion_tokens'] * output_rate
    total_cost = input_cost + output_cost

    log_payload = {
      event: 'aichat_openai_usage',
      multimodal: is_multimodal,
      usage: usage,
      messages: {
        total: messages.count,
        withAssets: messages_with_assets_count,
        pdfs: pdfs_count,
        images: images_count,
      },
      cost: {
        input: "$#{format("%.6f", input_cost)}",
        output: "$#{format("%.6f", output_cost)}",
        total: "$#{format("%.6f", total_cost)}"
      },
      levelId: level_id,
      channelId: encrypted_channel_id,
      userId: user_id
    }

    CDO.log.info log_payload.to_json.to_s if DCDO.get('log_aichat_openai_usage', true)

    metrics = ['prompt_tokens', 'completion_tokens'].map do |key|
      {
        metric_name: "AichatOpenaiRequest.#{key.camelize(:upper)}",
        value: usage[key],
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

  def self.client
    OpenaiChatHelper::Client.new(API_KEY, MODEL)
  end
end
