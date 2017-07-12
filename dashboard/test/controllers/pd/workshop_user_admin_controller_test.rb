require 'test_helper'

class Pd::WorkshopUserAdminControllerTest < ActionController::TestCase
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
  test_redirect_to_sign_in_for :facilitator_courses_form
  # test facilitator/course form is forbidden to students/teachers and permitted for workshop admins
  test_workshop_admin_only :get, :facilitator_courses_form, :success

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
    get :assign_course, params: {facilitator_id: @facilitator.id, course: Pd::Workshop::COURSES[0]}
    assert_redirected_to action: :facilitator_courses_form, params: {search_term: @facilitator.id}
    assert Pd::CourseFacilitator.where(facilitator_id: @facilitator.id, course: Pd::Workshop::COURSES[0]).any?, "#{Pd::Workshop::COURSES[0]} was not assigned to Facilitator - #{@facilitator.email}"
  end
end
