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

  test 'throttled_get_speech: yields text as speech on success' do
    expected_speech = 'string-of-bytes'
    Cdo::Throttle.expects(:throttle).once.returns(false)
    AzureTextToSpeech.expects(:get_token).once.returns(@mock_token)
    AzureTextToSpeech.expects(:ssml).once.returns('<speak>hi</speak>')
    stub_request(:post, "https://#{@region}.tts.speech.microsoft.com/cognitiveservices/v1").
      with(headers: {'Authorization' => "Bearer #{@mock_token}"}).
      to_return(status: 200, body: expected_speech)
    Honeybadger.expects(:notify).never

    actual_speech = nil
    AzureTextToSpeech.throttled_get_speech('hi', 'female', 'en-US', '123', 1, 1) {|speech| actual_speech = speech}
    assert_equal expected_speech, actual_speech
  end

  test 'throttled_get_speech: does not yield if request is throttled' do
    id = 'a1b2c3'
    limit = 100
    period = 60
    Cdo::Throttle.expects(:throttle).once.with("azure_tts/" + id, limit, period).returns(true)
    AzureTextToSpeech.expects(:get_token).never
    AzureTextToSpeech.expects(:ssml).never
    Honeybadger.expects(:notify).never

    AzureTextToSpeech.throttled_get_speech('hi', 'female', 'en-US', id, limit, period) {raise 'Error: Block unexpectedly executed.'}
    assert_requested :post, "https://#{@region}.tts.speech.microsoft.com/cognitiveservices/v1", times: 0
  end

  test 'throttled_get_speech: yields nil if token is nil' do
    Cdo::Throttle.expects(:throttle).once.returns(false)
    AzureTextToSpeech.expects(:get_token).once.returns(nil)
    Honeybadger.expects(:notify).never

    actual_speech = 'should-get-set-to-nil'
    AzureTextToSpeech.throttled_get_speech('hi', 'female', 'en-US', '123', 1, 1) {|speech| actual_speech = speech}
    assert_nil actual_speech
    assert_requested :post, "https://#{@region}.tts.speech.microsoft.com/cognitiveservices/v1", times: 0
  end

  test 'throttled_get_speech: yields nil on error' do
    Cdo::Throttle.expects(:throttle).once.returns(false)
    AzureTextToSpeech.expects(:get_token).once.returns(@mock_token)
    AzureTextToSpeech.expects(:ssml).once.returns('<speak>hi</speak>')
    stub_request(:post, "https://#{@region}.tts.speech.microsoft.com/cognitiveservices/v1").
      to_raise(ArgumentError)
    Honeybadger.expects(:notify).once

    actual_speech = 'should-get-set-to-nil'
    AzureTextToSpeech.throttled_get_speech('hi', 'female', 'en-US', '123', 1, 1) {|speech| actual_speech = speech}
    assert_nil actual_speech
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
    expected_voices = {'English' => {'female' => 'Alice', 'locale' => 'en-US', 'male' => 'Bob'}}
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

  test 'get_voice_by: returns voice name if exists for given locale + gender' do
    AzureTextToSpeech.stubs(:get_voices).returns(
      {
        'Deutsch' => {'female' => 'de-DE-HeddaRUS', 'locale' => 'de-DE', 'male' => 'de-DE-Stefan'}
      }
    )

    assert_equal 'de-DE-HeddaRUS', AzureTextToSpeech.get_voice_by('de-DE', 'female')
    assert_equal 'de-DE-Stefan', AzureTextToSpeech.get_voice_by('de-DE', 'male')
    assert_nil AzureTextToSpeech.get_voice_by('en-US', 'male')
  end
end
