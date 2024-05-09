require 'test_helper'

class Lti::V1::AccountLinkingControllerTest < ActionController::TestCase
  setup do
    @user = create(:teacher, email: 'test@lti.com')
    @lti_integration = create :lti_integration
    DCDO.stubs(:get)
    DCDO.stubs(:get).with('lti_account_linking_enabled', false).returns(true)
  end

  test 'links an LTI login to an existing account' do
    partial_lti_teacher = create :teacher
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao = AuthenticationOption.new(
      authentication_id: auth_id,
      credential_type: AuthenticationOption::LTI_V1,
      email: @user.email,
    )
    partial_lti_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes session, partial_lti_teacher
    User.any_instance.stubs(:valid_password?).returns(true)

    post :link_email, params: {email: @user.email, password: 'password'}
    assert_redirected_to home_path
    assert Policies::Lti.lti?(@user)
  end

  test 'fails if the password is wrong' do
    PartialRegistration.stubs(:in_progress?).returns(true)

    post :link_email, params: {email: @user.email, password: 'password'}
    assert_response :unauthorized
  end

  test 'blocks access if lti_account_linking_enabled is false' do
    sign_in @user
    DCDO.expects(:get).with('lti_account_linking_enabled', false).times(3).returns(false)
    get :existing_account
    assert_response :not_found
    get :landing
    assert_response :not_found
    post :link_email, params: {email: @user.email, password: 'password'}
    assert_response :not_found
  end

  test 'allows access if lti_account_linking_enabled is true' do
    get :existing_account
    assert_response :ok
  end
end
