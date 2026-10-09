require 'test_helper'

class UserLessonObjectiveReflectionsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @student = create(:student)
    @other_student = create(:student)
    @teacher = create(:teacher)
    @objective = create(:objective)
  end

  # Authentication / authorization via test_user_gets_response_for
  test_user_gets_response_for :create,
    params: -> {{objective_id: @objective.id, reflection: "It went well"}},
    user: nil,
    response: :redirect,
    redirected_to: '/users/sign_in'

  test_user_gets_response_for :create,
    params: -> {{objective_id: @objective.id, reflection: "It went well"}},
    user: :teacher,
    response: :created

  test "student can create a reflection" do
    sign_in @student

    assert_difference 'UserLessonObjectiveReflection.count', 1 do
      post :create, params: {objective_id: @objective.id, reflection: "confident"}
    end

    assert_response :created
    reflection = UserLessonObjectiveReflection.find(JSON.parse(response.body)['id'])
    assert_equal @student.id, reflection.student_id
    assert_equal @objective.id, reflection.objective_id
    assert_equal "confident", reflection.reflection
  end

  test "student can create multiple reflections for the same objective" do
    sign_in @student

    assert_difference 'UserLessonObjectiveReflection.count', 2 do
      post :create, params: {objective_id: @objective.id, reflection: "lost"}
      post :create, params: {objective_id: @objective.id, reflection: "confident"}
    end

    reflections = UserLessonObjectiveReflection.where(student: @student, objective: @objective).order(:created_at)
    assert_equal "lost", reflections.first.reflection
    assert_equal "confident", reflections.last.reflection
  end

  # Param filtering / authorization boundary
  test "student_id in params is ignored and reflection is always created for current_user" do
    sign_in @student

    assert_difference 'UserLessonObjectiveReflection.count', 1 do
      post :create, params: {objective_id: @objective.id, student_id: @other_student.id, reflection: "confident"}
    end

    assert_response :created
    assert_equal @student.id, UserLessonObjectiveReflection.last.student_id
    assert_equal 0, UserLessonObjectiveReflection.where(student_id: @other_student.id).count
  end

  # Validation failure
  test "returns unprocessable_entity when objective_id is missing" do
    sign_in @student

    assert_no_difference 'UserLessonObjectiveReflection.count' do
      post :create, params: {reflection: "No objective"}
    end

    assert_response :unprocessable_entity
    response_json = JSON.parse(response.body)
    assert response_json['errors'].present?
  end
end
