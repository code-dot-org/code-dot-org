require 'test_helper'

class LessonsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    @lesson = create(
      :lesson,
      name: 'lesson display name',
      properties: {overview: 'lesson overview'}
    )

    @levelbuilder = create :levelbuilder
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

  # only levelbuilders can edit
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: nil, response: :redirect
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: :teacher, response: :forbidden
  test_user_gets_response_for :edit, params: -> {{id: @lesson.id}}, user: :levelbuilder, response: :success

  test 'edit lesson' do
    sign_in @levelbuilder

    get :edit, params: {
      id: @lesson.id
    }
    assert_response :ok
    assert(@response.body.include?("Editing #{@lesson.name}"))
  end
end
