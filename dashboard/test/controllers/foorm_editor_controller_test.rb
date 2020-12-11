require 'test_helper'

class FoormEditorControllerTest < ActionController::TestCase
  test_redirect_to_sign_in_for :index
  test_user_gets_response_for :index, user: :student, response: :forbidden
  test_user_gets_response_for :index, user: :levelbuilder, response: :success
end
