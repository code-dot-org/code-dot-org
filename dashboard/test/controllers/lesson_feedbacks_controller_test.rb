require 'test_helper'

class LessonFeedbacksControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @teacher = create(:authorized_teacher)
    @student = create(:student)
    @other_student = create(:student)
    @lesson = create(:lesson)
    @section = create(:section, user: @teacher)
    @follower = create(:follower, user: @teacher, student_user: @student)

    @lesson_feedback = create(:lesson_feedback,
      teacher: @teacher,
      student: @student,
      lesson: @lesson,
      saved_feedback: "Good work!"
    )
  end

  test "teacher can update lesson feedback for their student" do
    sign_in @teacher

    patch :update, params: {
      id: @lesson_feedback.id,
      saved_feedback: "Updated feedback",
      submitted_feedback: "Great job on this lesson!"
    }

    assert_response :success
    @lesson_feedback.reload
    assert_equal "Updated feedback", @lesson_feedback.saved_feedback
    assert_equal "Great job on this lesson!", @lesson_feedback.submitted_feedback
  end

  test "teacher cannot update lesson feedback for student they don't teach" do
    other_teacher = create(:teacher)
    sign_in other_teacher

    patch :update, params: {
      id: @lesson_feedback.id,
      saved_feedback: "Unauthorized update"
    }

    assert_response :forbidden
  end

  test "teacher can create lesson feedback for their student" do
    sign_in @teacher

    assert_difference 'LessonFeedback.count', 1 do
      post :create, params: {
        teacher_id: @teacher.id,
        student_id: @student.id,
        lesson_id: @lesson.id,
        saved_feedback: "New feedback"
      }
    end

    assert_response :created
    feedback = LessonFeedback.last
    assert_equal @teacher.id, feedback.teacher_id
    assert_equal @student.id, feedback.student_id
    assert_equal "New feedback", feedback.saved_feedback
  end
end
