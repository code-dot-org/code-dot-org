require 'test_helper'

class AiGatewayAuthControllerTest < ActionController::TestCase
  setup_all do
    @authorized_teacher = create(:authorized_teacher)
    @level = create(:level, type: 'Aichat')
    @script = create(:script, :in_single_unit_course)
  end

  setup do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(false)
    DCDO.stubs(:get).with('block_ai_tutor_chat_completion', anything).returns(false)
    DCDO.stubs(:get).with('block_aichat_lab_chat_completion', anything).returns(false)
    DCDO.stubs(:get).with('allow_international_usage_all_models', anything).returns(false)
    @params = {
      aichatContext: {
        clientType: SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB],
        currentLevelId: @level.id,
        scriptId: @script.id,
        channelId: 'test',
      },
    }
  end

  test 'refuses to mint a token when the user cannot use US only models' do
    sign_in(@authorized_teacher)
    User.any_instance.stubs(:us_only_aichat_models_disabled?).returns(true)

    post :get_access_token, params: @params, as: :json

    assert_response :forbidden
    body = JSON.parse(response.body)
    assert_equal AichatRequestsController::MODEL_REGION_BLOCKED_ERROR, body['error']
    assert_equal @authorized_teacher.user_type, body['user_type']
  end

  test 'mints a token when the user can use US only models' do
    sign_in(@authorized_teacher)
    User.any_instance.stubs(:us_only_aichat_models_disabled?).returns(false)
    # The signing key is only configured outside the test environment.
    OpenSSL::PKey::RSA.stubs(:new).returns(OpenSSL::PKey::RSA.generate(2048))
    JWT.stubs(:encode).returns('fake.jwt.token')

    post :get_access_token, params: @params, as: :json

    assert_response :success
    assert_equal 'fake.jwt.token', JSON.parse(response.body)['token']
  end

  AICHAT_CONTEXT = {
    clientType: SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB],
    currentLevelId: 42,
    scriptId: 7,
    channelId: 'a-channel-id',
    lessonId: 3,
  }.freeze

  # Mints a real token and decodes it, so it needs the signing key, which is only
  # configured outside the test environment, and both access checks passing.
  def decoded_claims_for(user)
    signing_key = OpenSSL::PKey::RSA.generate(2048)
    OpenSSL::PKey::RSA.stubs(:new).
      with(AiGatewayAuthController::PRIVATE_KEY, AiGatewayAuthController::PASSPHRASE).
      returns(signing_key)
    User.any_instance.stubs(:can_access_aichat_chat_completion?).returns(true)
    User.any_instance.stubs(:us_only_aichat_models_disabled?).returns(false)

    sign_in user
    post :get_access_token, params: {aichatContext: AICHAT_CONTEXT}, as: :json
    assert_response :success

    token = JSON.parse(@response.body)['token']
    claims, _header = JWT.decode(token, signing_key.public_key, true, algorithm: 'RS256')
    claims
  end

  test 'sends the log token rather than the raw user id' do
    user = create(:student)

    assert_equal user.log_token(destination: User::LogToken::SENTRY),
      decoded_claims_for(user)['user_log_token']
  end

  test 'does not send a user_id claim' do
    refute_includes decoded_claims_for(create(:student)).keys, 'user_id'
  end

  test 'does not send the raw user id as the value of any claim' do
    user = create(:student)

    refute_includes decoded_claims_for(user).values.map(&:to_s), user.id.to_s
  end

  test 'still sends the context claims the gateway depends on' do
    claims = decoded_claims_for(create(:student))

    assert_equal SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB], claims['aichat_client_type']
    assert_equal 42, claims['level_id']
    assert_equal 7, claims['script_id']
    assert_equal 'a-channel-id', claims['channel_id']
    assert_equal 3, claims['lesson_id']
    assert_equal CDO.dashboard_hostname, claims['hostname']
    assert claims['token_id'].present?
  end

  test 'sends the same token on a second request for the same user' do
    user = create(:student)
    first = decoded_claims_for(user)['user_log_token']
    second = decoded_claims_for(user)['user_log_token']

    assert_equal first, second
  end

  test 'sends different tokens for different users' do
    other = create(:student)

    refute_equal decoded_claims_for(create(:student))['user_log_token'],
      other.log_token(destination: User::LogToken::SENTRY)
  end
end
