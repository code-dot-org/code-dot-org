require 'test_helper'

class PuzzleRatingsControllerTest < ActionController::TestCase

  setup do
    PuzzleRating.stubs(:enabled?).returns true
    @student = create :student
    @script = create :script
  end

  test 'creation requires current_user' do
    post :create, {}, format: :json
    assert_response :unauthorized
  end

  test 'creation requires params' do
    sign_in @student
    post :create, {}, format: :json
    assert_response :bad_request
  end

  test 'can be created uniquely only once' do
    sign_in @student

    level = create :level

    params = {
      script_id: @script.id,
      level_id: level.id,
      rating: 1
    }

    assert_creates(PuzzleRating) do
      post :create, params, format: :json
    end

    assert_response :created

    assert_does_not_create(PuzzleRating) do
      post :create, params, format: :json
    end

    assert_response :bad_request
  end

  test 'can be disabled' do
    PuzzleRating.stubs(:enabled?).returns false
    sign_in @student

    level = create :level

    params = {
      script_id: @script.id,
      level_id: level.id,
      rating: 1
    }

    assert_does_not_create(PuzzleRating) do
      post :create, params, format: :json
    end

    assert_response :unauthorized
  end

end
