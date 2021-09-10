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

    all_feedbacks_by_level = get_all_response_feedback_data
    assert_equal 0, all_feedbacks_by_level.count
  end

  test 'index: returns success if signed in user - feedback' do
    feedback = create :teacher_feedback, :with_script_level
    assert_equal TeacherFeedback.all.count, 1
    sign_in feedback.student
    get :index
    assert_response :success

    all_feedbacks_by_level = get_all_response_feedback_data
    assert_equal 1, all_feedbacks_by_level.count
    assert_equal 1, all_feedbacks_by_level[0]['feedbacks'].count
    assert_equal feedback.student.id, all_feedbacks_by_level[0]['feedbacks'][0]['student_id']
  end

  test 'index returns many feedbacks for 3 levels' do
    student = create :student
    teacher = create :teacher
    script_level = create :script_level
    script_level_2 = create :script_level
    script_level_3 = create :script_level
    2.times do
      create :teacher_feedback, student: student, teacher: teacher, level: script_level.level, script: script_level.script
    end
    create :teacher_feedback, student: student, teacher: teacher, level: script_level_2.level, script: script_level_2.script
    create :teacher_feedback, student: student, teacher: teacher, level: script_level_3.level, script: script_level_3.script

    assert_equal TeacherFeedback.all.count, 4
    sign_in student
    assert_queries 19 do
      get :index
      assert_response :success
    end

    all_feedbacks_by_level = get_all_response_feedback_data
    assert_equal 3, all_feedbacks_by_level.count
  end

  test 'index returns most recent feedback first for a level' do
    student = create :student
    teacher = create :teacher
    script_level = create :script_level

    # script_level feedback
    create :teacher_feedback, student: student, teacher: teacher, level: script_level.level, script: script_level.script, created_at: 4.weeks.ago, comment: "oldest"
    create :teacher_feedback, student: student, teacher: teacher, level: script_level.level, script: script_level.script, created_at: 3.weeks.ago, comment: "middle"
    create :teacher_feedback, student: student, teacher: teacher, level: script_level.level, script: script_level.script, created_at: 2.weeks.ago, comment: "newest"

    sign_in student
    get :index
    assert_response :success

    all_feedbacks_by_level = get_all_response_feedback_data

    level_feedbacks = all_feedbacks_by_level[0]['feedbacks']
    assert_equal "newest", level_feedbacks[0]['comment']
    assert_equal "middle", level_feedbacks[1]['comment']
    assert_equal "oldest", level_feedbacks[2]['comment']
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

    all_feedbacks_by_level = get_all_response_feedback_data
    level_feedbacks = all_feedbacks_by_level[0]['feedbacks']
    awaiting_review_for_level_vals = level_feedbacks.map {|feedback| feedback['is_awaiting_teacher_review']}
    assert_equal awaiting_review_for_level_vals, [true, false, false]
  end

  private

  def get_all_response_feedback_data
    assert_select 'script[data-feedback]', 1
    feedback_data = JSON.parse(css_select('script[data-feedback]').first.attribute('data-feedback').to_s)
    feedback_data['all_feedbacks_by_level']
  end
end
