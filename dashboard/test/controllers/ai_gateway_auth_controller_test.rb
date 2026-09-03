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
    stub_turnstile_enforcement_mode(AiGatewayAuthController::TURNSTILE_ENFORCEMENT_MODE_DEFAULT)
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
  private def mint_and_capture_claims
    sign_in(@authorized_teacher)
    User.any_instance.stubs(:us_only_aichat_models_disabled?).returns(false)
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
