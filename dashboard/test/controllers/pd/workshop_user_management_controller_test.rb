require 'test_helper'

class Pd::WorkshopUserManagementControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @workshop_admin = create :workshop_admin
    @teacher = create :teacher
    @student = create :student
    @facilitator = create :facilitator
    @facilitator_with_course = create(:pd_course_facilitator, course: Pd::Workshop::COURSE_CSF).facilitator
  end

  def self.test_workshop_admin_only(method, action, params = nil)
    test_user_gets_response_for action, user: :student, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@teacher}, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@workshop_admin}, method: method, params: params, response: :success
  end

  test_redirect_to_sign_in_for :facilitator_courses_form
  test_workshop_admin_only :get, :facilitator_courses_form

  test 'find user for non-existent email displays no user error' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: 'nonexistent@example.net'}
    assert_select '.alert-success', 'User not found'
  end

  test 'find user for non-existent id displays no user error' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: -999}
    assert_select '.alert-success', 'User not found'
  end

  test 'find user by id for existing user displays user email' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: @teacher.id}
    assert_select 'td', text: @teacher.email
  end

  test 'find user by email for existing user displays user id' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: @teacher.email}
    assert_select 'td', text: @teacher.id.to_s
  end

  test 'assign course to facilitator assigns course' do
    sign_in @workshop_admin
    assert_creates Pd::CourseFacilitator do
      post :assign_course, params: {user_id: @facilitator.id, course: Pd::Workshop::COURSE_ECS}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @facilitator.id}
    assert @facilitator.courses_as_facilitator.exists?(course: Pd::Workshop::COURSE_ECS), "#{Pd::Workshop::COURSE_ECS} was not assigned to Facilitator - #{@facilitator.email}"
  end

  test 'assign course to teacher grants facilitator permission' do
    sign_in @workshop_admin
    assert_creates UserPermission do
      post :assign_course, params: {user_id: @teacher.id, course: Pd::Workshop::COURSE_ECS}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @teacher.id}
    assert @teacher.reload.permission?(UserPermission::FACILITATOR), 'Facilitator permission not granted to user'
    assert @teacher.courses_as_facilitator.exists?(course: Pd::Workshop::COURSE_ECS), "#{Pd::Workshop::COURSE_ECS} was not assigned to Teacher - #{@teacher.email}"
  end

  test 'grant facilitator permission to teacher grants permission' do
    sign_in @workshop_admin
    assert_creates UserPermission do
      post :update_facilitator_permission, params: {user_id: @teacher.id, is_facilitator: 'true'}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @teacher.id}
    assert @teacher.reload.permission?(UserPermission::FACILITATOR), 'Facilitator permission not granted to user'
  end

  test 'grant facilitator permission noops for student' do
    sign_in @workshop_admin
    get(:update_facilitator_permission, params: {user_id: @student.id, is_facilitator: 'true'})
    assert [], @student.reload.permissions
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @student.id}
  end

  test 'revoke facilitator permission revokes permission' do
    sign_in @workshop_admin
    assert_destroys(UserPermission) do
      get :update_facilitator_permission, params: {user_id: @facilitator.id, is_facilitator: 'false'}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @facilitator.id}
    refute @facilitator.reload.permission?(UserPermission::FACILITATOR), 'Facilitator permission not revoked from user'
  end

  test 'revoke facilitator permission from user with assigned courses fails' do
    sign_in @workshop_admin
    get :update_facilitator_permission, params: {user_id: @facilitator_with_course, is_facilitator: 'false'}
    assert @facilitator_with_course.reload.permission?(UserPermission::FACILITATOR), 'Facilitator permission revoked from user'
    assert_equal(
      "REMOVE FACILITATOR PERMISSION FAILED: one or more courses are assigned to user #{@facilitator_with_course.email}",
      flash[:alert]
    )
  end

  test 'remove course from facilitator removes course' do
    sign_in @workshop_admin
    assert_destroys(Pd::CourseFacilitator) do
      get :remove_course, params: {user_id: @facilitator_with_course.id, course: Pd::Workshop::COURSE_CSF}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @facilitator_with_course.id}
    refute @facilitator.courses_as_facilitator.exists?(course: Pd::Workshop::COURSE_CSF), "#{Pd::Workshop::COURSE_CSF} was not removed from Facilitator - #{@facilitator_with_course.email}"
  end
end
