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

  test 'find facilitator for non-existent email displays no facilitator error' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: 'nonexistent@example.net'}
    assert_select '.alert-success', 'Facilitator not found'
  end

  test 'find facilitator for non-existent id displays no facilitator error' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: -999}
    assert_select '.alert-success', 'Facilitator not found'
  end

  test 'find facilitator by id for existing facilitator displays facilitator email' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: @facilitator.id}
    assert_select 'td', @facilitator.email
  end

  test 'find facilitator by email for existing facilitator displays facilitator id' do
    sign_in @workshop_admin
    post :facilitator_courses_form, params: {search_term: @facilitator.email}
    assert_select 'td', text: @facilitator.id.to_s
  end

  test 'assign course to facilitator assigns course' do
    sign_in @workshop_admin
    assert_creates Pd::CourseFacilitator do
      get :assign_course, params: {facilitator_id: @facilitator.id, course: Pd::Workshop::COURSE_ECS}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @facilitator.id}
    assert @facilitator.courses_as_facilitator.exists?(course: Pd::Workshop::COURSE_ECS), "#{Pd::Workshop::COURSE_ECS} was not assigned to Facilitator - #{@facilitator.email}"
  end

  test 'remove course from facilitator removes course' do
    sign_in @workshop_admin
    assert_difference 'Pd::CourseFacilitator.count', -1 do
      get :remove_course, params: {facilitator_id: @facilitator_with_course.id, course: Pd::Workshop::COURSE_CSF}
    end
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @facilitator_with_course.id}
    refute @facilitator.courses_as_facilitator.exists?(course: Pd::Workshop::COURSE_CSF), "#{Pd::Workshop::COURSE_CSF} was not removed from Facilitator - #{@facilitator_with_course.email}"
  end
end
