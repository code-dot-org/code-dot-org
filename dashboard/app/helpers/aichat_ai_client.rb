# Combined class to hold shared logic for multiple AI API backends. This is essentially an "abstract" class
# that is never instantiated directly. The derived classes hold implementation details in required overridden
# methods. Currently the two implemented APIs (OpenAI and Gemini) are POST based REST APIs.
class AichatAiClient
  # Call the API (through methods overridden in derived class) and get response text to send back to user.
  # Accept a config hash, request array and optional context array.  These types are defined and documented
  # in `aichat_ai_client_types.rb``.
  def get_response(config, request, context = [])
    # Assert the parameter types are correct, using RubyTypes.
    AichatRubyTypes.assert_value_is_type(config, AichatAiClientTypes::AiConfig)
    AichatRubyTypes.assert_value_is_type(request, AichatAiClientTypes::AiRequest)
    AichatRubyTypes.assert_value_is_type(context, AichatAiClientTypes::AiContext)

    start_time = Time.now

    body = create_body(config, request, context)

    AichatAiClientTypes.validate_json_schema(body)

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

    usage_reporter&.report_usage_and_throttling_metrics(usage, config, request, context, response_time)

    raise StandardError.new("Unexpected response from AI API: #{http_response.body}") unless response_text

    response_text
  end

  attr_accessor :api_key, :model, :usage_reporter

  def initialize(api_key, model, usage_reporter = nil)
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

  private def raise_not_implemented_error
    raise NotImplementedError, "This method must be implemented in the derived class"
  end
end
