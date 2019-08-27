require 'test_helper'

class TeacherFeedbacksControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  test 'index: returns forbidden if no logged in user' do
    get :index
    assert_redirected_to_sign_in
  end

  test 'index: returns success if signed in user - no feedback' do
    student = create :student
    sign_in student
    get :index
    assert_response :success
  end

  test 'index: returns success if signed in user - feedback' do
    feedback = create :teacher_feedback
    sign_in feedback.student
    get :index
    assert_response :success
  end
end
