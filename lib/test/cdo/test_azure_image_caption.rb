require_relative '../test_helper'
require 'cdo/azure_image_caption'

class AzureImageCaptionTest < Minitest::Test
  FAKE_ENDPOINT = 'https://fake-resource.cognitiveservices.azure.com'
  FAKE_API_KEY = 'fake_api_key'

  AZURE_RESPONSE = {
    'captionResult' => {'text' => 'a red circle on a white background', 'confidence' => 0.7421},
    'modelVersion' => '2023-10-01',
    'metadata' => {'width' => 400, 'height' => 400},
  }.freeze

  def setup
    @captioner = AzureImageCaption.new(
      endpoint: FAKE_ENDPOINT,
      api_key: FAKE_API_KEY
    )
    @image_data = 'fake-image-bytes'
  end

  # --- what comes back ---

  def test_returns_the_caption_result
    stub_azure(AZURE_RESPONSE.to_json)
    result = @captioner.caption_image(@image_data)
    assert_equal 'a red circle on a white background', result['text']
    assert_in_delta 0.7421, result['confidence']
  end

  def test_returns_nil_when_azure_sends_no_caption
    # No captionResult means Azure had nothing to say, which is not an error.
    stub_azure({'modelVersion' => '2023-10-01'}.to_json)
    assert_nil @captioner.caption_image(@image_data)
  end

  # --- what goes wrong ---

  def test_raises_request_failed_on_http_error
    stub_azure_error(400, '{"error":{"code":"InvalidImage","message":"Image too small"}}')
    assert_raises AzureImageCaption::RequestFailed do
      @captioner.caption_image(@image_data)
    end
  end

  def test_raises_request_failed_on_unparseable_success
    stub_azure('<html>a proxy said no</html>')
    assert_raises AzureImageCaption::RequestFailed do
      @captioner.caption_image(@image_data)
    end
  end

  def test_wraps_transport_failures_so_the_caller_can_rescue_them
    # Unwrapped, these would escape ImageCaption's rescue and become a 500.
    [
      Net::OpenTimeout.new,
      Net::ReadTimeout.new,
      SocketError.new('getaddrinfo: Name or service not known'),
      Errno::ECONNREFUSED.new,
      OpenSSL::SSL::SSLError.new('certificate verify failed'),
    ].each do |transport_error|
      Net::HTTP.stubs(:start).raises(transport_error)
      error = assert_raises AzureImageCaption::RequestFailed, "leaked #{transport_error.class}" do
        @captioner.caption_image(@image_data)
      end
      assert_includes error.message, transport_error.class.name
    end
  end

  def test_error_message_survives_an_unparseable_error_body
    stub_azure_error(503, 'Service Unavailable')
    error = assert_raises AzureImageCaption::RequestFailed do
      @captioner.caption_image(@image_data)
    end
    assert_includes error.message, '503'
  end

  # --- what goes out ---

  def test_sends_raw_image_bytes_with_the_subscription_key
    request = captured_request
    # Raw bytes, not a base64 JSON envelope like Content Safety.
    assert_equal 'application/octet-stream', request['Content-Type']
    assert_equal FAKE_API_KEY, request['Ocp-Apim-Subscription-Key']
    assert_equal @image_data, request.body
  end

  def test_asks_the_image_analysis_endpoint_for_a_caption
    path = captured_request.path
    assert_includes path, '/computervision/imageanalysis:analyze'
    assert_includes path, 'api-version=2024-02-01'
    assert_includes path, 'features=caption'
  end

  def test_requests_a_gender_neutral_caption
    # A drawing has no gender to read off it, so the model is told not to guess.
    assert_includes captured_request.path, 'gender-neutral-caption=true'
  end

  def test_bounds_how_long_it_waits_on_azure
    response = success_response(AZURE_RESPONSE.to_json)
    http = mock
    http.stubs(:request).returns(response)
    # A caption is a supplement, so this request must not be able to hang.
    Net::HTTP.expects(:start).with do |_host, _port, options|
      options[:open_timeout] == AzureImageCaption::OPEN_TIMEOUT &&
        options[:read_timeout] == AzureImageCaption::READ_TIMEOUT
    end.yields(http).returns(response)

    @captioner.caption_image(@image_data)
  end

  # A 2xx carrying this body.
  private def success_response(body)
    response = mock
    response.stubs(:is_a?).with(Net::HTTPSuccess).returns(true)
    response.stubs(:body).returns(body)
    response
  end

  # Stand in for the single Net::HTTP call caption_image makes.
  private def stub_http(response)
    http = mock
    http.stubs(:request).returns(response)
    Net::HTTP.stubs(:start).yields(http).returns(response)
  end

  private def stub_azure(body)
    stub_http(success_response(body))
  end

  private def stub_azure_error(code, body)
    response = mock
    response.stubs(:is_a?).with(Net::HTTPSuccess).returns(false)
    response.stubs(:code).returns(code.to_s)
    response.stubs(:body).returns(body)
    stub_http(response)
  end

  # Run one stubbed call and hand back the request we would have sent.
  private def captured_request
    response = success_response(AZURE_RESPONSE.to_json)
    captured = nil
    http = mock
    http.stubs(:request).with {|request| captured = request; true}.returns(response)
    Net::HTTP.stubs(:start).yields(http).returns(response)

    @captioner.caption_image(@image_data)
    captured
  end
end
