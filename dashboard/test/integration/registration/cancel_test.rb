require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over GET /users/cancel
  #
  class CancelTest < ActionDispatch::IntegrationTest
    test 'cancels partial registration and redirects to signup' do
      PartialRegistration.expects(:cancel)
      get '/users/cancel'
      assert_redirected_to new_user_registration_path
      follow_redirect!
      # User should currently see old signup flow if they
      # cancel an in-progress registration and want to start over.
      assert_template partial: '_sign_up'
    end
  end
end
