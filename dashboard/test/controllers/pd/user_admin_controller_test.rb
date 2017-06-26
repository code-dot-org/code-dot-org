require 'test_helper'

class Pd::UserAdminControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @workshop_admin = create :workshop_admin
    @teacher = create :teacher
  end

  def self.test_workshop_admin_only(method, action, success_response, params = nil)
    test_user_gets_response_for action, user: -> {@teacher}, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@workshop_admin}, method: method, params: params, response: success_response
  end

  # test anonymous user redirect to sign in
  test_redirect_to_sign_in_for :find_user
  # test find_user start page is forbidden to teachers and permitted for workshop admins
  test_workshop_admin_only :get, :find_user, :success
end
