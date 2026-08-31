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
    DCDO.stubs(:get).with('ai_gateway_enforces_blocked_models', anything).returns(false)
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
    User.any_instance.stubs(:blocked_aichat_model_ids).returns(SharedConstants::AI_CHAT_US_ONLY_MODEL_IDS)

    post :get_access_token, params: @params, as: :json

    assert_response :forbidden
    body = JSON.parse(response.body)
    assert_equal AichatRequestsController::MODEL_REGION_BLOCKED_ERROR, body['error']
    assert_equal @authorized_teacher.user_type, body['user_type']
  end

  test 'mints a token for a blocked user once the gateway enforces the block, stamping the blocked models' do
    sign_in(@authorized_teacher)
    User.any_instance.stubs(:blocked_aichat_model_ids).returns(SharedConstants::AI_CHAT_US_ONLY_MODEL_IDS)
    DCDO.stubs(:get).with('ai_gateway_enforces_blocked_models', anything).returns(true)
    payload = stub_jwt_encode

    post :get_access_token, params: @params, as: :json

    assert_response :success
    assert_equal 'fake.jwt.token', JSON.parse(response.body)['token']
    assert_equal SharedConstants::AI_CHAT_US_ONLY_MODEL_IDS, payload[:blocked_model_ids]
  end

  test 'mints a token with no blocked_model_ids claim when nothing is blocked' do
    sign_in(@authorized_teacher)
    User.any_instance.stubs(:blocked_aichat_model_ids).returns([])
    payload = stub_jwt_encode

    post :get_access_token, params: @params, as: :json

    assert_response :success
    assert_equal 'fake.jwt.token', JSON.parse(response.body)['token']
    # Absent and empty both mean "unrestricted" to the gateway, so we omit the
    # claim rather than stamping [] on every token.
    refute payload.key?(:blocked_model_ids)
  end
end
