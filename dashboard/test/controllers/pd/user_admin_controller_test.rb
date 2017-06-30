require 'test_helper'

class Pd::UserAdminControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @workshop_admin = create :workshop_admin
    @teacher = create :teacher
    @student = create :student, name: 'student'
    @facilitator = create :facilitator
  end

  def self.test_workshop_admin_only(method, action, success_response, params = nil)
    test_user_gets_response_for action, user: :student, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@teacher}, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@workshop_admin}, method: method, params: params, response: success_response
  end

  # test anonymous user redirect to sign in
  test_redirect_to_sign_in_for :find_user
  # test find_user start page is forbidden to teachers and permitted for workshop admins
  test_workshop_admin_only :get, :find_user, :success

  test 'assign workshop admin permission to teacher' do
    #refute @teacher.permission?(UserPermission::WORKSHOP_ADMIN), "User already has Workshop Admin permission"
    sign_in @workshop_admin
    get :assign_permission, params: {user_id: @teacher.id, pd_user_permission_id: UserPermission::WORKSHOP_ADMIN}
    assert_redirected_to action: :find_user, params: {search_term: @teacher.id}
    assert @teacher.permission?(UserPermission::WORKSHOP_ADMIN), "User does not have Workshop Admin permission"
  end

  test 'remove facilitator permission from user' do
    #assert @facilitator.permission?(UserPermission::FACILITATOR)
    sign_in @workshop_admin
    get :remove_permission, params: {user_id: @facilitator.id, pd_user_permission_id: UserPermission::FACILITATOR}
    assert_redirected_to action: :find_user, params: {search_term: @facilitator.id}
    refute @facilitator.permission?(UserPermission::FACILITATOR), "User still has the Facilitator permission"
  end
end
