require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  API = '/api/v1/teacher_feedbacks'

  test 'can be created' do
    teacher = create :teacher
    sign_in teacher
    section = create :section, user: teacher
    student = create :student
    section.add_student(student)
    params = {
      student_id: student.id,
      level_id:  1,
      section_id: section.id,
      comment: "good job"
    }
    assert_creates(TeacherFeedback) do
      post API, params: {teacher_feedback: params}
      assert_response :success
    end
  end

  test 'missing parameters' do
    teacher = create :teacher
    sign_in teacher
    params = {
      student_id: 1,
      level_id: ActiveRecord::FixtureSet.identify(:level_1),
    }
    post API, params: {teacher_feedback: params}

    assert_response :bad_request
  end

  test 'wrong parameters' do
    teacher = create :teacher
    sign_in teacher
    params = {
      course_id: 1,
      level_id: ActiveRecord::FixtureSet.identify(:level_1),
      section_id: 1,
      comment: "good job"
    }
    post API, params: {teacher_feedback: params}

    assert_response :bad_request
  end
end
