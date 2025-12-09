require 'test_helper'

class Lti::V1::AccountLinkingControllerTest < ActionController::TestCase
  setup do
    @user = create(:teacher, email: 'test@lti.com')
    @admin = create(:admin)
    @lti_integration = create(:lti_integration)
    DCDO.stubs(:get)
  end

  test 'links an LTI login to an existing account' do
    partial_lti_teacher = create(:teacher)
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao = AuthenticationOption.new(
      authentication_id: auth_id,
      credential_type: AuthenticationOption::LTI_V1,
      email: @user.email,
    )
    target_url = "some/test/path"
    session[:user_return_to] = target_url
    partial_lti_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes session, partial_lti_teacher
    User.any_instance.stubs(:valid_password?).returns(true)

    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_account_linked'
      )
    )
    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_user_signin'
      )
    )
    post :link_email, params: {email: @user.email, password: 'password'}
    assert_equal I18n.t('lti.account_linking.successfully_linked'), flash[:notice]
    assert_redirected_to target_url
    @user.reload
    assert Policies::Lti.lti?(@user)
  end

  test 'links a roster-synced LTI account to an existing account' do
    roster_synced_teacher = create(:teacher)
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao = AuthenticationOption.new(
      authentication_id: auth_id,
      credential_type: AuthenticationOption::LTI_V1,
      email: @user.email,
      )
    target_url = "some/test/path"
    session[:user_return_to] = target_url
    roster_synced_teacher.authentication_options = [ao]
    Services::Lti.create_lti_user_identity(roster_synced_teacher)
    PartialRegistration.persist_attributes session, roster_synced_teacher
    User.any_instance.stubs(:valid_password?).returns(true)

    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_account_linked'
      )
    )
    Metrics::Events.expects(:log_event).with(
      has_entries(
        user: @user,
        event_name: 'lti_user_signin'
      )
    )
    post :link_email, params: {email: @user.email, password: 'password'}
    assert_equal I18n.t('lti.account_linking.successfully_linked'), flash[:notice]
    assert_redirected_to target_url
    @user.reload
    assert Policies::Lti.lti?(@user)
  end

  test 'disallow account linking for admin users' do
    partial_lti_teacher = create(:teacher)
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'bar'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao = AuthenticationOption.new(
      authentication_id: auth_id,
      credential_type: AuthenticationOption::LTI_V1,
      email: @admin.email,
    )
    partial_lti_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes session, partial_lti_teacher
    User.any_instance.stubs(:valid_password?).returns(true)

    post :link_email, params: {email: @admin.email, password: 'password', lti_provider: 'test-provider', lms_name: 'test-lms'}
    assert_equal I18n.t('lti.account_linking.admin_not_allowed'), flash[:alert]
    assert_redirected_to user_session_path(lti_provider: 'test-provider', lms_name: 'test-lms')
  end

  test 'fails if the password is wrong' do
    PartialRegistration.stubs(:in_progress?).returns(true)
    Services::Lti::AccountLinker.expects(:call).never
    post :link_email, params: {email: @user.email, password: 'password'}
  end

  describe '#new_account' do
    subject(:new_account_request) {post :new_account}
    let(:user) {create(:teacher, :with_lti_authentication_option)}

    context 'when user is not logged and not in-progress with registration' do
      it 'returns bad request' do
        new_account_request
        assert_response :bad_request
      end
    end

    context 'when signed in' do
      before do
        sign_in user
      end

      it 'opts the user out of lms landing' do
        new_account_request

        user.reload
        _(user.lms_landing_opted_out).must_equal true
      end

      it 'verifies the teacher' do
        new_account_request

        user.reload
        _(user.verified_teacher?).must_equal true
      end
    end

    context 'when partial registration' do
      it 'opts the user out of lms landing' do
        PartialRegistration.persist_attributes(session, user)
        new_account_request

        partial_user = User.new_with_session(ActionController::Parameters.new, session)
        _(partial_user.lms_landing_opted_out).must_equal true
      end
    end

    context 'when student' do
      let(:user) {create(:student, :with_lti_authentication_option)}

      it 'does not verify the student' do
        sign_in user
        new_account_request

        _(user.verified_teacher?).must_equal false
      end
    end

    context 'when non-LTI user' do
      let(:user) {create(:teacher)}

      before do
        sign_in user
      end

      it 'does not opt the user out of lms landing' do
        new_account_request

        _(user.lms_landing_opted_out).must_be_nil
      end

      it 'does not verify the teacher' do
        new_account_request

        _(user.verified_teacher?).must_equal false
      end
    end
  end

  describe '#unlink' do
    let(:user) {create(:teacher)}
    let(:auth_option) {create(:lti_authentication_option, user: user)}

    context 'valid request' do
      it 'calls the AccountUnlinker service and returns 200' do
        sign_in user
        Services::Lti::AccountUnlinker.expects(:call).with(user: user, auth_option: auth_option).once
        post :unlink, params: {authentication_option_id: auth_option.id}
        assert_response :ok
      end
    end

    context 'when logged out' do
      it 'redirects to sign in page' do
        post :unlink, params: {authentication_option_id: 'fake-id'}
        assert_redirected_to new_user_session_path
      end
    end

    context 'when auth option not found' do
      it 'returns 404' do
        sign_in user
        post :unlink, params: {authentication_option_id: 'fake-id'}
        assert_response :not_found
      end
    end

    context 'when caller does not own the auth option' do
      let(:non_owned_auth_option) {create(:lti_authentication_option)}

      it 'returns 404' do
        sign_in user
        post :unlink, params: {authentication_option_id: non_owned_auth_option.id}
        assert_response :not_found
      end
    end

    context 'when nil input' do
      it 'returns 404' do
        sign_in user
        post :unlink
        assert_response :not_found
      end
    end
  end
end
