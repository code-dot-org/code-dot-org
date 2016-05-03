require 'test_helper'

class HintViewRequestsControllerTest < ActionController::TestCase

  setup do
    HintViewRequest.stubs(:enabled?).returns true
    @student = create :student
  end

  test 'creation requires current_user' do
    post :create, {}, format: :json
    assert_response :unauthorized
  end

  test 'creation requires params' do
    sign_in @student
    post :create, {}, format: :json
    assert_response :bad_request
  end

  test 'can be created' do
    sign_in @student

    params = {
      script_id: 1,
      level_id: ActiveRecord::FixtureSet.identify(:level_1),
      feedback_type: 1,
      feedback_xml: '',
    }

    assert_creates(HintViewRequest) do
      post :create, params, format: :json
    end

    assert_response :created
  end

  test 'can be disabled' do
    HintViewRequest.stubs(:enabled?).returns false
    sign_in @student

    params = {
      script_id: 1,
      level_id: 1,
      feedback_type: 1,
      feedback_xml: '',
    }

    assert_does_not_create(HintViewRequest) do
      post :create, params, format: :json
    end

    assert_response :unauthorized
  end

end
