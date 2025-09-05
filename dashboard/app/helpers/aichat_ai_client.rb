# Combined class to hold shared logic for multiple AI API backends. This is essentially an "abstract" class
# that is never instantiated directly. The derived classes hold implementation details in required overridden
# methods. Currently the two implemented APIs (OpenAI and Gemini) are POST based REST APIs.
class AichatAiClient
  # Create an instance of the appropriate derived class based on model id.
  def self.create_instance(model_id, usage_reporter = nil)
    #TODO make model api mode and this check based on SharedConstants::AICHAT_MODEL_VERSION
    # For now we just assume it's one of the gemini models if not 'gpt-4o-mini'.
    if model_id == "gpt-4o-mini"
      return AichatOpenaiResponsesClient.new(CDO.openai_student_learning_api_key, SharedConstants::AICHAT_MODEL_VERSION, usage_reporter)
    else
      return AichatGeminiClient.new(CDO.google_gemini_student_learning_api_key, model_id, usage_reporter)
    end
  end

  # Call the API (through methods overridden in derived class) and get response text to send back to user.
  # Accept a config hash, request array and optional context array.  These types are defined and documented
  # in `aichat_ai_client_types.rb``.
  def get_response_text(config, request, context = [])
    # Assert the parameter types are correct, using RubyTypes.
    AichatRubyTypes.assert_value_is_type(config, AichatAiClientTypes::AiConfig)
    AichatRubyTypes.assert_value_is_type(request, AichatAiClientTypes::AiRequest)
    AichatRubyTypes.assert_value_is_type(context, AichatAiClientTypes::AiContext)

    start_time = Time.now

    body = create_body(config, request, context)

    read_timeout = DCDO.get('openai_http_read_timeout', SharedConstants::AI_CHAT_READ_TIMEOUTS[config[:clientType]] || 30)

    http_response = HTTParty.post(
      url,
      headers: headers,
      body: body.to_json,
      open_timeout: DCDO.get('openai_http_open_timeout', 5),
      read_timeout: read_timeout
    )

    response_body = JSON.parse(http_response.body)

    raise_possible_response_errors_from_body(response_body)

    response_text = extract_text_response_from_body(response_body)

    usage = get_usage_from_body(response_body)

    response_time = Time.now - start_time

    # Disable metrics temporarily for gemini until reporter is customized for gemini.
    if is_a?(AichatOpenaiResponsesClient)
      usage_reporter&.report_usage_and_throttling_metrics(usage, config, request, context, response_time)
    end

    raise StandardError.new("Unexpected response from AI API: #{http_response.body}") unless response_text

    response_text
  end

  # TODO - implement structured output
  # def get_structured_response_json(stored_messages, new_message, temperature, system_prompt, retrieval_contexts,  model_id, level_id, encrypted_channel_id, user_id, project_id)
  # end

  attr_accessor :api_key, :model, :usage_reporter

  # Private initializer - all instances should be created with `create_instance` factory.
  private def initialize(api_key, model, usage_reporter = nil)
    @api_key = api_key
    @model = model
    @usage_reporter = usage_reporter
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

  # Create request body from config, request and context
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

  private def raise_not_implemented_error
    raise NotImplementedError, "This method must be implemented in the derived class"
  end
end
