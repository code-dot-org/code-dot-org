require 'test_helper'

class AiGatewayAuthControllerTest < ActionController::TestCase
  setup do
    @rsa_key_test = OpenSSL::PKey::RSA.new(2048)
    OpenSSL::PKey::RSA.stubs(:new).returns(@rsa_key_test)
  end

  def decoded_token_payload
    response = JSON.parse(@response.body)
    JWT.decode(response['token'], @rsa_key_test.public_key, true, {algorithm: 'RS256'})[0]
  end

  test 'levelbuilder requesting the safety-check bypass gets it granted in the token' do
    levelbuilder = create(:levelbuilder)
    sign_in(levelbuilder)
    post :get_access_token, params: {aichatContext: {clientType: 'ai-chat-lab', disableSafetyChecks: true}}

    assert_response :success
    assert_equal true, decoded_token_payload['safety_checks_disabled']
  end

  test 'non-levelbuilder requesting the safety-check bypass is forbidden and gets no token' do
    teacher = create(:authorized_teacher)
    sign_in(teacher)
    post :get_access_token, params: {aichatContext: {clientType: 'ai-chat-lab', disableSafetyChecks: true}}

    assert_response :forbidden
    response_json = JSON.parse(@response.body)
    assert_equal 'safety_checks_bypass_not_permitted', response_json['error']
    assert_nil response_json['token']
  end

  test 'levelbuilder not requesting the bypass does not get it by default' do
    levelbuilder = create(:levelbuilder)
    sign_in(levelbuilder)
    post :get_access_token, params: {aichatContext: {clientType: 'ai-chat-lab'}}

    assert_response :success
    assert_equal false, decoded_token_payload['safety_checks_disabled']
  end
end
