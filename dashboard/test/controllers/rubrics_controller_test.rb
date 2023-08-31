require 'test_helper'

class RubricsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @levelbuilder = create :levelbuilder
    sign_in @levelbuilder
    @lesson = create(:lesson)
    @level = create(:level)
    create :script_level, script: @lesson.script, lesson: @lesson, levels: [@level]
  end

  # new page is levelbuilder only
  test_user_gets_response_for :new, params: -> {{lessonId: @lesson.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :new, params: -> {{lessonId: @lesson.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :new, params: -> {{lessonId: @lesson.id}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :new, params: -> {{lessonId: @lesson.id}}, user: :levelbuilder, response: :success

  test "create Rubric and Learning Goals with valid params" do
    sign_in @levelbuilder

    assert_creates(Rubric) do
      post :create, params: {
        level_id: @level.id,
        lesson_id: @lesson.id,
        learning_goals_attributes: [
          {learning_goal: 'learning goal example 1', ai_enabled: true, position: 1},
          {learning_goal: 'learning goal example 2', ai_enabled: false, position: 2}
        ]
      }
    end

    puts @rubric.inspect

    response_json = JSON.parse(response.body)
    rubric_id = response_json['rubricId']
    @rubric = Rubric.find_by(id: rubric_id)
    @learning_goals = LearningGoal.where(rubric_id: @rubric.id)

    assert_equal @level.id, @rubric.level_id
    assert_equal @lesson.id, @rubric.lesson_id
    assert_equal 2, @learning_goals.length
  end
end
