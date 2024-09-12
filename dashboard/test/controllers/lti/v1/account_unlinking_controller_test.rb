require 'test_helper'

class Lti::V1::AccountUnlinkingControllerTest < ActionController::TestCase
  describe '#unlink' do
    let(:user) {create :teacher}
    let(:auth_option) {create :lti_authentication_option, user: user}

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
      let(:non_owned_auth_option) {create :lti_authentication_option}

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
