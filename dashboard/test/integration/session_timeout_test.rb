require 'test_helper'

class SessionTimeoutTest < ActionDispatch::IntegrationTest
  include ActiveSupport::Testing::TimeHelpers

  let(:user) {create(:user)}
  let(:timeout) {Devise.timeout_in}

  describe 'session timeout' do
    before do
      sign_in user
    end

    it 'redirects to the sign in page after timeout' do
      get home_path
      assert_response :ok
      current_time = Time.current

      travel_to(current_time + timeout + 1.minute) do
        get home_path
        assert_redirected_to new_user_session_path
      end
    end
  end
end
