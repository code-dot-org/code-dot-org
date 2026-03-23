require_relative '../test_helper'
require 'cdo/azure_ai_content_safety'
require 'minitest/autorun'
require 'base64'

class AzureAiContentSafetyTest < Minitest::Test
  FAKE_ENDPOINT = 'https://fake-resource.cognitiveservices.azure.com'
  FAKE_API_KEY = 'fake_api_key'

  AZURE_RESPONSE = {
    'categoriesAnalysis' => [
      {'category' => 'Hate',     'severity' => 0},
      {'category' => 'SelfHarm', 'severity' => 0},
      {'category' => 'Sexual',   'severity' => 2},
      {'category' => 'Violence', 'severity' => 0},
    ]
  }.freeze

  def setup
    @ai_content_safety = AzureAiContentSafety.new(
      endpoint: FAKE_ENDPOINT,
      api_key: FAKE_API_KEY
    )
    @image_data = StringIO.new('fake-image-bytes')
  end

  # --- moderate_image returns raw Azure JSON ---

  def test_returns_raw_azure_json
    stub_azure_response(AZURE_RESPONSE)
    result = @ai_content_safety.moderate_image(@image_data, 'image/png')
    assert_equal AZURE_RESPONSE, result
  end

  def test_returns_categories_analysis_array
    stub_azure_response(AZURE_RESPONSE)
    result = @ai_content_safety.moderate_image(@image_data, 'image/jpeg')
    assert_instance_of Array, result['categoriesAnalysis']
    assert_equal 4, result['categoriesAnalysis'].length
  end

  # --- content type validation ---

  def test_raises_on_unsupported_content_type
    Net::HTTP.expects(:start).never
    assert_raises AzureAiContentSafety::UnsupportedContentType do
      @ai_content_safety.moderate_image(@image_data, 'text/plain')
    end
  end

  def test_accepts_jpeg
    stub_azure_response(AZURE_RESPONSE)
    refute_nil @ai_content_safety.moderate_image(@image_data, 'image/jpeg')
  end

  def test_accepts_png
    stub_azure_response(AZURE_RESPONSE)
    refute_nil @ai_content_safety.moderate_image(@image_data, 'image/png')
  end

  def test_accepts_gif
    stub_azure_response(AZURE_RESPONSE)
    refute_nil @ai_content_safety.moderate_image(@image_data, 'image/gif')
  end

  # --- error handling ---

  def test_raises_request_failed_on_http_error
    stub_azure_error_response(400, '{"error":{"code":"InvalidImage","message":"Image too small"}}')
    assert_raises AzureAiContentSafety::RequestFailed do
      @ai_content_safety.moderate_image(@image_data, 'image/png')
    end
  end

  # --- request format ---

  def test_sends_base64_encoded_image_in_json_body
    image_bytes = 'test-image-bytes'
    @image_data = StringIO.new(image_bytes)
    expected_body = {image: {content: Base64.strict_encode64(image_bytes)}}.to_json
    fake_response = stub_http_success(AZURE_RESPONSE)

    mock_http = mock
    mock_http.expects(:request).with do |req|
      req['Content-Type'] == 'application/json' &&
        req['Ocp-Apim-Subscription-Key'] == FAKE_API_KEY &&
        req.body == expected_body
    end.returns(fake_response)
    Net::HTTP.stubs(:start).yields(mock_http).returns(fake_response)

    @ai_content_safety.moderate_image(@image_data, 'image/png')
  end

  def test_uses_correct_api_path
    fake_response = stub_http_success(AZURE_RESPONSE)

    mock_http = mock
    mock_http.expects(:request).with do |req|
      req.path.include?('/contentsafety/image:analyze') &&
        req.path.include?('api-version=2024-09-01')
    end.returns(fake_response)
    Net::HTTP.stubs(:start).yields(mock_http).returns(fake_response)

    @ai_content_safety.moderate_image(@image_data, 'image/png')
  end

  private def stub_http_success(body_hash)
    mock_response = mock
    mock_response.stubs(:is_a?).with(Net::HTTPSuccess).returns(true)
    mock_response.stubs(:body).returns(body_hash.to_json)
    mock_response
  end

  private def stub_azure_response(body_hash)
    fake_response = stub_http_success(body_hash)
    mock_http = mock
    mock_http.stubs(:request).returns(fake_response)
    Net::HTTP.stubs(:start).yields(mock_http).returns(fake_response)
  end

  private def stub_azure_error_response(code, body)
    mock_response = mock
    mock_response.stubs(:is_a?).with(Net::HTTPSuccess).returns(false)
    mock_response.stubs(:code).returns(code.to_s)
    mock_response.stubs(:body).returns(body)
    mock_http = mock
    mock_http.stubs(:request).returns(mock_response)
    Net::HTTP.stubs(:start).yields(mock_http).returns(mock_response)
  end
end
