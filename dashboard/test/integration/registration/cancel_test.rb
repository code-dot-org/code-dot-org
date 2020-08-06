require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over GET /users/cancel
  # See also the cancel flow in GoogleOAuth2Test
  #
  class CancelTest < ActionDispatch::IntegrationTest
    test 'cancels partial registration and redirects to signup' do
      SignUpTracking.expects(:log_cancel_finish_sign_up)
      SignUpTracking.expects(:end_sign_up_tracking)
      PartialRegistration.expects(:delete)

      get '/users/cancel'
      assert_redirected_to new_user_registration_path
      follow_redirect!
      # User should currently see old signup flow if they
      # cancel an in-progress registration and want to start over.
      assert_template partial: '_sign_up'
    end
  end
end
