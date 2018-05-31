require 'test_helper'

class TeacherFeedbacksControllerTest < ActionController::TestCase
  test 'can be created' do
    params = {
      script_id: 1,
      level_id: ActiveRecord::FixtureSet.identify(:level_1),
      section_id: 1,
      comment: "good job"
    }
    assert_creates(TeacherFeedback) do
      post :create, params: params
    end
    assert_response :success
  end
end
