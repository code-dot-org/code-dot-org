require 'test_helper'

class NewFeatureFeedbackControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @user = create(:teacher)
  end

  setup do
    sign_in @user
  end

  teardown do
    NewFeatureFeedback.where(user: @user).destroy_all
  end

  test 'create - creates user New Feature Feedback' do
    expected_satisfied = true
    expected_form_key = 'progress_v2'

    assert_difference('NewFeatureFeedback.count') do
      post :create, params: {feedback: {satisfied: expected_satisfied, form_key: expected_form_key}}, format: :json
    end

    assert_response :created
    response = JSON.parse(@response.body)
    assert_equal @user.id, response['user_id']
    assert_equal expected_satisfied, response['satisfied']
    assert_equal expected_form_key, response['form_key']
  end

  test 'create - error when trying to create feedback twice' do
    expected_satisfied = true
    expected_form_key = 'progress_v2'

    post :create, params: {feedback: {satisfied: expected_satisfied, form_key: expected_form_key}}, format: :json

    assert_no_difference('NewFeatureFeedback.count') do
      assert_raises ActiveRecord::RecordNotUnique do
        post :create, params: {feedback: {satisfied: expected_satisfied, form_key: expected_form_key}}, format: :json

        assert_response :bad_request
      end
    end
  end

  test 'create - returns validation errors when satisfied param is invalid' do
    assert_no_difference('NewFeatureFeedback.count') do
      post :create, params: {feedback: {satisfied: nil, form_key: 'progress_v2'}}, format: :json
    end

    assert_response :unprocessable_entity
    assert_equal '["Satisfied is not included in the list"]', response.body
  end

  test 'create - returns validation errors when form_key param is invalid' do
    assert_no_difference('NewFeatureFeedback.count') do
      assert_raises ArgumentError do
        post :create, params: {feedback: {satisfied: true, form_key: 'invalid_form_key'}}, format: :json

        assert_response :bad_request
      end
    end
  end

  test 'show - returns the Feedback for the current user' do
    expected_satisfied = true
    feedback = create(:new_feature_feedback, user: @user, satisfied: expected_satisfied)

    get :show, params: {form_key: 'progress_v2'}, format: :json

    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal feedback.id, response['id']
    assert_equal @user.id, response['user_id']
    assert_equal expected_satisfied, response['satisfied']
  end

  test 'show - returns nothing when no Feedback exists for the current user' do
    get :show, params: {form_key: 'progress_v2'}, format: :json

    assert_response :ok
    refute_includes @response, 'body'
  end
end
