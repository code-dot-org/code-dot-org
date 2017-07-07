require 'test_helper'

class Pd::UserAdminControllerTest < ::ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @workshop_admin = create :workshop_admin
    @teacher = create :teacher
    @student = create :student
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

  test 'find user for non-existent email displays no user error' do
    sign_in @workshop_admin
    post :find_user, params: {search_term: 'nonexistent@example.net'}
    assert_select 'p', 'No User Found'
  end

  test 'find user for non-existent id displays no user error' do
    sign_in @workshop_admin
    post :find_user, params: {search_term: -999}
    assert_select 'p', 'No User Found'
  end

  test 'find user by id for existing user displays user email' do
    sign_in @workshop_admin
    post :find_user, params: {search_term: @teacher.id}
    assert_select 'td', @teacher.email
  end

  test 'find user by email for existing user displays user id' do
    sign_in @workshop_admin
    post :find_user, params: {search_term: @teacher.email}
    assert_select 'td', text: @teacher.id.to_s
  end

  test 'find user for facilitator displays workshop admin permission' do
    sign_in @workshop_admin
    post :find_user, params: {search_term: @facilitator.email}
    assert_select '#permission-table tbody td', text: UserPermission::WORKSHOP_ADMIN.to_s
    assert_select 'td', @facilitator.email
    #assert_select 'td', text: 'Revoke'
  end

  test 'assign workshop admin permission to teacher' do
    sign_in @workshop_admin
    get :assign_permission, params: {user_id: @teacher.id, pd_user_permission_id: UserPermission::WORKSHOP_ADMIN}
    assert_redirected_to action: :find_user, params: {search_term: @teacher.id}
    assert @teacher.permission?(UserPermission::WORKSHOP_ADMIN), "User does not have Workshop Admin permission"
  end

  test 'remove facilitator permission from user' do
    sign_in @workshop_admin
    get :remove_permission, params: {user_id: @facilitator.id, pd_user_permission_id: UserPermission::FACILITATOR}
    assert_redirected_to action: :find_user, params: {search_term: @facilitator.id}
    refute @facilitator.permission?(UserPermission::FACILITATOR), "User still has the Facilitator permission"
  end
end
