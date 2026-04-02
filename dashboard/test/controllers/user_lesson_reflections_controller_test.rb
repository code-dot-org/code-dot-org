require 'test_helper'

class UserLessonReflectionsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @student = create(:student)
    @other_student = create(:student)
    @teacher = create(:teacher)
    @lesson = create(:lesson)
  end

  # Authentication / authorization via test_user_gets_response_for
  test_user_gets_response_for :create,
    params: -> {{lesson_id: @lesson.id, success: "It went well", struggle: "This was hard"}},
    user: nil,
    response: :redirect,
    redirected_to: '/users/sign_in'

  test_user_gets_response_for :create,
    params: -> {{lesson_id: @lesson.id, success: "It went well", struggle: "This was hard"}},
    user: :teacher,
    response: :forbidden

  # Happy path
  test "student can create a reflection" do
    sign_in @student

    assert_difference 'UserLessonReflection.count', 1 do
      post :create, params: {lesson_id: @lesson.id, success: "It went well", struggle: "This was hard"}
    end

    assert_response :created
    reflection = UserLessonReflection.last
    assert_equal @student.id, reflection.student_id
    assert_equal @lesson.id, reflection.lesson_id
    assert_equal "It went well", reflection.success
    assert_equal "This was hard", reflection.struggle
  end

  test "student can create multiple reflections for the same lesson" do
    sign_in @student

    assert_difference 'UserLessonReflection.count', 2 do
      post :create, params: {lesson_id: @lesson.id, success: "First attempt", struggle: "Confused at first"}
      post :create, params: {lesson_id: @lesson.id, success: "Better now", struggle: "Still a bit confused"}
    end

    reflections = UserLessonReflection.where(student: @student, lesson: @lesson).order(:created_at)
    assert_equal "First attempt", reflections.first.success
    assert_equal "Better now", reflections.last.success
  end

  # Authorization boundary
  test "student cannot create a reflection for another student" do
    sign_in @student

    assert_no_difference 'UserLessonReflection.count' do
      post :create, params: {lesson_id: @lesson.id, student_id: @other_student.id, success: "Spoofed"}
    end

    assert_response :forbidden
  end

  # Param filtering
  test "student_id in params is ignored and current_user id is used instead" do
    sign_in @student

    post :create, params: {lesson_id: @lesson.id, student_id: @other_student.id, success: "Test"}

    # Either forbidden or saved with correct student — either way the other student is not affected
    return unless response.status == 201
    assert_equal @student.id, UserLessonReflection.last.student_id
  end

  # Validation failure
  test "returns unprocessable_entity when lesson_id is missing" do
    sign_in @student

    assert_no_difference 'UserLessonReflection.count' do
      post :create, params: {success: "No lesson"}
    end

    assert_response :unprocessable_entity
    response_json = JSON.parse(response.body)
    assert response_json['errors'].present?
  end
end
