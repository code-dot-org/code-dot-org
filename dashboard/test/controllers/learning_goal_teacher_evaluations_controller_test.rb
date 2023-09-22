require 'test_helper'

class LearningGoalTeacherEvaluationsControllerTest < ActionController::TestCase
  setup do
    @teacher = create :teacher
    @student = create :student
    sign_in @teacher
    @learning_goal = create :learning_goal
    @learning_goal_teacher_evaluation = create :learning_goal_teacher_evaluation, teacher_id: @teacher.id, user_id: @student.id, learning_goal_id: @learning_goal.id
  end

  test 'create learning goal evaluation' do
    user_id = @student.id
    teacher_id = @teacher.id
    learning_goal_id = @learning_goal.id
    understanding = 5
    feedback = 'abc'

    post :create, params: {
      userId: user_id,
      learningGoalId: learning_goal_id,
      understanding: understanding,
      feedback: feedback,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_not_nil response_json['id']
    assert_equal user_id, response_json['user_id']
    assert_equal learning_goal_id, response_json['learning_goal_id']
    assert_equal teacher_id, response_json['teacher_id']
    assert_equal understanding, response_json['understanding']
    assert_equal feedback, response_json['feedback']
    assert_not_nil response_json['created_at']
  end

  test 'update learning goal evaluation' do
    id = @learning_goal_teacher_evaluation.id
    user_id = @student.id
    teacher_id = @teacher.id
    learning_goal_id = @learning_goal.id
    understanding = 6
    feedback = 'ghi'

    post :update, params: {
      id: id,
      userId: user_id,
      learningGoalId: learning_goal_id,
      understanding: understanding,
      feedback: feedback
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal id, response_json['id']
    assert_equal user_id, response_json['user_id']
    assert_equal learning_goal_id, response_json['learning_goal_id']
    assert_equal teacher_id, response_json['teacher_id']
    assert_equal understanding, response_json['understanding']
    assert_equal feedback, response_json['feedback']
    assert_not_nil response_json['created_at']
  end

  test 'get_evaluation method' do
    get :get_evaluation, params: {
      userId: @learning_goal_teacher_evaluation.user_id,
      teacherId: @learning_goal_teacher_evaluation.teacher_id,
      learningGoalId: @learning_goal_teacher_evaluation.learning_goal_id
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal response_json['id'], @learning_goal_teacher_evaluation.id
  end

  test 'get_or_create_evaluation method' do
    post :get_or_create_evaluation, params: {
      userId: @learning_goal_teacher_evaluation.user_id,
      learningGoalId: @learning_goal_teacher_evaluation.learning_goal_id
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal response_json['id'], @learning_goal_teacher_evaluation.id

    new_student = create :student

    user_id = new_student.id
    learning_goal_id = @learning_goal.id

    post :get_or_create_evaluation, params: {
      userId: user_id,
      learningGoalId: learning_goal_id,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_not_nil response_json['id']
    assert_not_equal response_json['id'], @learning_goal_teacher_evaluation.id
    assert_equal response_json['user_id'], user_id
  end


  # Test create responses
  test_user_gets_response_for :create, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, user: :student, response: :forbidden

  # Test update responses
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_teacher_evaluation.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_teacher_evaluation.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_teacher_evaluation.id}}, user: :teacher, response: :not_found

  # Test get_evaluation responses
  test_user_gets_response_for :get_evaluation, params: -> {{learningGoalId: @learning_goal.id, userId: @student.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :get_evaluation, params: -> {{learningGoalId: @learning_goal.id, userId: @student.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :get_evaluation, params: -> {{learningGoalId: @learning_goal.id, userId: @student.id}}, user: :teacher, response: :not_found

  # Test get_or_create responses
  test_user_gets_response_for :get_or_create_evaluation, params: -> {{learningGoalId: @learning_goal.id, userId: @student.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :get_or_create_evaluation, params: -> {{learningGoalId: @learning_goal.id, userId: @student.id}}, user: :student, response: :forbidden
end
