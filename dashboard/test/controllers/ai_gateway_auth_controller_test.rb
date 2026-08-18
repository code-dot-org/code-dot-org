require 'test_helper'

class AiGatewayAuthControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  AICHAT_CONTEXT = {
    clientType: 'aichat',
    currentLevelId: 42,
    scriptId: 7,
    channelId: 'a-channel-id',
    lessonId: 3,
  }.freeze

  setup do
    @user = create(:student)

    @signing_key = OpenSSL::PKey::RSA.generate(2048)
    OpenSSL::PKey::RSA.stubs(:new).
      with(AiGatewayAuthController::PRIVATE_KEY, AiGatewayAuthController::PASSPHRASE).
      returns(@signing_key)

    User.any_instance.stubs(:can_access_aichat_chat_completion?).returns(true)
  end

  def decoded_claims
    sign_in @user
    post :get_access_token, params: {aichatContext: AICHAT_CONTEXT}, as: :json
    assert_response :success

    token = JSON.parse(@response.body)['token']
    claims, _header = JWT.decode(token, @signing_key.public_key, true, algorithm: 'RS256')
    claims
  end

  test 'mints the log token the dashboard sends to Sentry, not the raw user id' do
    expected = @user.log_token(destination: User::LogToken::SENTRY)

    assert_equal expected, decoded_claims['user_log_token']
  end

  test 'does not send a user_id claim' do
    refute_includes decoded_claims.keys, 'user_id'
  end

  test 'does not send the raw user id as the value of any claim' do
    refute_includes decoded_claims.values.map(&:to_s), @user.id.to_s
  end

  test 'still sends the context claims the gateway depends on' do
    claims = decoded_claims

    assert_equal 'aichat', claims['aichat_client_type']
    assert_equal 42, claims['level_id']
    assert_equal 7, claims['script_id']
    assert_equal 'a-channel-id', claims['channel_id']
    assert_equal 3, claims['lesson_id']
    assert_equal CDO.dashboard_hostname, claims['hostname']
    assert claims['token_id'].present?
  end

  test 'derives a token that is stable across requests for the same user' do
    assert_equal decoded_claims['user_log_token'], decoded_claims['user_log_token']
  end

  test 'derives different tokens for different users' do
    other = create(:student)

    refute_equal decoded_claims['user_log_token'],
      other.log_token(destination: User::LogToken::SENTRY)
  end

  test 'forbids a user who cannot access aichat' do
    User.any_instance.stubs(:can_access_aichat_chat_completion?).returns(false)
    sign_in @user

    post :get_access_token, params: {aichatContext: AICHAT_CONTEXT}
    assert_response :forbidden
  end
end
