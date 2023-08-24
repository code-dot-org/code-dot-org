require 'test_helper'

class LearningGoalEvaluationsControllerTest < ActionController::TestCase
  test 'create learning goal evaluation' do
    learning_goal = create :learning_goal
    user_id = 1
    level_id = 2
    unit_id = 3
    teacher_id = 4
    learning_goal_id = learning_goal.id
    understanding = 6
    feedback = 'abc'
    context = 'def'

    post :create, params: {
      userId: user_id,
      levelId: level_id,
      unitId: unit_id,
      learningGoalId: learning_goal_id,
      teacherId: teacher_id,
      understanding: understanding,
      feedback: feedback,
      context: context
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_not_nil response_json['id']
    assert_equal user_id, response_json['user_id']
    assert_equal level_id, response_json['level_id']
    assert_equal unit_id, response_json['unit_id']
    assert_equal learning_goal.id, response_json['learning_goal_id']
    assert_equal understanding, response_json['understanding']
    assert_equal feedback, response_json['feedback']
    assert_equal context, response_json['context']
    assert_not_nil response_json['created_at']
  end
end
