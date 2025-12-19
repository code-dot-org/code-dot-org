# This class implements a gemini backend for the generic AichatAiClient.
class AichatGeminiClient < AichatAiClient
  require 'net/http'

  # Stream a response from Gemini, yielding each parsed chunk to the provided block.
  def stream_response(config, request, context = [], &block)
    AichatRubyTypes.assert_value_is_type(config, AichatAiClientTypes::AiConfig)
    AichatRubyTypes.assert_value_is_type(request, AichatAiClientTypes::AiRequest)
    AichatRubyTypes.assert_value_is_type(context, AichatAiClientTypes::AiContext)

    body = create_body(config, request, context)
    AichatAiClientTypes.validate_json_schema(body)

    uri = URI(stream_url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = DCDO.get('gemini_http_open_timeout', 5)
    http.read_timeout = DCDO.get('gemini_http_read_timeout', SharedConstants::AI_CHAT_READ_TIMEOUTS[config[:clientType]] || 30)

    req = Net::HTTP::Post.new(uri, headers.merge({'Accept' => 'application/json'}))
    req.body = body.to_json

    process_sse_stream(http, req) do |parsed_event|
      text_delta = parsed_event.dig('candidates', 0, 'content', 'parts', 0, 'text')
      block&.call(text_delta) if text_delta
    end
  rescue Net::ReadTimeout
    raise OpenaiUserInputResponseTimeout.new("Timeout waiting for AI client to provide streamed response to user input.")
  end

  # The url to send with the post request.
  private def url
    "https://generativelanguage.googleapis.com/v1beta/models/#{model}:generateContent?key=#{api_key}"
  end

  private def stream_url
    "https://generativelanguage.googleapis.com/v1beta/models/#{model}:streamGenerateContent?key=#{api_key}&alt=sse"
  end

  # Take response_body and raise any errors if appropriate.
  private def raise_possible_response_errors_from_body(response_body)
    raise StandardError.new(response_body['error']) if response_body['error']
  end

  # Take response_body and extract the text response.
  private def extract_text_response_from_body(response_body)
    response_body&.dig("candidates")&.first&.dig('content', 'parts')&.first&.dig('text')
  end

  # Take response_body and extract usage data for reporting.
  private def get_usage_from_body(response_body)
    total_tokens = response_body.dig('usageMetadata', 'totalTokenCount')
    prompt_tokens = response_body.dig('usageMetadata', 'promptTokenCount')
    thought_tokens = response_body.dig('usageMetadata', 'thoughtsTokenCount')
    cached_prompt_tokens = response_body.dig('usageMetadata', 'cachedContentTokenCount')

    {
      'prompt_tokens' =>  prompt_tokens || 0,
      'thought_tokens' => thought_tokens ||  0,
      'cached_prompt_tokens' =>  cached_prompt_tokens || 0,

      # This calculation - (total tokens - prompt tokens) seems to be what the OpenAI compat API
      # returns for completion tokens, but metrics could be made more flexible based on what's
      # available in a given API.
      'completion_tokens' => total_tokens &&  prompt_tokens ? total_tokens -  prompt_tokens : 0

    }
  end

  # Create request body.
  private def create_body(config, request, context = [])
    if config.dig(:response, :validation, :type) == 'jsonSchema'
      response_mime_type = config[:response][:mimeType]
      response_json_schema = config[:response][:validation][:schema]
    end

    body = {
      generationConfig: {
        temperature: config[:temperature],
        responseMimeType: response_mime_type,
        responseJsonSchema: response_json_schema,
        # Thinking budget documentation: https://ai.google.dev/gemini-api/docs/thinking#set-budget
        # Set to 2000 to give it some thinking tokens but still keep requests from timing out.
        thinkingConfig: {
          thinkingBudget: 2000
        }
      }.compact, # Use compact to remove null responseMimeType / responseJsonSchema
      system_instruction: {
        parts: format_parts(config[:systemInstructions])
      },
      contents: [
        *context.map do |context_item|
          {
            role: context_item[:role],
           parts: format_parts(context_item[:parts])
          }
        end,
        {role: 'user', parts: format_parts(request)}
      ]
    }
    body
  end

  # Helper to format single gemini "part" from internal representation.
  private def format_part(internal_part)
    if internal_part[:type] == 'text'
      return {
        text: internal_part[:content]
      }
    else
      # There are currently only two types so if not text then it's a file.
      return {
        inline_data: {
          mime_type: internal_part[:content][:mimeType],
          data: internal_part[:content][:data]
        }
      }
    end
  end

  # Helper to format gemini "parts" array from internal representation.
  private def format_parts(internal_parts)
    internal_parts&.map {|internal_part| format_part(internal_part)}
  end
end
