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
end
