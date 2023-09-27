require 'test_helper'

class LearningGoalAiEvaluationsControllerTest < ActionController::TestCase
  test "gets evaluation for student and learning goal" do
    student = create :student
    teacher = create :teacher
    create :follower, student_user: student, user: teacher
    sign_in teacher

    ai_evaluation = create :learning_goal_ai_evaluation, user: student

    get :get_evaluation, params: {
      userId: student.id,
      learningGoalId: ai_evaluation.learning_goal_id
    }

    assert_response :success
    assert_equal ai_evaluation.understanding, json_response['understanding']
  end

  test "cannot get evaluation for student if not teacher of student" do
    student = create :student
    teacher = create :teacher
    sign_in teacher

    ai_evaluation = create :learning_goal_ai_evaluation, user: student

    get :get_evaluation, params: {
      userId: student.id,
      learningGoalId: ai_evaluation.learning_goal_id
    }

    assert_response :forbidden
  end
end
