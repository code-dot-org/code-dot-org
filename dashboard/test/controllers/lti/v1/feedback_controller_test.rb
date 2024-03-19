require 'test_helper'

class Lti::V1::FeedbackControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @user = create(:teacher)
  end

  setup do
    sign_in @user

    Policies::Lti.stubs(:early_access?).returns(false)
    Policies::Lti.stubs(:feedback_available?).with(@user).returns(true)
  end

  test 'create - creates user LTI Feedback' do
    expected_satisfaction_level = 'neutral'
    expected_early_access = true

    Policies::Lti.stubs(:early_access?).returns(expected_early_access)

    assert_difference('Lti::Feedback.count') do
      post :create, params: {lti_feedback: {satisfaction_level: expected_satisfaction_level}}, as: :js
    end

    assert_response :created
    assert_instance_of Lti::Feedback, assigns(:lti_feedback)
    assert_equal @user, assigns(:lti_feedback).user
    assert_equal 'en-US', assigns(:lti_feedback).locale
    assert_equal expected_early_access, assigns(:lti_feedback).early_access
    assert_equal expected_satisfaction_level, assigns(:lti_feedback).satisfaction_level
  end

  test 'create - returns forbidden error when LTI feedback is not available for user' do
    Policies::Lti.stubs(:feedback_available?).with(@user).returns(false)

    assert_no_difference('Lti::Feedback.count') do
      post :create, params: {lti_feedback: {satisfaction_level: nil}}, as: :js
    end

    assert_response :forbidden
  end

  test 'create - returns validation errors when params are invalid' do
    assert_no_difference('Lti::Feedback.count') do
      post :create, params: {lti_feedback: {satisfaction_level: nil}}, as: :js
    end

    assert_response :unprocessable_entity
    assert_equal '["Satisfaction level is required"]', response.body
  end
end
