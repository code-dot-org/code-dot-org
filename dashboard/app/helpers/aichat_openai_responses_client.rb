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
  private def create_body(
    stored_messages,
    new_message,
    system_instructions,
    temperature,
    level_name,
    encrypted_channel_id
    )

    # We expose a temperature scale of 0.1-1 to users, but OpenAI's API allows a scale of 0-2.
    # As of 7/11/25, testing revealed temperatures exceeding 1.5 generate garbage and trigger timeouts/false moderation calls
    temperature *= DCDO.get('openai_temperature_scaling_factor', 1.5)

    input = [
      {role: "system", content: [{type: "input_text", text: system_instructions}]},
      *stored_messages.map {|message| format_message(message, encrypted_channel_id, level_name)},
      format_message(new_message, encrypted_channel_id, level_name)
    ]

    body = {
      model: model,
      temperature: temperature,
      input: input
    }

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

  # Helper to format openid "message" object for body.
  private def format_message(message, encrypted_channel_id, level_name)
    type = message['role'] == "assistant" ? "output_text" : "input_text"
    formatted = {
      role: message['role'],
      content: [
        {
          type: type,
          text: get_message_text(message)
        }
      ]
    }
    message['assets']&.each do |asset|
      filename = asset["filename"]
      source = asset["source"]

      data_uri = AichatAssetHelper.get_asset_data_uri(filename, source, encrypted_channel_id, level_name)

      formatted[:content] << if file_is_pdf?(filename)
                               {type: 'input_file', filename: asset["filename"], file_data: data_uri}
                             elsif file_is_image?(filename)
                               {type: "input_image", image_url: data_uri}
                             end
    end
    formatted
  end
end
