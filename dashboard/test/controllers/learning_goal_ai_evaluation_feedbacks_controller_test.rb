require 'test_helper'
require 'testing/includes_metrics'

class LearningGoalAiEvaluationFeedbacksControllerTest < ActionController::TestCase
  setup do
    @teacher = create :teacher
    sign_in @teacher
    @learning_goal_ai_evaluation = create :learning_goal_ai_evaluation
    @learning_goal_ai_evaluation_feedback = create :learning_goal_ai_evaluation_feedback, teacher_id: @teacher.id, learning_goal_ai_evaluation_id: @learning_goal_ai_evaluation.id
  end

  test 'create learning goal ai evaluation feedback without approval' do
    learning_goal_ai_evaluation_id = @learning_goal_ai_evaluation.id
    ai_feedback_approval = false
    false_positive = true
    false_negative = false
    vague = true
    feedback_other = true
    other_content = 'other content'

    # ensure thumbs down metric is logged
    Cdo::Metrics.expects(:push).with(
      AiRubricMetrics::AI_RUBRIC_METRICS_NAMESPACE,
      all_of(
        includes_metrics(LearningGoalAiEvaluationFeedback: 1),
        includes_dimensions(:LearningGoalAiEvaluationFeedback, Environment: CDO.rack_env, Approval: 'thumbs_down')
      )
    )

    post :create, params: {
      learningGoalAiEvaluationId: learning_goal_ai_evaluation_id,
      aiFeedbackApproval: ai_feedback_approval,
      falsePositive: false_positive,
      falseNegative: false_negative,
      vague: vague,
      feedbackOther: feedback_other,
      otherContent: other_content,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    refute_nil response_json['id']
    assert_equal @teacher.id, response_json['teacher_id']
    assert_equal learning_goal_ai_evaluation_id, response_json['learning_goal_ai_evaluation_id']
    assert_equal ai_feedback_approval, response_json['ai_feedback_approval']
    assert_equal false_positive, response_json['false_positive']
    assert_equal false_negative, response_json['false_negative']
    assert_equal vague, response_json['vague']
    assert_equal feedback_other, response_json['feedback_other']
    assert_equal other_content, response_json['other_content']
    refute_nil response_json['created_at']
  end

  test 'create learning goal ai evaluation feedback with approval' do
    learning_goal_ai_evaluation_id = @learning_goal_ai_evaluation.id
    ai_feedback_approval = true

    # ensure thumbs down metric is logged
    Cdo::Metrics.expects(:push).with(
      AiRubricMetrics::AI_RUBRIC_METRICS_NAMESPACE,
      all_of(
        includes_metrics(LearningGoalAiEvaluationFeedback: 1),
        includes_dimensions(:LearningGoalAiEvaluationFeedback, Environment: CDO.rack_env, Approval: 'thumbs_up')
      )
    )

    post :create, params: {
      learningGoalAiEvaluationId: learning_goal_ai_evaluation_id,
      aiFeedbackApproval: ai_feedback_approval,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    refute_nil response_json['id']
    assert_equal @teacher.id, response_json['teacher_id']
    assert_equal learning_goal_ai_evaluation_id, response_json['learning_goal_ai_evaluation_id']
    assert_equal ai_feedback_approval, response_json['ai_feedback_approval']
  end

  test 'update learning goal ai evaluation feedback' do
    id = @learning_goal_ai_evaluation_feedback.id
    learning_goal_ai_evaluation_id = @learning_goal_ai_evaluation_feedback.learning_goal_ai_evaluation_id
    ai_feedback_approval = false
    false_positive = true
    false_negative = false
    vague = true
    feedback_other = true
    other_content = 'other content'

    Cdo::Metrics.stubs(:push).never

    post :update, params: {
      id: id,
      learningGoalAiEvaluationId: learning_goal_ai_evaluation_id,
      aiFeedbackApproval: ai_feedback_approval,
      falsePositive: false_positive,
      falseNegative: false_negative,
      vague: vague,
      feedbackOther: feedback_other,
      otherContent: other_content,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal id, response_json['id']
    assert_equal @teacher.id, response_json['teacher_id']
    assert_equal learning_goal_ai_evaluation_id, response_json['learning_goal_ai_evaluation_id']
    assert_equal ai_feedback_approval, response_json['ai_feedback_approval']
    assert_equal false_positive, response_json['false_positive']
    assert_equal false_negative, response_json['false_negative']
    assert_equal vague, response_json['vague']
    assert_equal feedback_other, response_json['feedback_other']
    assert_equal other_content, response_json['other_content']
    refute_nil response_json['created_at']
  end

  test 'get feedback by learning goal ai evaluation id' do
    post :get_by_ai_evaluation_id, params: {learning_goal_ai_evaluation_id: @learning_goal_ai_evaluation.id}
    assert_response :success
    response_json = JSON.parse(response.body)
    response_json.each {|feedback| assert_equal feedback["learning_goal_ai_evaluation_id"], @learning_goal_ai_evaluation.id}
  end

  test_user_gets_response_for :create, params: -> {{learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id, aiFeedbackApproval: true}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, params: -> {{learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id, aiFeedbackApproval: true}}, user: :student, response: :forbidden
  test_user_gets_response_for :create, params: -> {{learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id, aiFeedbackApproval: true}}, user: :teacher, response: :success

  test_user_gets_response_for :update, params: -> {{id: @learning_goal_ai_evaluation_feedback.id, learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id, aiFeedbackApproval: true}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_ai_evaluation_feedback.id, learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id, aiFeedbackApproval: true}}, user: :student, response: :forbidden
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_ai_evaluation_feedback.id, learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id, aiFeedbackApproval: true}}, user: -> {@teacher}, response: :success
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_ai_evaluation_feedback.id, learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id, aiFeedbackApproval: true}}, user: :teacher, response: :forbidden

  test_user_gets_response_for :get_by_ai_evaluation_id, params: -> {{learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :get_by_ai_evaluation_id, params: -> {{learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :get_by_ai_evaluation_id, params: -> {{learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id}}, user: -> {@teacher}, response: :success
  test_user_gets_response_for :get_by_ai_evaluation_id, params: -> {{learningGoalAiEvaluationId: @learning_goal_ai_evaluation.id}}, user: :teacher, response: :not_found
end
