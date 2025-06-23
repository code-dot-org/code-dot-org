require 'cdo/aws/metrics'

# Note for PR (TODO - discuss and remove this note before PR merged):
# -------------------------------------------------------------------
# This file has multiple classes that would obviously be broken out into different
# files.  I just wanted to discuss where these might go as I'm not sure they belong
# in the 'helper' directory
# -------------------------------------------------------------------

# TODO - check naming convention for classes
class GenericAIClient
  # TODO - Rename me to match actual functionality
  def post_request(aichat_model_customizations, stored_messages, new_message, level_id, encrypted_channel_id, user_id, project_id)
    # start_time = Time.now

    temperature = aichat_model_customizations['temperature'].to_f

    level = Level.find_by(id: level_id)

    # level system prompt - string or nil
    # TODO - determine if we're still using level system prompts
    level_system_prompt = level&.properties&.dig('aichat_settings', 'levelSystemPrompt')

    # level name - string
    level_name = level&.name

    # system prompt - string or nil
    system_prompt = aichat_model_customizations['systemPrompt']

    # system prompt - array of strings or nil
    retrieval_contexts = aichat_model_customizations['retrievalContexts']

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

    headers = {
      "Content-Type" => "application/json",
    }.merge(custom_headers)

    http_response = HTTParty.post(
      url,
      headers: headers,
      body: body.to_json,
      open_timeout: DCDO.get('openai_http_open_timeout', 5),
      read_timeout: DCDO.get('openai_http_read_timeout', 30)
    )

    response_body = JSON.parse(http_response.body)

    raise_possible_response_errors(response_body)

    # TODO - the fact we called this generate_text_response suggests we need to adapt this class for multimodal
    # *responses* even if we have a way to disable them in level builder
    response_text = generate_text_response(response_body)

    # TODO - add back report_usage_and_throttling_metrics
    # This requires some thought around how to make it implementation agnostics re: 'messages' and 'usage'

    # if model_id == "gpt-4o-mini"
    #   usage = response_body&.dig('usage')
    #   response_time = Time.now - start_time
    #   report_usage_and_throttling_metrics(usage, messages, level_id, project_id, user_id, model_id, response_time)
    # end

    raise StandardError.new("Unexpected response from AI API: #{http_response.body}") unless response_text

    response_text
  end

  attr_accessor :api_key, :model

  TOKEN_THROTTLING_PREFIX = "aichat/tokens/".freeze
  DEFAULT_TOKEN_LIMIT_PER_DAY = 10_000_000
  ONE_DAY_S = 60 * 60 * 24
  DEFAULT_TEMPERATURE = 0

  private def url
    raise_not_implemented_error
  end

  private def raise_possible_response_errors
    raise_not_implemented_error
  end

  private def generate_text_response
    raise_not_implemented_error
  end

  private def custom_headers
    {}
  end

  private def combine_system_instructions(system_prompt, level_system_prompt, retrieval_contexts)
    instructions = ""
    instructions << (level_system_prompt + " ") if level_system_prompt.present?
    instructions << (system_prompt + " ") if system_prompt.present?
    instructions << retrieval_contexts.join(" ") if retrieval_contexts.present?
    instructions
  end

  private def token_throttling_key(model_id, user_id)
    # "/user/" included to leave space for potential throttling at the classroom/teacher level.
    # Token throttling also only currently in place for gpt-4o-mini, but inclusion of model ID leaves space for other models.
    TOKEN_THROTTLING_PREFIX + 'model/' + model_id + '/user/' + user_id.to_s
  end

  # TODO - rework this to make it provider agnostic and add call
  # Reports and logs usage metrics to Cloudwatch and our throttling system.
  private def report_usage_and_throttling_metrics(usage, messages, level_id, project_id, user_id, model_id, response_time)
    unless usage
      Honeybadger.notify("OpenAI response detected without usage statistics, which are required for throttling.")
      return
    end

    # Typical usage of our throttling module calls throttle at the point where it's deciding whether to throttle or not.
    # In this case, we are just reporting token usage,
    # and subsequent calls to our aichat_request endpoint check whether the user has been throttled.
    #
    # Prompt tokens are by far and away our largest cost driver (and the piece that users actually control),
    # so we throttle on that.
    limit = DCDO.get('aichat_token_limit_per_day', DEFAULT_TOKEN_LIMIT_PER_DAY)
    Cdo::Throttle.throttle(token_throttling_key(model_id, user_id),
      limit,
      ONE_DAY_S,
      throttle_for: ONE_DAY_S,
      count: usage['prompt_tokens']
    )

    messages_with_assets_count = messages.count do |message|
      message[:content].any? {|c| c[:type] != 'text'}
    end
    pdfs_count = messages.sum do |message|
      message[:content].count {|c| c[:type] == 'file'}
    end
    images_count = messages.sum do |message|
      message[:content].count {|c| c[:type] == 'image_url'}
    end

    is_multimodal = messages_with_assets_count > 0

    # Pull out token counts and calculate costs
    prompt_tokens = usage['prompt_tokens'] || 0
    completion_tokens = usage['completion_tokens'] || 0
    cached_tokens = usage.dig('prompt_tokens_details', 'cached_tokens') || 0

    input_rate = 0.15 / 1_000_000 # $0.15 per million tokens
    cached_input_rate = 0.075 / 1_000_000 # $0.075 per million tokens
    output_rate = 0.60 / 1_000_000 # $0.60 per million tokens

    input_cost = (prompt_tokens * input_rate) + (cached_tokens * cached_input_rate)
    output_cost = completion_tokens * output_rate
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
      responseTime: response_time,
      levelId: level_id,
      projectId: project_id,
      userId: user_id
    }

    CDO.log.info log_payload.to_json.to_s if DCDO.get('log_aichat_openai_usage', false)

    metrics = [
      ['PromptTokens', prompt_tokens], ['CompletionTokens', completion_tokens], ['CachedTokens', cached_tokens]
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

class OpenaiCompletionsClient < GenericAIClient
  def initialize(api_key, model)
    @api_key = api_key
    @model = model
  end

  private def url
    "https://api.openai.com/v1/chat/completions"
  end

  private def custom_headers
    {
      "Authorization" => "Bearer #{api_key}"
    }
  end

  private def raise_possible_response_errors(response_body)
    raise StandardError.new(response_body['error']) if response_body['error']
  end

  private def generate_text_response(response_body)
    response_body&.dig("choices")&.first&.dig('message', 'content')
  end

  private def create_body(
    stored_messages,
    new_message,
    system_instructions,
    temperature,
    level_name,
    encrypted_channel_id
    )

    # We expose a temperature scale of 0.1-1 to users, but OpenAI's API allows a scale of 0-2.
    temperature *= 2

    messages = [
      {role: "system", content: [{type: "text", text: system_instructions}]},
      *stored_messages.map {|message| format_message(message, encrypted_channel_id, level_name)},
      format_message(new_message, encrypted_channel_id, level_name)
    ]

    body = {
      model: model,
      temperature: temperature,
      messages: messages
    }

    body
  end

  private def format_message(message, encrypted_channel_id, level_name)
    formatted = {role: message['role'], content: [{type: "text", text: message['chatMessageText']}]}
    message['assets']&.each do |asset|
      filename = asset["filename"]
      source = asset["source"]
      is_pdf = File.extname(filename) == '.pdf'

      # TODO - discuss how we want to handle any errors encountered when accessing underlying storage
      # Currently there are multiple code paths that can raise (and multiple exceptions that can be raised
      # through them)
      data_uri = AichatAssetHelper.get_asset_data_uri(filename, source, encrypted_channel_id, level_name)

      formatted[:content] << if is_pdf
                               {type: 'file', file: {filename: asset["filename"], file_data: data_uri}}
                             else
                               {type: "image_url", image_url: {url: data_uri}}
                             end
    end
    formatted
  end
end

class GeminiClient < GenericAIClient
  def initialize(api_key, model)
    @api_key = api_key
    @model = model
  end

  # TODO secret will be per product (ai chat vs tutor) - currently we have just one for both
  private def url
    "https://generativelanguage.googleapis.com/v1beta/models/#{model}:generateContent?key=#{api_key}"
  end

  private def raise_possible_response_errors(response_body)
    # TODO - check that works with all possible gemini errors
    # gemini (openid compat layer) was returning an **array** with object element not an object
    raise StandardError.new(response_body['error']) if response_body['error']
  end

  private def generate_text_response(response_body)
    response_body&.dig("candidates")&.first&.dig('content', 'parts')&.first&.dig('text')
  end

  # convert role to gemini's role
  # TODO - verify role is only ever 'user' or 'assistant'
  private def convert_role(role)
    if role == 'assistant'
      return 'model'
    end

    # else 'user', which is still 'user' for gemini
    role
  end

  private def format_content_item(message, encrypted_channel_id, level_name)
    # TODO - determine if any benefit for files to come first.
    # This seems more logical regarding how it is currently displayed
    # in the UI (above text) and thus possibly how user may refer to is
    # (referencing the previous files)

    content_item = {
      role: convert_role(message['role']),

      parts: [
        {
          text: message['chatMessageText']
        }
      ]
    }

    # TODO - filename need to be added to message which is necessary to
    # reference a given file when multiple are uploaded. This is not
    # possible natively in gemini but can be handled with additional
    # message snippet. Filename is accessible with: asset["filename"]

    message['assets']&.each do |asset|
      filename = asset["filename"]
      source = asset["source"]

      # TODO - discuss how we want to handle any errors encountered when accessing underlying storage
      base64_string = AichatAssetHelper.get_asset_base64_string(filename, source, encrypted_channel_id, level_name)

      mime_type = Rack::Mime.mime_type(File.extname(filename))
      content_item[:parts] << {inline_data: {mime_type: mime_type, data: base64_string}}
    end

    content_item
  end

  private def create_body(
    stored_messages,
    new_message,
    system_instruction_text,
    temperature,
    level_name,
    encrypted_channel_id
    )

    # We expose a temperature scale of 0.1-1 to users, but Gemini's latest APIs allow a scale of 0-2.
    temperature *= 2

    body = {
      generationConfig: {
        temperature: temperature
      },
      system_instruction: {
        parts: [
          {
            text: system_instruction_text
          }
        ]
      },
      contents: [
        *stored_messages.map {|message| format_content_item(message, encrypted_channel_id, level_name)},
        format_content_item(new_message, encrypted_channel_id, level_name)
      ]
    }

    body
  end
end

class OpenaiUserInputResponseTimeout < StandardError; end

# Prepares the input (user/level system prompt, context, existing chat history)
# from AI Chat lab to be sent to the OpenAI API, and sends the request to the API.
#
# This module is structured very similarly to the AichatSagemakerHelper module,
# which manages AI Chat lab's interaction with models that use AWS Sagemaker.
module AichatOpenaiHelper
  # TODO - dedup
  TOKEN_THROTTLING_PREFIX = "aichat/tokens/".freeze

  def self.get_openai_assistant_response(aichat_model_customizations, stored_messages, new_message, level_id, project_id, user_id)
    encrypted_channel_id = storage_encrypt_channel_id(storage_id_for_user_id(user_id), project_id)

    # TODO - remove me this is duped
    model_id = aichat_model_customizations["selectedModelId"]

    client = get_client(model_id)

    # Note for PR (TODO - discuss and remove this note before PR merged):
    # --------------------------------------------------------------------
    # There are various errors that can occur but are not rescued. Specifically there are
    # various errors raised or propagated through `AichatAssetHelper` when messages contain assets
    # (i.e. multimodal) and should be dealt with somehow.  Also note, these errors don't seem to be
    # dealt with in the caller (AichatRequestChatCompletionJob)
    # --------------------------------------------------------------------
    begin
      response = client.post_request(
        aichat_model_customizations,
        stored_messages,
        new_message,
        level_id,
        encrypted_channel_id,
        user_id,
        project_id
      )
    rescue Net::ReadTimeout
      raise OpenaiUserInputResponseTimeout.new("Timeout waiting for OpenAI to provide response to user input.")
    end

    response
  end

  # TODO - dedup - currently used here: dashboard/app/controllers/aichat_requests_controller.rb
  def self.token_throttling_key(model_id, user_id)
    # "/user/" included to leave space for potential throttling at the classroom/teacher level.
    # Token throttling also only currently in place for gpt-4o-mini, but inclusion of model ID leaves space for other models.
    TOKEN_THROTTLING_PREFIX + 'model/' + model_id + '/user/' + user_id.to_s
  end

  # TODO - this is a quick hack, we need a map from model_id to model/key (not sure why model id isn't just model but whatever)
  def self.get_client(model_id)
    if model_id == "gpt-4o-mini"
      return OpenaiCompletionsClient.new(CDO.openai_student_learning_api_key, SharedConstants::AICHAT_MODEL_VERSION)
    else # TODO - check specific models
      return GeminiClient.new(CDO.google_gemini_student_learning_api_key, model_id)
    end
  end
end
