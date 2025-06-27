# This class implements a gemini backend for the generic AichatAiClient.
class AichatGeminiClient < AichatAiClient
  # Disable metrics temporarily for gemini.
  private def report_usage_and_throttling_metrics(usage, message_and_file_counts, level_id, project_id, user_id, model_id, response_time)
  end

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

  # Convert role to gemini's role.
  private def convert_role(role)
    if role == 'assistant'
      return 'model'
    end

    # Else 'user', which is still 'user' for gemini.
    role
  end

  # Helper to format gemini "content" object for body.
  private def format_content_item(message, encrypted_channel_id, level_name)
    content_item = {
      role: convert_role(message['role']),

      parts: [
        {
          text: get_message_text(message)
        }
      ]
    }

    # Currently filename is not passed to the gemini API which is necessary to
    # reference a given file when multiple are uploaded. This is not possible
    # natively in gemini but can be handled by concatenating a message that
    # lists the attached files (in the language based on the user's locale).

    message['assets']&.each do |asset|
      filename = asset["filename"]
      source = asset["source"]

      base64_string = AichatAssetHelper.get_asset_base64_string(filename, source, encrypted_channel_id, level_name)

      mime_type = Rack::Mime.mime_type(File.extname(filename))
      content_item[:parts] << {inline_data: {mime_type: mime_type, data: base64_string}}
    end

    content_item
  end
end
