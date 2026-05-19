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
      saved_feedback: "This is saved feedback.",
      submitted_feedback: "This is submitted feedback.",
      submitted_at: Time.current
    )
  end

  test_user_gets_response_for :create, params: -> {{teacher_id: @teacher.id, student_id: @student.id, lesson_id: @lesson.id, saved_feedback: "Test feedback"}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, params: -> {{teacher_id: @teacher.id, student_id: @student.id, lesson_id: @lesson.id, saved_feedback: "Test feedback"}}, user: :student, response: :forbidden
  test_user_gets_response_for :update, params: -> {{id: @lesson_feedback.id, saved_feedback: "Test update"}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, params: -> {{id: @lesson_feedback.id, saved_feedback: "Test update"}}, user: :student, response: :forbidden
  test_user_gets_response_for :show_by_student, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :saved_feedback, params: -> {{student_id: @student.id, lesson_id: @lesson.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :saved_feedback, params: -> {{student_id: @student.id, lesson_id: @lesson.id}}, user: :student, response: :forbidden

  test "teacher can update lesson feedback for their student" do
    sign_in @teacher

    patch :update, params: {
      id: @lesson_feedback.id,
      saved_feedback: "Updated feedback",
    }

    assert_response :success
    @lesson_feedback.reload
    assert_equal "Updated feedback", @lesson_feedback.saved_feedback
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
    different_lesson = create(:lesson)

    assert_difference 'LessonFeedback.count', 1 do
      post :create, params: {
        teacher_id: @teacher.id,
        student_id: @student.id,
        lesson_id: different_lesson.id,
        saved_feedback: "New feedback"
      }
    end

    assert_response :created
    feedback = LessonFeedback.last
    assert_equal @teacher.id, feedback.teacher_id
    assert_equal @student.id, feedback.student_id
    assert_equal "New feedback", feedback.saved_feedback
  end

  test "teacher cannot create lesson feedback for student they don't teach" do
    other_teacher = create(:teacher)
    sign_in other_teacher
    assert_no_difference 'LessonFeedback.count' do
      post :create, params: {
        teacher_id: other_teacher.id,
        student_id: @student.id,
        lesson_id: @lesson.id,
        saved_feedback: "Unauthorized feedback"
      }
    end
    assert_response :forbidden
  end

  test "student can view their own feedback" do
    sign_in @student

    get :show_by_student

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_equal 1, response_json.length
    assert_equal @teacher.name, response_json[0]['teacher_name']
    assert_equal @lesson.localized_title, response_json[0]['lesson_title']
  end

  test "student sees only their own feedback, not other students'" do
    # Create feedback for another student
    create(:lesson_feedback,
      teacher: @teacher,
      student: @other_student,
      lesson: @lesson,
      saved_feedback: "Other student feedback",
      submitted_at: Time.current
    )

    sign_in @student

    get :show_by_student

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_equal 1, response_json.length
    assert_equal @student.id, response_json[0]['student_id']
    refute_equal @other_student.id, response_json[0]['student_id']
  end

  test "student only sees submitted feedback, not draft feedback" do
    draft_feedback = create(:lesson_feedback,
      teacher: @teacher,
      student: @student,
      lesson: create(:lesson),
      saved_feedback: "Draft feedback"
    )

    sign_in @student

    get :show_by_student

    assert_response :success
    response_json = JSON.parse(response.body)
    # Should only see the submitted feedback from setup, not the draft
    assert_equal 1, response_json.length
    assert_equal @lesson_feedback.id, response_json[0]['id']
    refute(response_json.any? {|f| f['id'] == draft_feedback.id})
  end

  test "teacher can access show_by_student and sees their own student feedback if they are also a student" do
    # This tests the edge case where a teacher might also be a student
    create(:lesson_feedback,
      teacher: create(:teacher),
      student: @teacher, # Teacher is also a student
      lesson: @lesson,
      saved_feedback: "Feedback for teacher as student",
      submitted_at: Time.current
    )

    sign_in @teacher

    get :show_by_student

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_equal 1, response_json.length
    assert_equal @teacher.id, response_json[0]['student_id']
  end

  test "teacher can get saved feedback for their student" do
    sign_in @teacher

    get :saved_feedback, params: {
      student_id: @student.id,
      lesson_id: @lesson.id
    }

    assert_response :success
    response_json = JSON.parse(response.body)
    assert_equal @lesson_feedback.saved_feedback, response_json['saved_feedback']
  end

  test "teacher cannot get saved feedback for student they don't teach" do
    other_teacher = create(:teacher)
    sign_in other_teacher

    get :saved_feedback, params: {
      student_id: @student.id,
      lesson_id: @lesson.id
    }

    assert_response :forbidden
  end

  test "saved_feedback returns not found for non-existent feedback" do
    sign_in @teacher
    non_existent_lesson = create(:lesson)

    assert_raises(ActiveRecord::RecordNotFound) do
      get :saved_feedback, params: {
        student_id: @student.id,
        lesson_id: non_existent_lesson.id
      }
    end
  end

  test "cannot create duplicate lesson feedback for same student and lesson" do
    sign_in @teacher

    post :create, params: {
      teacher_id: @teacher.id,
      student_id: @student.id,
      lesson_id: @lesson.id, # Same as existing @lesson_feedback
      saved_feedback: "Duplicate feedback"
    }

    assert_response :unprocessable_entity
    response_json = JSON.parse(response.body)
    assert response_json['errors'].present?
  end

  test "teacher can create lesson feedback with resources" do
    sign_in @teacher
    different_lesson = create(:lesson)

    assert_difference 'LessonFeedback.count', 1 do
      post :create, params: {
        teacher_id: @teacher.id,
        student_id: @student.id,
        lesson_id: different_lesson.id,
        saved_feedback: "Feedback with resources",
        resources: [
          {
            recommended_action: "Review",
            resource_name: "Video Tutorial",
            resource_link: "https://example.com/tutorial"
          }
        ]
      }
    end

    assert_response :created
    feedback = LessonFeedback.last
    assert feedback.resources.present?
    assert_equal "Review", feedback.resources[0]["recommended_action"]
    assert_equal "Video Tutorial", feedback.resources[0]["resource_name"]
    assert_equal "https://example.com/tutorial", feedback.resources[0]["resource_link"]
  end

  test "teacher can submit feedback with submitted_at timestamp" do
    sign_in @teacher

    patch :update, params: {
      id: @lesson_feedback.id,
      submitted_feedback: "Final submitted feedback",
      submitted_at: Time.current
    }

    assert_response :success
    @lesson_feedback.reload
    assert_equal "Final submitted feedback", @lesson_feedback.submitted_feedback
    assert @lesson_feedback.submitted_at.present?
  end
end
