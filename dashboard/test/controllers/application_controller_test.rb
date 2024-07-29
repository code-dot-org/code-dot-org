require 'test_helper'

class ApplicationControllerTest < ActionDispatch::IntegrationTest
  describe 'CAP lockout' do
    let(:user) {create(:student)}

    let(:cpa_experience_phase) {Cpa::ALL_USER_LOCKOUT}
    let(:user_is_locked_out?) {true}

    let(:expect_grace_period_handler_call) {Services::ChildAccount::GracePeriodHandler.expects(:call).with(user: user)}
    let(:expect_lockout_handler_call) {Services::ChildAccount::LockoutHandler.expects(:call).with(user: user)}

    before do
      Cpa.stubs(:cpa_experience).returns(cpa_experience_phase)
      Services::ChildAccount::LockoutHandler.stubs(:call).with(user: user).returns(user_is_locked_out?)

      sign_in user
    end

    it 'calls CAP grace period handler' do
      expect_grace_period_handler_call.once
      get root_path
    end

    it 'calls CAP lockout handler' do
      expect_lockout_handler_call.once
      get root_path
    end

    it 'redirects to the lockout page' do
      get root_path
      assert_redirected_to lockout_path
    end

    it 'allows current user data retrieving' do
      get api_v1_users_current_path
      refute_redirect_to lockout_path
    end

    it 'allows sign out' do
      get destroy_user_session_path
      refute_redirect_to lockout_path
    end

    it 'allows CSRF token retrieving' do
      get get_token_path
      refute_redirect_to lockout_path
    end

    it 'allows changing language' do
      post locale_path
      refute_redirect_to lockout_path
    end

    it 'avoids infinite redirect loop to lockout page' do
      get lockout_path
      refute_redirect_to lockout_path
    end

    it 'allows access to policy consent API' do
      get policy_compliance_child_account_consent_path
      refute_redirect_to lockout_path
    end

    it 'allows student change account information' do
      patch users_set_student_information_path
      refute_redirect_to lockout_path
    end

    context 'when user is not sign in' do
      before do
        sign_out user

        expect_grace_period_handler_call.never
        expect_lockout_handler_call.never
      end

      it 'does not redirect to lockout page' do
        get root_path
        refute_redirect_to lockout_path
      end
    end

    context 'when user is not locked out' do
      let(:user_is_locked_out?) {false}

      it 'does not redirect to lockout page' do
        get root_path
        refute_redirect_to lockout_path
      end
    end

    context 'when no CPA experience' do
      let(:cpa_experience_phase) {nil}

      it 'does not call CAP grace period handler' do
        expect_grace_period_handler_call.never
        get root_path
      end

      it 'does not call CAP lockout handler' do
        expect_lockout_handler_call.never
        get root_path
      end

      it 'does not redirect to lockout page' do
        get root_path
        refute_redirect_to lockout_path
      end
    end

    context 'when error is raised during grace period handling' do
      let(:error) {StandardError.new('expected_error')}

      before do
        Services::ChildAccount::GracePeriodHandler.stubs(:call).with(user: user).raises(error)
      end

      it 'does not call CAP grace period handler' do
        expect_grace_period_handler_call.never
        get root_path
      end

      it 'does not call CAP lockout handler' do
        expect_lockout_handler_call.never
        get root_path
      end

      it 'notifies Honeybadger about error' do
        request_path = root_path

        Honeybadger.expects(:notify).with(
          error,
          error_message: 'Failed to apply the Child Account Policy to the user',
          context: {
            user_id: user.id,
            request_path: request_path,
          }
        ).once

        get request_path
      end

      it 'does not redirect to lockout page' do
        get root_path
        refute_redirect_to lockout_path
      end
    end
  end

  describe 'LMS lockout' do
    let(:user) do
      create(:student)
    end

    before do
      user.authentication_options << build(:lti_authentication_option)
      user.save

      sign_in user
    end

    describe 'with session initialized' do
      before do
        Policies::Lti.stubs(:account_linking?).returns(true)
      end

      it 'should redirect to landing path' do
        get root_path

        assert_redirected_to lti_v1_account_linking_landing_path
      end

      it 'should NOT redirect to landing path for allow listed paths' do
        get destroy_user_session_path

        assert_redirected_to '//test.code.org'
      end
    end
  end

  # Assert that the response is not a redirection to the given path.
  private def refute_redirect_to(expected_path)
    return unless response.redirect_url
    redirect_path = URI.parse(response.redirect_url).path
    failure_message = "expected response to NOT redirect to #{expected_path}."
    refute_equal expected_path, redirect_path, failure_message
  end
end
