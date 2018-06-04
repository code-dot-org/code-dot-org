require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  API = '/api/v1/teacher_feedbacks'

  test 'can be created' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student(student)
    level = create :level

    sign_in teacher
    params = {
      student_id: student.id,
      level_id: level.id,
      section_id: section.id,
      comment: "good job"
    }

    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params}
      assert_response :success
    end

    teacher_feedback = TeacherFeedback.last
    assert_equal student.id, teacher_feedback.student_id
    assert_equal level.id, teacher_feedback.level_id
  end
end
