require 'test_helper'

class Pd::WorkshopUserManagementControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @workshop_admin = create :workshop_admin
    @teacher = create :teacher
    @multi_auth_teacher = create :teacher
    @student = create :student
    @facilitator = create :facilitator
    @facilitator_with_course = create(:pd_course_facilitator, course: Pd::Workshop::COURSE_CSF).facilitator
  end

  def self.test_workshop_admin_only(method, action, params = {})
    test_user_gets_response_for action, user: :student, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@teacher}, method: method, params: params, response: :forbidden
    test_user_gets_response_for action, user: -> {@workshop_admin}, method: method, params: params, response: :success
  end

  test_redirect_to_sign_in_for :facilitator_courses_form
  test_workshop_admin_only :get, :facilitator_courses_form

  test 'get user by email for existing user displays user id' do
    sign_in @workshop_admin
    get :facilitator_courses_form, params: {search_term: @teacher.email}
    assert_select 'td', text: @teacher.id.to_s
  end

  test 'get multi-auth user by email for existing user displays user id' do
    sign_in @workshop_admin
    get :facilitator_courses_form, params: {search_term: @multi_auth_teacher.email}
    assert_select 'td', text: @multi_auth_teacher.id.to_s
  end

  test 'get user by id for existing user displays user email' do
    sign_in @workshop_admin
    get :facilitator_courses_form, params: {search_term: @teacher.id}
    assert_select 'td', text: @teacher.email
  end

  test 'get multi-auth user by id for existing user displays user email' do
    sign_in @workshop_admin
    get :facilitator_courses_form, params: {search_term: @multi_auth_teacher.id}
    assert_select 'td', text: @multi_auth_teacher.email
  end

  test 'find user for non-existent email displays no user error' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: 'nonexistent@example.net'}
    assert_select '.alert-success', text: 'No user with email/id <nonexistent@example.net> found.'
  end

  test 'find user for non-existent id displays no user error' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: -999}
    assert_select '.alert-success', text: 'No user with email/id <-999> found.'
  end

  test 'find user by id for existing user displays user email' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: @teacher.id}
    assert_select 'td', text: @teacher.email
  end

  test 'find multi-auth user by id for existing user displays user email' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: @multi_auth_teacher.id}
    assert_select 'td', text: @multi_auth_teacher.email
  end

  test 'find user by email for existing user displays user id' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: @teacher.email}
    assert_select 'td', text: @teacher.id.to_s
  end

  test 'find multi-auth user by email for existing user displays user id' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: @multi_auth_teacher.email}
    assert_select 'td', text: @multi_auth_teacher.id.to_s
  end

  test 'assign course to facilitator assigns course' do
    sign_in @workshop_admin
    assert_creates Pd::CourseFacilitator do
      post :assign_course_to_facilitator, params: {user_id: @facilitator.id, course: Pd::Workshop::COURSE_ECS}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @facilitator.id}
    assert @facilitator.courses_as_facilitator.exists?(course: Pd::Workshop::COURSE_ECS), "#{Pd::Workshop::COURSE_ECS} was not assigned to Facilitator - #{@facilitator.email}"
  end

  test 'assign course to teacher grants facilitator permission' do
    sign_in @workshop_admin
    assert_creates UserPermission do
      post :assign_course_to_facilitator, params: {user_id: @teacher.id, course: Pd::Workshop::COURSE_ECS}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @teacher.id}
    assert @teacher.reload.permission?(UserPermission::FACILITATOR), 'Facilitator permission not granted to user'
    assert @teacher.courses_as_facilitator.exists?(course: Pd::Workshop::COURSE_ECS), "#{Pd::Workshop::COURSE_ECS} was not assigned to Teacher - #{@teacher.email}"
  end

  test 'remove course from facilitator removes course' do
    sign_in @workshop_admin
    assert_destroys(Pd::CourseFacilitator) do
      get :remove_course_from_facilitator, params: {user_id: @facilitator_with_course.id, course: Pd::Workshop::COURSE_CSF}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @facilitator_with_course.id}
    refute @facilitator.courses_as_facilitator.exists?(course: Pd::Workshop::COURSE_CSF), "#{Pd::Workshop::COURSE_CSF} was not removed from Facilitator - #{@facilitator_with_course.email}"
  end

  test 'remove last course from facilitator revokes facilitator permission' do
    sign_in @workshop_admin
    assert_destroys UserPermission do
      get :remove_course_from_facilitator, params: {user_id: @facilitator_with_course.id, course: Pd::Workshop::COURSE_CSF}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @facilitator_with_course.id}
    refute @facilitator_with_course.reload.permission?(UserPermission::FACILITATOR)
  end
end
