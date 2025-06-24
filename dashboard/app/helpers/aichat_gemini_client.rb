# This class implements a gemini backend for the generic AichatAiClient
class AichatGeminiClient < AichatAiClient
  # The url to send with the post request
  private def url
    # TODO secret will be per product (ai chat vs tutor) - currently we have just one for both
    "https://generativelanguage.googleapis.com/v1beta/models/#{model}:generateContent?key=#{api_key}"
  end

  # take response_body and raise any errors if appropriate
  private def raise_possible_response_errors_from_body(response_body)
    # TODO - check that works with all possible gemini errors
    # gemini (openid compat layer) was returning an **array** with object element not an object
    raise StandardError.new(response_body['error']) if response_body['error']
  end

  # take response_body and extract the text response
  private def extract_text_response_from_body(response_body)
    response_body&.dig("candidates")&.first&.dig('content', 'parts')&.first&.dig('text')
  end

  # take response_body and extract usage data for reporting
  private def get_usage_from_body(response_body)
    # Note for PR (TODO - discuss and remove this note before PR merged):
    # --------------------------------------------------------------------
    # We should probbaly expand the usage metrics to include thinking metrics
    # but will need to deal with cases where given backend do not support them
    # --------------------------------------------------------------------

    total_tokens = response_body.dig('usageMetadata', 'totalTokenCount')
    prompt_tokens = response_body.dig('usageMetadata', 'promptTokenCount')
    {
      'prompt_tokens' =>  prompt_tokens || 0,

      # NOTE: (total tokens - prompt tokens) seems to be what the OpenAI compat API returns,
      # but again we should revisit
      'completion_tokens' => total_tokens &&  prompt_tokens ? total_tokens -  prompt_tokens : 0,

      # note - haven't looked into the meaning of cached tokens but gemini doesn't seem to
      # have this - setting to -1 to indicate the value is not meaningful
      'cached_prompt_tokens' =>  -1

    }
  end

  # create request body
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

  # convert role to gemini's role
  # TODO - verify role is only ever 'user' or 'assistant'
  private def convert_role(role)
    if role == 'assistant'
      return 'model'
    end

    # else 'user', which is still 'user' for gemini
    role
  end

  # helper to format gemini "content" object for body
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

      # Note for PR (TODO - discuss and remove this note before PR merged):
      # --------------------------------------------------------------------
      # We should discuss how we want to handle any errors encountered when accessing underlying storage
      # Currently there are multiple code paths that can raise (and multiple exceptions that can be raised
      # through them).  Ideally we should just raise one type of exception from AichatAssetHelper
      # and get a descriptive message back to the user.
      # --------------------------------------------------------------------
      base64_string = AichatAssetHelper.get_asset_base64_string(filename, source, encrypted_channel_id, level_name)

      mime_type = Rack::Mime.mime_type(File.extname(filename))
      content_item[:parts] << {inline_data: {mime_type: mime_type, data: base64_string}}
    end

    content_item
  end
end
