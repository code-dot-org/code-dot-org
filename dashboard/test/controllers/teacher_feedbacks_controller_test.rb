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

    all_feedback_data = get_all_response_feedback_data
    assert_equal 0, all_feedback_data.count
  end

  test 'index: returns success if signed in user - feedback' do
    feedback = create :teacher_feedback, :with_script_level
    assert_equal TeacherFeedback.all.count, 1
    sign_in feedback.student
    get :index
    assert_response :success

    all_feedback_data = get_all_response_feedback_data
    assert_equal 1, all_feedback_data.count
    assert_equal feedback.student.id, all_feedback_data.first['student_id']
  end

  test 'index returns many feedbacks' do
    student = create :student
    5.times do
      create :teacher_feedback, :with_script_level, student: student
    end
    assert_equal TeacherFeedback.all.count, 5
    sign_in student
    assert_queries 25 do
      get :index
      assert_response :success
    end

    all_feedback_data = get_all_response_feedback_data
    assert_equal 5, all_feedback_data.count
  end

  test 'index returns only latest feedback marked awaiting review if student has done work since feedback was given' do
    student = create :student
    script_level = create :script_level
    3.times do
      create :teacher_feedback, student: student, script: script_level.script, level: script_level.levels.first, review_state: TeacherFeedback::REVIEW_STATES.keepWorking
    end

    create :user_level, user: student, level: script_level.levels.first, script: script_level.script, updated_at: 1.week.from_now

    sign_in student
    get :index
    assert_response :success

    all_feedback_data = get_all_response_feedback_data
    awaiting_review_for_level_vals = all_feedback_data.map {|feedback| feedback['is_awaiting_teacher_review']}
    assert_equal awaiting_review_for_level_vals, [true, false, false]
  end

  private

  def get_all_response_feedback_data
    assert_select 'script[data-feedback]', 1
    feedback_data = JSON.parse(css_select('script[data-feedback]').first.attribute('data-feedback').to_s)
    feedback_data['all_feedback']
  end
end
