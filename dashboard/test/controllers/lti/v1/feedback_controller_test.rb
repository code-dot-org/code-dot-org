require 'test_helper'

class Lti::V1::FeedbackControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @user = create(:teacher)
  end

  setup do
    sign_in @user

    Policies::Lti.stubs(:feedback_available?).with(@user).returns(true)
  end

  teardown do
    Lti::Feedback.where(user: @user).destroy_all
  end

  test 'create - creates user LTI Feedback' do
    expected_satisfied = true
    expected_early_access = false

    assert_difference('Lti::Feedback.count') do
      post :create, params: {lti_feedback: {satisfied: expected_satisfied}}, format: :json
    end

    assert_response :created
    response = JSON.parse(@response.body)
    assert_equal @user.id, response['user_id']
    assert_equal 'en-US', response['locale']
    assert_equal expected_early_access, response['early_access']
    assert_equal expected_satisfied, response['satisfied']
  end

  test 'create - returns 204 error when LTI feedback is not available for user' do
    Policies::Lti.stubs(:feedback_available?).with(@user).returns(false)

    assert_no_difference('Lti::Feedback.count') do
      post :create, params: {lti_feedback: {satisfaction_level: nil}}
    end

    assert_response :no_content
  end

  test 'create - returns validation errors when params are invalid' do
    assert_no_difference('Lti::Feedback.count') do
      post :create, params: {lti_feedback: {satisfied: nil}}, format: :json
    end

    assert_response :unprocessable_entity
    assert_equal '["Satisfied is not included in the list"]', response.body
  end

  test 'show - returns the LTI Feedback for the current user' do
    lti_feedback = create(:lti_feedback, user: @user)

    get :show, format: :json

    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal lti_feedback.id, response['id']
    assert_equal @user.id, response['user_id']
  end

  test 'show - returns nothing when no LTI Feedback exists for the current user' do
    get :show, format: :json

    assert_response :ok
  end
end
