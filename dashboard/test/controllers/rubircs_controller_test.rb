require 'test_helper'

class RubricsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup_all do
    @levelbuilder = create :levelbuilder
  end

  # new page is levelbuilder only
  test_user_gets_response_for :new, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :new, user: :student, response: :forbidden
  test_user_gets_response_for :new, user: :teacher, response: :forbidden
  test_user_gets_response_for :new, user: :levelbuilder, response: :success

  test "create Rubric and Learning Goals with valid params" do
    sign_in @levelbuilder

    assert_creates(Rubric) do
      post :create, params: {
        rubric: {
          level_id: '1',
          lesson_id: @lesson.id,
          learning_goals_attributes: [
            {learning_goal: 'learning goal example 1', ai_enabled: true, position: 1},
            {learning_goal: 'learning goal example 2', ai_enabled: false, position: 2}
          ]
        }
      }
    end

    assert assigns(:learning_goal)
  end
end
