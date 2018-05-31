require 'test_helper'

class TeacherFeedbacksControllerTest < ActionController::TestCase
  test 'can be created' do
    params = {
      student_id: 1,
      level_id: ActiveRecord::FixtureSet.identify(:level_1),
      section_id: 1,
      comment: "good job"
    }
    assert_creates(TeacherFeedback) do
      post :create, params: {teacher_feedback: params}
    end
    assert_response :success
  end

  test 'missing parameters' do
    params = {
      student_id: 1,
      level_id: ActiveRecord::FixtureSet.identify(:level_1),
    }
    post :create, params: {teacher_feedback: params}

    assert_response :bad_request
  end

  test 'wrong parameters' do
    params = {
      course_id: 1,
      level_id: ActiveRecord::FixtureSet.identify(:level_1),
      section_id: 1,
      comment: "good job"
    }
    post :create, params: {teacher_feedback: params}

    assert_response :bad_request
  end
end
