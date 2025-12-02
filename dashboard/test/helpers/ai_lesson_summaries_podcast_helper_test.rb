require 'test_helper'
require 'webmock/minitest'

class AiLessonSummariesPodcastHelperTest < ActionView::TestCase
  setup do
    @api_key = 'test-elevenlabs-api-key'
    @model = 'eleven_v3'
    @voice_id = 'Fc5CaIGWKvLHapoOSM2K'
    @test_script = "[energetic] You're listening to AI Teaching Assistant's Daily Byte, your quick check-in before class."
    @test_audio_data = "fake_mp3_binary_data_content"

    # Mock CDO constant
    CDO.stubs(:elevenlabs_api_key).returns(@api_key)

    @expected_url = "https://api.elevenlabs.io/v1/text-to-speech/#{@voice_id}?output_format=mp3_44100_128"
    @expected_headers = {
      "Content-Type" => "application/json",
      "xi-api-key" => @api_key
    }
    @expected_body = {
      model_id: @model,
      text: @test_script
    }.to_json
  end

  # *****
  # Module constants tests
  # *****

  test "module constants are correctly defined" do
    assert_equal 'eleven_v3', AiLessonSummariesPodcastHelper::MODEL
    assert_equal @api_key, AiLessonSummariesPodcastHelper::API_KEY
  end

  # *****
  # get_podcast_from_script tests - Success cases
  # *****

  test "get_podcast_from_script returns audio data when API call succeeds" do
    # Mock successful HTTP response
    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@test_audio_data)

    # Mock the Client class
    mock_client = mock('client')
    mock_client.expects(:request_podcast).with(@test_script).returns(mock_response)
    AiLessonSummariesPodcastHelper::Client.expects(:new).with(@api_key, @model).returns(mock_client)

    result = AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)

    assert_equal @test_audio_data, result
  end

  test "get_podcast_from_script creates client with correct parameters" do
    # Mock successful HTTP response
    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@test_audio_data)

    # Mock the Client class with specific parameter expectations
    mock_client = mock('client')
    mock_client.expects(:request_podcast).with(@test_script).returns(mock_response)
    AiLessonSummariesPodcastHelper::Client.expects(:new).with(@api_key, @model).returns(mock_client)

    AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)
  end

  # *****
  # get_podcast_from_script tests - Error cases
  # *****

  test "get_podcast_from_script raises error when API returns non-200 status" do
    error_response_body = '{"error": "Invalid API key"}'
    mock_response = mock('response')
    mock_response.stubs(:code).returns(401)
    mock_response.stubs(:body).returns(error_response_body)

    # Mock the Client class
    mock_client = mock('client')
    mock_client.expects(:request_podcast).with(@test_script).returns(mock_response)
    AiLessonSummariesPodcastHelper::Client.expects(:new).with(@api_key, @model).returns(mock_client)

    error = assert_raises(StandardError) do
      AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)
    end

    assert_includes error.message, "Error processing AI lesson summary podcast: status code 401"
    assert_includes error.message, error_response_body
  end

  test "get_podcast_from_script handles Net::ReadTimeout error" do
    # Mock the Client class to raise ReadTimeout
    mock_client = mock('client')
    mock_client.expects(:request_podcast).with(@test_script).raises(Net::ReadTimeout)
    AiLessonSummariesPodcastHelper::Client.expects(:new).with(@api_key, @model).returns(mock_client)

    error = assert_raises(StandardError) do
      AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)
    end

    assert_equal "Timeout waiting for AI client to return lesson summary podcast", error.message
  end

  test "get_podcast_from_script handles generic StandardError" do
    original_error_message = "Connection refused"

    # Mock the Client class to raise StandardError
    mock_client = mock('client')
    mock_client.expects(:request_podcast).with(@test_script).raises(StandardError.new(original_error_message))
    AiLessonSummariesPodcastHelper::Client.expects(:new).with(@api_key, @model).returns(mock_client)

    error = assert_raises(StandardError) do
      AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)
    end

    assert_equal "Error processing AI lesson summary podcast: #{original_error_message}", error.message
  end

  # *****
  # Client class tests - Initialization
  # *****

  test "Client initializes with correct attributes" do
    client = AiLessonSummariesPodcastHelper::Client.new(@api_key, @model)

    assert_equal @api_key, client.api_key
    assert_equal @model, client.model
  end

  test "Client has correct constants" do
    assert_equal "Fc5CaIGWKvLHapoOSM2K", AiLessonSummariesPodcastHelper::Client::VOICE_ID
    assert_equal "https://api.elevenlabs.io/v1/text-to-speech/Fc5CaIGWKvLHapoOSM2K?output_format=mp3_44100_128",
                 AiLessonSummariesPodcastHelper::Client::ELEVENLABS_URL
  end

  # *****
  # Client class tests - request_podcast method
  # *****

  test "Client request_podcast makes HTTParty POST with correct parameters" do
    client = AiLessonSummariesPodcastHelper::Client.new(@api_key, @model)

    # Mock HTTParty response
    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@test_audio_data)

    # Expect HTTParty.post to be called with correct parameters
    HTTParty.expects(:post).with(
      @expected_url,
      headers: @expected_headers,
      body: @expected_body
    ).returns(mock_response)

    result = client.request_podcast(@test_script)

    assert_equal mock_response, result
  end

  test "Client request_podcast formats headers correctly" do
    client = AiLessonSummariesPodcastHelper::Client.new(@api_key, @model)

    mock_response = mock('response')
    HTTParty.stubs(:post).returns(mock_response)

    # Capture the actual headers sent
    HTTParty.expects(:post).with do |url, options|
      puts url
      headers = options[:headers]
      headers["Content-Type"] == "application/json" &&
        headers["xi-api-key"] == @api_key
    end.returns(mock_response)

    client.request_podcast(@test_script)
  end

  test "Client request_podcast formats body correctly" do
    client = AiLessonSummariesPodcastHelper::Client.new(@api_key, @model)

    mock_response = mock('response')
    HTTParty.stubs(:post).returns(mock_response)

    # Capture the actual body sent
    HTTParty.expects(:post).with do |url, options|
      puts url
      body_data = JSON.parse(options[:body])
      body_data["model_id"] == @model &&
        body_data["text"] == @test_script
    end.returns(mock_response)

    client.request_podcast(@test_script)
  end

  test "Client request_podcast uses correct URL" do
    client = AiLessonSummariesPodcastHelper::Client.new(@api_key, @model)

    mock_response = mock('response')

    # Expect HTTParty.post to be called with the exact URL
    HTTParty.expects(:post).with(@expected_url, anything).returns(mock_response)

    client.request_podcast(@test_script)
  end

  # *****
  # Integration tests
  # *****

  test "full integration with mocked HTTParty" do
    # Mock HTTParty directly
    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@test_audio_data)

    HTTParty.expects(:post).with(
      @expected_url,
      headers: @expected_headers,
      body: @expected_body
    ).returns(mock_response)

    result = AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)

    assert_equal @test_audio_data, result
  end

  test "full integration with HTTParty error" do
    # Mock HTTParty to raise an exception
    HTTParty.stubs(:post).raises(StandardError.new("Network error"))

    error = assert_raises(StandardError) do
      AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)
    end

    assert_equal "Error processing AI lesson summary podcast: Network error", error.message
  end

  # *****
  # Edge cases
  # *****

  test "get_podcast_from_script handles empty script" do
    empty_script = ""

    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@test_audio_data)

    mock_client = mock('client')
    mock_client.expects(:request_podcast).with(empty_script).returns(mock_response)
    AiLessonSummariesPodcastHelper::Client.expects(:new).with(@api_key, @model).returns(mock_client)

    result = AiLessonSummariesPodcastHelper.get_podcast_from_script(empty_script)

    assert_equal @test_audio_data, result
  end

  test "get_podcast_from_script handles nil script" do
    nil_script = nil

    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@test_audio_data)

    mock_client = mock('client')
    mock_client.expects(:request_podcast).with(nil_script).returns(mock_response)
    AiLessonSummariesPodcastHelper::Client.expects(:new).with(@api_key, @model).returns(mock_client)

    result = AiLessonSummariesPodcastHelper.get_podcast_from_script(nil_script)

    assert_equal @test_audio_data, result
  end

  test "get_podcast_from_script handles long script" do
    long_script = "This is a very long script. " * 1000

    mock_response = mock('response')
    mock_response.stubs(:code).returns(200)
    mock_response.stubs(:body).returns(@test_audio_data)

    mock_client = mock('client')
    mock_client.expects(:request_podcast).with(long_script).returns(mock_response)
    AiLessonSummariesPodcastHelper::Client.expects(:new).with(@api_key, @model).returns(mock_client)

    result = AiLessonSummariesPodcastHelper.get_podcast_from_script(long_script)

    assert_equal @test_audio_data, result
  end

  test "Client request_podcast handles special characters in script" do
    special_script = "Hello! This has émojis 🎵 and spéciàl chärs & symbols @#$%"
    client = AiLessonSummariesPodcastHelper::Client.new(@api_key, @model)

    mock_response = mock('response')
    HTTParty.stubs(:post).returns(mock_response)

    expected_body = {
      model_id: @model,
      text: special_script
    }.to_json

    HTTParty.expects(:post).with(
      @expected_url,
      headers: @expected_headers,
      body: expected_body
    ).returns(mock_response)

    client.request_podcast(special_script)
  end

  # *****
  # Error message formatting tests
  # *****

  test "error message includes status code and response body" do
    error_body = '{"detail": "Voice not found", "status": "error"}'
    mock_response = mock('response')
    mock_response.stubs(:code).returns(404)
    mock_response.stubs(:body).returns(error_body)

    mock_client = mock('client')
    mock_client.expects(:request_podcast).returns(mock_response)
    AiLessonSummariesPodcastHelper::Client.expects(:new).returns(mock_client)

    error = assert_raises(StandardError) do
      AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)
    end

    assert_includes error.message, "status code 404"
    assert_includes error.message, error_body
  end

  test "timeout error has specific message" do
    mock_client = mock('client')
    mock_client.expects(:request_podcast).raises(Net::ReadTimeout.new)
    AiLessonSummariesPodcastHelper::Client.expects(:new).returns(mock_client)

    error = assert_raises(StandardError) do
      AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)
    end

    assert_equal "Timeout waiting for AI client to return lesson summary podcast", error.message
  end

  # *****
  # Different API response codes
  # *****

  test "handles 400 Bad Request" do
    mock_response = mock('response')
    mock_response.stubs(:code).returns(400)
    mock_response.stubs(:body).returns('{"error": "Invalid request"}')

    mock_client = mock('client')
    mock_client.expects(:request_podcast).returns(mock_response)
    AiLessonSummariesPodcastHelper::Client.expects(:new).returns(mock_client)

    error = assert_raises(StandardError) do
      AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)
    end

    assert_includes error.message, "status code 400"
  end

  test "handles 500 Internal Server Error" do
    mock_response = mock('response')
    mock_response.stubs(:code).returns(500)
    mock_response.stubs(:body).returns('{"error": "Internal server error"}')

    mock_client = mock('client')
    mock_client.expects(:request_podcast).returns(mock_response)
    AiLessonSummariesPodcastHelper::Client.expects(:new).returns(mock_client)

    error = assert_raises(StandardError) do
      AiLessonSummariesPodcastHelper.get_podcast_from_script(@test_script)
    end

    assert_includes error.message, "status code 500"
  end
end
