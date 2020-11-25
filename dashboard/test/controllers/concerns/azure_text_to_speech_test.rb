require 'test_helper'
require 'webmock/minitest'

class AzureTextToSpeechTest < ActionController::TestCase
  setup do
    @region = 'westus'
    @api_key = 'abc123'
    @mock_token = 'a1b2c3d4'
    CDO.stubs(:azure_speech_service_key).returns(@api_key)
    CDO.stubs(:azure_speech_service_region).returns(@region)
  end

  teardown do
    # Some tests access and store data in the cache, so clear between tests to avoid state leakage
    Rails.cache.clear
  end

  test 'get_token: returns token on success' do
    stub_request(:post, "https://#{@region}.api.cognitive.microsoft.com/sts/v1.0/issueToken").
      with(headers: {'Ocp-Apim-Subscription-Key' => @api_key}).
      to_return(status: 200, body: @mock_token)
    Honeybadger.expects(:notify).never

    assert_equal @mock_token, AzureTextToSpeech.get_token
  end

  test 'get_token: caches token' do
    Timecop.freeze
    token_url = "https://#{@region}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
    stub_request(:post, token_url).
      with(headers: {'Ocp-Apim-Subscription-Key' => @api_key}).
      to_return(status: 200, body: @mock_token)

    AzureTextToSpeech.get_token
    assert_requested :post, token_url, times: 1
    AzureTextToSpeech.get_token # Token should be cached
    assert_requested :post, token_url, times: 1
    Timecop.travel 10.minutes
    AzureTextToSpeech.get_token # Token should no longer be cached
    assert_requested :post, token_url, times: 2
  end

  test 'get_token: returns nil on error' do
    stub_request(:post, "https://#{@region}.api.cognitive.microsoft.com/sts/v1.0/issueToken").
      with(headers: {'Ocp-Apim-Subscription-Key' => @api_key}).
      to_raise(ArgumentError)
    Honeybadger.expects(:notify).once

    assert_nil AzureTextToSpeech.get_token
  end

  test 'get_voices: caches and returns voices array on success' do
    AzureTextToSpeech.stubs(:get_token).returns(@mock_token)
    Honeybadger.expects(:notify).never
    voices_url = "https://#{@region}.tts.speech.microsoft.com/cognitiveservices/voices/list"
    mock_voice_response = [
      {'Locale' => 'en-US', 'Gender' => 'Female', 'ShortName' => 'Alice'},
      {'Locale' => 'en-US', 'Gender' => 'Male', 'ShortName' => 'Bob'},
      {'Locale' => 'it-IT', 'Gender' => 'Male', 'ShortName' => 'Dan'}, # Will be filtered out
    ]
    expected_voices = {'English' => {'female' => 'Alice', 'languageCode' => 'en-US', 'male' => 'Bob'}}
    stub_request(:get, voices_url).
      with(headers: {'Authorization' => "Bearer #{@mock_token}"}).
      to_return(status: 200, body: mock_voice_response.to_json)

    assert_equal expected_voices, AzureTextToSpeech.get_voices
    assert_requested :get, voices_url, times: 1
    assert_equal expected_voices, AzureTextToSpeech.get_voices # Voices should be cached
    assert_requested :get, voices_url, times: 1
  end

  test 'get_voices: returns nil if voices response is empty' do
    AzureTextToSpeech.stubs(:get_token).returns(@mock_token)
    Honeybadger.expects(:notify).never
    voices_url = "https://#{@region}.tts.speech.microsoft.com/cognitiveservices/voices/list"
    stub_request(:get, voices_url).
      with(headers: {'Authorization' => "Bearer #{@mock_token}"}).
      to_return(status: 200, body: '')

    assert_nil AzureTextToSpeech.get_voices
  end

  test 'get_azure_speech_service_voices returns nil on error' do
    AzureTextToSpeech.stubs(:get_token).returns(@mock_token)
    Honeybadger.expects(:notify).once
    stub_request(:get, "https://#{@region}.tts.speech.microsoft.com/cognitiveservices/voices/list").
      with(headers: {'Authorization' => "Bearer #{@mock_token}"}).
      to_raise(ArgumentError)

    assert_nil AzureTextToSpeech.get_voices
  end
end
