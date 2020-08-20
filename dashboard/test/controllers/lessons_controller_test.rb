require 'test_helper'

class LessonsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @lesson = create(
      :lesson,
      name: 'lesson display name',
      properties: {overview: 'lesson overview'}
    )
  end

  # anyone can show lesson
  test_user_gets_response_for :show, params: -> {{id: @lesson.id}}, user: nil, response: :success
  test_user_gets_response_for :show, params: -> {{id: @lesson.id}}, user: :student, response: :success
  test_user_gets_response_for :show, params: -> {{id: @lesson.id}}, user: :teacher, response: :success
  test_user_gets_response_for :show, params: -> {{id: @lesson.id}}, user: :levelbuilder, response: :success

  test 'show lesson' do
    get :show, params: {
      id: @lesson.id
    }
    assert_response :ok
    assert(@response.body.include?(@lesson.name))
    assert(@response.body.include?(@lesson.overview))
  end
end
