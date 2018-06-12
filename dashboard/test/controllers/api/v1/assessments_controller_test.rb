require 'test_helper'

class Api::V1::AssessmentsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @teacher.permission = UserPermission::AUTHORIZED_TEACHER
    @section = create(:section, user: @teacher, login_type: 'word')
    @student = create(:follower, section: @section).student_user
  end

  # index tests - gets assessment questions and answers
  test 'logged out cannot get assessment questions and answers' do
    get :index
    assert_response :forbidden
  end

  test 'students cannot get assessment questions and answers' do
    sign_in @student
    get :index
    assert_response :forbidden
  end

  test 'non-verified teacher cannot get assessment questions and answers' do
    non_verified_teacher = create(:teacher)
    section = create(:section, user: non_verified_teacher, login_type: 'word')
    create(:follower, section: section).student_user

    sign_in non_verified_teacher
    get :index
    assert_response :not_found
  end

  test 'verified teacher can get assessment questions and answers' do
    sign_in @teacher
    get :index, params: {section_id: @section.id, script_id: 2}
    assert_response :success
  end

  # section_responses tests - gets student responses to assessment
  test 'logged out cannot get assessment responses from students' do
    get :section_responses
    assert_response :forbidden
  end

  test 'students cannot get assessment responses from students' do
    sign_in @student
    get :section_responses
    assert_response :forbidden
  end

  test 'verified teacher can get assessment responses from students' do
    sign_in @teacher
    get :section_responses, params: {section_id: @section.id, script_id: 2}
    assert_response :success
  end
end
