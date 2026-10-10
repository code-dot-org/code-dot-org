require 'test_helper'

class UserPracticeProblemAttemptsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @practice_problem = create(:practice_problem)
    @user = create(:student)
    @other_user = create(:student)
    @attempt = create(:user_practice_problem_attempt, user: @user, practice_problem: @practice_problem)
    @other_attempt = create(:user_practice_problem_attempt, user: @other_user)
  end

  # --- unauthenticated ---

  test 'index redirects to sign in when not signed in' do
    get :index
    assert_redirected_to_sign_in
  end

  test 'show redirects to sign in when not signed in' do
    get :show, params: {id: @attempt.id}
    assert_redirected_to_sign_in
  end

  test 'create redirects to sign in when not signed in' do
    post :create, params: {
      practice_problem_id: @practice_problem.id,
      attempt: {answer: 'a'},
      correct: false,
      delivery_context_type: SharedConstants::PRACTICE_PROBLEM_DELIVERY_CONTEXT[:AI_TUTOR_LESSON_DEEP_DIVE]
    }
    assert_redirected_to_sign_in
  end

  test 'update redirects to sign in when not signed in' do
    put :update, params: {id: @attempt.id, ai_feedback: 'good'}
    assert_redirected_to_sign_in
  end

  # --- index ---

  test 'index returns only the signed-in user\'s attempts' do
    sign_in @user
    get :index
    assert_response :success
    ids = JSON.parse(response.body).map {|a| a['id']}
    assert_includes ids, @attempt.id
    refute_includes ids, @other_attempt.id
  end

  test 'index filters by problem_ids when provided' do
    other_problem = create(:practice_problem)
    other_attempt = create(:user_practice_problem_attempt, user: @user, practice_problem: other_problem)
    sign_in @user
    get :index, params: {problem_ids: [@practice_problem.id]}
    assert_response :success
    ids = JSON.parse(response.body).map {|a| a['id']}
    assert_includes ids, @attempt.id
    refute_includes ids, other_attempt.id
  end

  # --- show ---

  test 'show returns the attempt when it belongs to the signed-in user' do
    sign_in @user
    get :show, params: {id: @attempt.id}
    assert_response :success
    assert_equal @attempt.id, JSON.parse(response.body)['id']
  end

  test 'show returns forbidden when the attempt belongs to another user' do
    sign_in @user
    get :show, params: {id: @other_attempt.id}
    assert_response :forbidden
  end

  # --- create ---

  test 'create saves the attempt under the signed-in user' do
    sign_in @user
    assert_difference 'UserPracticeProblemAttempt.count', 1 do
      post :create, params: {
        practice_problem_id: @practice_problem.id,
        attempt: {answer: 'b'},
        correct: true,
        delivery_context_type: SharedConstants::PRACTICE_PROBLEM_DELIVERY_CONTEXT[:AI_TUTOR_LESSON_DEEP_DIVE]
      }
    end
    assert_response :created
    created = UserPracticeProblemAttempt.find(JSON.parse(response.body)['id'])
    assert_equal @user.id, created.user_id
  end

  test 'created attempt is accessible through the user record' do
    sign_in @user
    post :create, params: {
      practice_problem_id: @practice_problem.id,
      attempt: {answer: 'b'},
      correct: true,
      delivery_context_type: SharedConstants::PRACTICE_PROBLEM_DELIVERY_CONTEXT[:AI_TUTOR_LESSON_DEEP_DIVE]
    }
    assert_response :created
    created_id = JSON.parse(response.body)['id']
    assert @user.user_practice_problem_attempts.exists?(created_id)
  end

  test 'created attempt exposes the associated practice problem' do
    sign_in @user
    post :create, params: {
      practice_problem_id: @practice_problem.id,
      attempt: {answer: 'b'},
      correct: true,
      delivery_context_type: SharedConstants::PRACTICE_PROBLEM_DELIVERY_CONTEXT[:AI_TUTOR_LESSON_DEEP_DIVE]
    }
    assert_response :created
    created = UserPracticeProblemAttempt.find(JSON.parse(response.body)['id'])
    assert_equal @practice_problem, created.practice_problem
  end

  # --- update ---

  test 'update modifies the attempt when it belongs to the signed-in user' do
    sign_in @user
    put :update, params: {id: @attempt.id, ai_feedback: 'nice work'}
    assert_response :success
    assert_equal 'nice work', @attempt.reload.ai_feedback
  end

  test 'update returns forbidden when the attempt belongs to another user' do
    sign_in @user
    put :update, params: {id: @other_attempt.id, ai_feedback: 'sneaky'}
    assert_response :forbidden
    assert_nil @other_attempt.reload.ai_feedback
  end
end
