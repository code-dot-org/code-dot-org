require 'test_helper'

class Api::V1::TextToSpeechControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  test 'azure: returns 400 if speech not received from Azure' do
    AzureTextToSpeech.expects(:get_speech).once.returns(nil)
    post :azure
    assert_response :bad_request
  end

  test 'azure: returns speech as arraybuffer if speech received from Azure' do
    AzureTextToSpeech.expects(:get_speech).once.returns("string-of-bytes")
    post :azure
    assert_response :success
  end
end
