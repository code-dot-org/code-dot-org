require 'test_helper'

class LearningGoalAiEvaluationFeedbacksControllerTest < ActionController::TestCase
  setup do
    @teacher = create :teacher
    sign_in @teacher
    @learning_goal_ai_evaluation = create :learning_goal_ai_evaluation
  end

  test 'create learning goal ai evaluation feedback' do
    teacher_id = @teacher.id
    learning_goal_ai_evaluation_id = @learning_goal_ai_evaluation.id
    ai_feedback_approval = false
    false_positive = true
    false_negative = false
    vague = true
    feedback_other = true
    other_content = 'other content'

    post :create, params: {
      teacherId: teacher_id,
      learningGoalAiEvaluationId: learning_goal_ai_evaluation_id,
      aiFeedbackApproval: ai_feedback_approval,
      falsePositive: false_positive,
      falseNegative: false_negative,
      vague: vague,
      feedbackOther: feedback_other,
      otherContent: other_content,
    }
    puts response
    assert_response :success

    response_json = JSON.parse(response.body)
    refute_nil response_json['id']
    assert_equal teacher_id, response_json['teacher_id']
    assert_equal learning_goal_ai_evaluation_id, response_json['learning_goal_ai_evaluation_id']
    assert_equal ai_feedback_approval, response_json['ai_feedback_approval']
    assert_equal false_positive, response_json['false_positive']
    assert_equal false_negative, response_json['false_negative']
    assert_equal vague, response_json['vague']
    assert_equal feedback_other, response_json['feedback_other']
    assert_equal other_content, response_json['other_content']
    refute_nil response_json['created_at']
  end
end
