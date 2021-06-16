require 'test_helper'

class PuzzleRatingsControllerTest < ActionController::TestCase
  setup do
    PuzzleRating.stubs(:enabled?).returns true
    @student = create :student
    @unit = create :script
  end

  test 'creation requires script, level, and rating' do
    level = create :level

    assert_does_not_create(PuzzleRating) do
      post :create, params: {}, format: :json
    end
    assert_response :bad_request

    assert_does_not_create(PuzzleRating) do
      post :create, params: {script_id: @unit.id}, format: :json
    end
    assert_response :bad_request

    assert_does_not_create(PuzzleRating) do
      post :create, params: {level_id: level.id}, format: :json
    end
    assert_response :bad_request

    assert_does_not_create(PuzzleRating) do
      post :create, params: {rating: 0}, format: :json
    end
    assert_response :bad_request

    assert_creates(PuzzleRating) do
      post :create, params: {
        script_id: @unit.id,
        level_id: level.id,
        rating: 0
      }, format: :json
    end
    assert_response :created
  end

  test 'rating must be 0 or 1' do
    level = create :level

    [nil, 0.5, 2, -1].each do |bad_rating|
      assert_does_not_create(PuzzleRating) do
        post :create, params: {
          script_id: @unit.id,
          level_id: level.id,
          rating: bad_rating
        }, format: :json
      end
      assert_response :bad_request
    end

    [0, 1].each do |good_rating|
      assert_creates(PuzzleRating) do
        post :create, params: {
          script_id: @unit.id,
          level_id: level.id,
          rating: good_rating
        }, format: :json
      end
      assert_response :created
    end
  end

  test 'logged-in user can create uniquely only once' do
    sign_in @student

    level = create :level

    params = {
      script_id: @unit.id,
      level_id: level.id,
      rating: 1
    }

    assert_creates(PuzzleRating) do
      post :create, params: params, format: :json
    end

    assert_response :created

    assert_does_not_create(PuzzleRating) do
      post :create, params: params, format: :json
    end

    assert_response :bad_request
  end

  test 'anonymous user can create many' do
    level = create :level

    params = {
      script_id: @unit.id,
      level_id: level.id,
      rating: 1
    }

    assert_creates(PuzzleRating) do
      post :create, params: params, format: :json
    end

    assert_response :created

    assert_creates(PuzzleRating) do
      post :create, params: params, format: :json
    end

    assert_response :created
  end

  test 'can be disabled' do
    PuzzleRating.stubs(:enabled?).returns false

    level = create :level

    params = {
      script_id: @unit.id,
      level_id: level.id,
      rating: 1
    }

    assert_does_not_create(PuzzleRating) do
      post :create, params: params, format: :json
    end

    assert_response :unauthorized
  end
end
