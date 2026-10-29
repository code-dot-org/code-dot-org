require 'test_helper'

class AiGatewayAuthControllerTest < ActionController::TestCase
  setup_all do
    @authorized_teacher = create(:authorized_teacher)
    @student = create(:student)
    @level = create(:level, type: 'Aichat')
    @script = create(:script, :in_single_unit_course)
  end

  setup do
    DCDO.stubs(:get).with('brand-router-enabled', false).returns(false)
    DCDO.stubs(:get).with('block_ai_tutor_chat_completion', anything).returns(false)
    DCDO.stubs(:get).with('block_aichat_lab_chat_completion', anything).returns(false)
    DCDO.stubs(:get).with('allow_international_usage_all_models', anything).returns(false)
    DCDO.stubs(:get).with('migration_service_enabled', false).returns(false)
    DCDO.stubs(:get).with('lesson-deep-dive-enabled', true).returns(true)
    stub_turnstile_enforcement_mode(AiGatewayAuthController::TURNSTILE_ENFORCEMENT_MODE_DEFAULT)
    DCDO.stubs(:get).with('ai_gateway_enforces_blocked_providers', anything).returns(false)
    @params = {
      aichatContext: {
        clientType: SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB],
        currentLevelId: @level.id,
        scriptId: @script.id,
        channelId: 'test',
      },
    }
  end

  # Captures the payload handed to JWT.encode so tests can assert on claims
  # without configuring a signing key, which only exists outside test.
  def stub_jwt_encode
    payload = {}
    JWT.stubs(:encode).with do |claims, _key, _algorithm|
      payload.replace(claims)
      true
    end.returns('fake.jwt.token')
    OpenSSL::PKey::RSA.stubs(:new).returns(nil)
    payload
  end

  test 'refuses to mint a token for a blocked user while the gateway does not enforce the block' do
    sign_in(@authorized_teacher)
    User.any_instance.stubs(:blocked_aichat_providers).returns(SharedConstants::AI_CHAT_US_ONLY_PROVIDERS)

    post :get_access_token, params: @params, as: :json

    assert_response :forbidden
    body = JSON.parse(response.body)
    assert_equal AichatRequestsController::MODEL_REGION_BLOCKED_ERROR, body['error']
    assert_equal @authorized_teacher.user_type, body['user_type']
  end

  test 'mints a token for a blocked user once the gateway enforces the block, stamping the blocked providers' do
    sign_in(@authorized_teacher)
    User.any_instance.stubs(:blocked_aichat_providers).returns(SharedConstants::AI_CHAT_US_ONLY_PROVIDERS)
    DCDO.stubs(:get).with('ai_gateway_enforces_blocked_providers', anything).returns(true)
    payload = stub_jwt_encode

    post :get_access_token, params: @params, as: :json

    assert_response :success
    assert_equal 'fake.jwt.token', JSON.parse(response.body)['token']
    assert_equal SharedConstants::AI_CHAT_US_ONLY_PROVIDERS, payload[:blocked_providers]
  end

  test 'mints a token with no blocked_providers claim when nothing is blocked' do
    sign_in(@authorized_teacher)
    User.any_instance.stubs(:blocked_aichat_providers).returns([])
    payload = stub_jwt_encode

    post :get_access_token, params: @params, as: :json

    assert_response :success
    assert_equal 'fake.jwt.token', JSON.parse(response.body)['token']
    # Absent and empty both mean "unrestricted" to the gateway, so we omit the
    # claim rather than stamping [] on every token.
    refute payload.key?(:blocked_providers)
  end

  test 'lesson deep dive mints a token only when AI chat access is enabled' do
    deep_dive_params = {
      aichatContext: {
        clientType: SharedConstants::AI_CHAT_CLIENT_TYPES[:LESSON_DEEP_DIVE],
        currentLevelId: nil,
        scriptId: nil,
        lessonId: 1,
      },
    }
    sign_in(@student)
    User.any_instance.stubs(:blocked_aichat_providers).returns([])
    # The signing key is only configured outside the test environment.
    OpenSSL::PKey::RSA.stubs(:new).returns(OpenSSL::PKey::RSA.generate(2048))
    JWT.stubs(:encode).returns('fake.jwt.token')

    {
      SharedConstants::AI_CHAT_ACCESS_LEVELS[:ENABLED] => :success,
      SharedConstants::AI_CHAT_ACCESS_LEVELS[:ESSENTIAL_ONLY] => :forbidden,
      SharedConstants::AI_CHAT_ACCESS_LEVELS[:DISABLED] => :forbidden,
    }.each do |access_level, expected_response|
      User.any_instance.stubs(:ai_chat_access_level).returns(access_level)

      post :get_access_token, params: deep_dive_params, as: :json

      assert_response expected_response, "access level #{access_level}"
    end
  end

  test 'sends the log token rather than the raw user id' do
    user = create(:authorized_teacher)
    claim = mint_and_capture_claims(user: user)[:user_log_token]

    assert_match(/\A\h{8}-\h{4}-\h{4}-\h{4}-\h{12}\z/, claim)
    assert_equal user.log_token(destination: User::LogToken::SENTRY), claim
  end

  test 'does not send a user_id claim' do
    refute_includes mint_and_capture_claims(user: create(:authorized_teacher)).keys, :user_id
  end

  test 'does not send the raw user id as the value of any claim' do
    user = create(:authorized_teacher)

    claims = mint_and_capture_claims(user: user).except(:level_id, :script_id, :lesson_id)

    refute_includes claims.values.map(&:to_s), user.id.to_s
  end

  test 'still sends the context claims the gateway depends on' do
    @params[:aichatContext][:lessonId] = 3
    claims = mint_and_capture_claims(user: create(:authorized_teacher))

    assert_equal SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB], claims[:aichat_client_type]
    assert_equal @level.id, claims[:level_id]
    assert_equal @script.id, claims[:script_id]
    assert_equal 'test', claims[:channel_id]
    assert_equal 3, claims[:lesson_id]
    assert_equal CDO.dashboard_hostname, claims[:hostname]
    assert claims[:token_id].present?
  end

  test 'sends the same token on a second request for the same user' do
    user = create(:authorized_teacher)
    first = mint_and_capture_claims(user: user)[:user_log_token]
    @controller = AiGatewayAuthController.new
    second = mint_and_capture_claims(user: user)[:user_log_token]

    assert_equal first, second
  end

  test 'sends different tokens for different users' do
    other = create(:authorized_teacher)

    refute_equal mint_and_capture_claims(user: create(:authorized_teacher))[:user_log_token],
      other.log_token(destination: User::LogToken::SENTRY)
  end

  test 'publishes the turnstile mode as both a claim and a response field' do
    %w[disabled monitor enforce].each do |mode|
      stub_turnstile_enforcement_mode(mode)

      claims = mint_and_capture_claims

      # The browser reads the response field to decide whether to solve a
      # challenge; the worker reads the claim to decide whether to require one.
      # Both come from a single DCDO read, so they can never disagree.
      assert_equal mode, claims[:turnstile_enforcement_mode], "claim for #{mode}"
      assert_equal mode, JSON.parse(response.body)['turnstileEnforcementMode'], "response field for #{mode}"
    end
  end

  test 'falls back to disabled for a turnstile mode DCDO cannot be trusted to hold' do
    # DCDO stores arbitrary JSON. A YAML-loaded `off` arrives as false, and a
    # typo arrives as an unrecognized string. Neither may reach the worker as a
    # claim it has no branch for, and neither may turn enforcement on.
    [false, true, nil, 'enfroce', 42, {'mode' => 'enforce'}].each do |stored|
      stub_turnstile_enforcement_mode(stored)

      claims = mint_and_capture_claims

      assert_equal 'disabled', claims[:turnstile_enforcement_mode], "claim for #{stored.inspect}"
      assert_equal 'disabled', JSON.parse(response.body)['turnstileEnforcementMode'], "response field for #{stored.inspect}"
    end
  end

  private def stub_turnstile_enforcement_mode(value)
    DCDO.stubs(:get).
      with(AiGatewayAuthController::TURNSTILE_ENFORCEMENT_MODE_DCDO_KEY, AiGatewayAuthController::TURNSTILE_ENFORCEMENT_MODE_DEFAULT).
      returns(value)
  end

  # Mints a token and returns the claims handed to JWT.encode, so the signed
  # payload can be asserted without a signing key.
  private def mint_and_capture_claims(user: @authorized_teacher)
    sign_in(user)
    User.any_instance.stubs(:blocked_aichat_providers).returns([])
    # The signing key is only configured outside the test environment. Generated
    # once and reused: these tests call this helper in a loop, and JWT.encode is
    # stubbed below, so the key is never actually used to sign anything.
    @signing_key ||= OpenSSL::PKey::RSA.generate(2048)
    OpenSSL::PKey::RSA.stubs(:new).returns(@signing_key)

    captured = nil
    JWT.stubs(:encode).with do |claims, _key, _algorithm|
      captured = claims
      true
    end.returns('fake.jwt.token')

    post :get_access_token, params: @params, as: :json

    assert_response :success
    captured
  end
end
