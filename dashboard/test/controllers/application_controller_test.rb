require 'test_helper'

class ApplicationControllerTest < ActionDispatch::IntegrationTest
  describe 'CAP lockout' do
    let(:user) {create(:student)}

    let(:user_lockable?) {true}
    let(:user_locked_out?) {true}
    let(:cpa_experience_phase) {Cpa::ALL_USER_LOCKOUT}

    before do
      Cpa.stubs(:cpa_experience).returns(cpa_experience_phase)

      Policies::ChildAccount.stubs(:lockable?).with(user).returns(user_lockable?)
      Policies::ChildAccount::ComplianceState.stubs(:locked_out?).with(user).returns(user_locked_out?)

      sign_in user
    end

    it 'locks out user' do
      Services::ChildAccount.expects(:lock_out).with(user).once
      get root_path
    end

    it 'redirects to the lockout page' do
      get root_path
      assert_redirected_to lockout_path
    end

    it 'allows sign out' do
      get destroy_user_session_path
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
      end

      it 'does not redirect to lockout page' do
        get root_path
        refute_redirect_to lockout_path
      end
    end

    context 'when user is not lockable' do
      let(:user_lockable?) {false}

      it 'does not lock out user' do
        Services::ChildAccount.expects(:lock_out).with(user).never
        get root_path
      end
    end

    context 'when no CPA experience' do
      let(:cpa_experience_phase) {nil}

      it 'does not lock out user' do
        Services::ChildAccount.expects(:lock_out).with(user).never
        get root_path
      end

      it 'does not redirect to lockout page' do
        get root_path
        refute_redirect_to lockout_path
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
