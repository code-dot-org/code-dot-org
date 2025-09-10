# This class implements a gemini backend for the generic AichatAiClient.
class AichatGeminiClient < AichatAiClient
  # The url to send with the post request.
  private def url
    "https://generativelanguage.googleapis.com/v1beta/models/#{model}:generateContent?key=#{api_key}"
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
    {
      'prompt_tokens' =>  prompt_tokens || 0,

      # This calculation - (total tokens - prompt tokens) seems to be what the OpenAI compat API
      # returns for completion tokens, but metrics could be made more flexible based on what's
      # available in a given API.
      'completion_tokens' => total_tokens &&  prompt_tokens ? total_tokens -  prompt_tokens : 0,

      # Gemini doesn't seem to support so setting to -1 to indicate the value is not meaningful.
      'cached_prompt_tokens' =>  -1

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
        responseJsonSchema: response_json_schema
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
