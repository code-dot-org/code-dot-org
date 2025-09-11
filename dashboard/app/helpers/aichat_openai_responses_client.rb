# This class implements an openai backend for the generic AichatAiClient.
class AichatOpenaiResponsesClient < AichatAiClient
  # The url to send with the post request
  private def url
    "https://api.openai.com/v1/responses"
  end

  # Take response_body and raise any errors if appropriate.
  private def raise_possible_response_errors_from_body(response_body)
    raise StandardError.new(response_body['error']) if response_body['error']
  end

  # Take response_body and extract the text response.
  private def extract_text_response_from_body(response_body)
    response_body&.dig("output")&.first&.dig('content')&.first&.dig('text')
  end

  # Take response_body and extract usage data for reporting.
  private def get_usage_from_body(response_body)
    {
      'prompt_tokens' => response_body.dig('usage', 'input_tokens') || 0,
      'completion_tokens' => response_body.dig('usage', 'output_tokens') || 0,
      'cached_prompt_tokens' => response_body.dig('usage', 'input_tokens_details', 'cached_tokens') || 0
    }
  end

  # Create request body.
  private def create_body(config, request, context = [])
    if config.dig(:response, :validation, :type) == 'jsonSchema'
      response_json_schema = config[:response][:validation][:schema]
      text = {
        format: {
          type: 'json_schema',
            name: 'response_schema',
            schema: response_json_schema
        }
      }
    end

    input = [
      # Add systemInstructions if not nil.
      *(config[:systemInstructions] ? [format_message(config[:systemInstructions], 'system')] : []),

      # Add context (i.e. chat history) messages (if context was nil, it's now empty array based on default value).
      *context.map {|context_item| format_message(context_item[:parts], context_item[:role])},

      # Add required request
      format_message(request)
    ]

    body = {
      model: config[:model],
      temperature: config[:temperature],
      text: text,
      input: input
    }.compact # Use compact to remove null text

    body
  end

  # Override base headers and merge in Bearer token.
  private def headers
    super.merge(
      {
        "Authorization" => "Bearer #{api_key}"
      }
    )
  end

  # Convert role from internal representation to OpenAI's role
  # (user/model => user/assistant).
  private def convert_role(role)
    if role == 'model'
      return 'assistant'
    end
    # Else 'user', which is still 'user' for OpenAI.
    role
  end

  # Helper to format openid "message" object for body.
  # Role defaults to 'user' as only context message sets role explicitly.
  private def format_message(parts, role = "user")
    message = {role: convert_role(role), content: []}

    parts&.each do |part|
      if part[:type] == 'text'

        message[:content] << {
          type: role == "model" ? "output_text" : "input_text",
          text: part[:content]
        }
      else # There are currently only two types.
        data_uri = "data:#{part[:content][:mimeType]};base64,#{part[:content][:data]}"
        message[:content] << (
          if part[:content][:mimeType] == 'application/pdf'
            {
              type: "input_file",
                filename: part[:content][:name],
                file_data: data_uri
            }
          else # There are currently only pdfs and images
            {
              type: "input_image",
              image_url: data_uri
            }
          end
        )
      end
    end
    message
  end
end
