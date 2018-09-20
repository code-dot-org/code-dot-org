require 'test_helper'

module RegistrationsControllerTests
  #
  # Tests over GET /users/finish_sign_up
  #
  class FinishSignUpTest < ActionDispatch::IntegrationTest
    test "responds with success" do
      get '/users/finish_sign_up'
      assert_response :success
    end
  end
end
