require 'test_helper'

class Api::V1::TextToSpeechControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup do
    Cdo::Throttle.stubs(:throttle).returns(false)

    @user = create(:user)
    @text = "hola"
    @gender = "female"
    @locale = "es-MX"
    @default_limit = Api::V1::TextToSpeechController::REQUEST_LIMIT_PER_MIN_DEFAULT
  end

  test 'azure: returns 400 if speech not received from Azure' do
    AzureTextToSpeech.expects(:throttled_get_speech).once.yields(nil)
    post :azure
    assert_response :bad_request
  end

  test 'azure: returns speech as arraybuffer if speech received from Azure' do
    AzureTextToSpeech.expects(:throttled_get_speech).once.yields("string-of-bytes")
    post :azure
    assert_response :success
  end

  test 'azure: returns 429 if request was throttled' do
    AzureTextToSpeech.expects(:throttled_get_speech).once.returns(nil)
    post :azure
    assert_response :too_many_requests
  end

  test 'azure: checks throttle with user id' do
    AzureTextToSpeech.expects(:throttled_get_speech).once.
      with(@text, @gender, @locale, @user.id, @default_limit, 60).
      yields('string-of-bytes')

    sign_in @user
    post :azure, params: {text: @text, gender: @gender, locale: @locale}
    assert_response :success
  end

  test 'azure: checks throttle with session id if no user id' do
    AzureTextToSpeech.expects(:throttled_get_speech).once.
      with(@text, @gender, @locale, session.id, @default_limit, 60).
      yields('string-of-bytes')

    sign_out @user
    post :azure, params: {text: @text, gender: @gender, locale: @locale}
    assert_response :success
  end

  test 'azure: checks throttle with IP if no user/session id' do
    session.expects(:id).once.returns(nil)
    ip_limit = Api::V1::TextToSpeechController::REQUEST_LIMIT_PER_MIN_IP
    AzureTextToSpeech.expects(:throttled_get_speech).once.
      with(@text, @gender, @locale, @request.ip, ip_limit, 60).
      yields('string-of-bytes')

    sign_out @user
    post :azure, params: {text: @text, gender: @gender, locale: @locale}
    assert_response :success
  end
end
