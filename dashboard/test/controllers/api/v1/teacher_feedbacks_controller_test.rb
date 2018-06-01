require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  API = '/api/v1/teacher_feedbacks'

  test 'can be created' do

    teacher = create :teacher
    sign_in teacher
    section = create :section, user: teacher
    student = create :student
    level = create :level
    params = {
      student_id: student.id,
      level_id: level.id,
      section_id: section.id,
      comment: "good job"
    }
    assert_creates(TeacherFeedback) do
      post "#{API}", params: {teacher_feedback: params}
      assert_response :success
    end

  end
end
