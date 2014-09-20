require 'test_helper'

class GamesControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @game = create(:game)
    10.times do
      create(:level, game_id: @game.id)
    end
    @user = create(:admin)
    sign_in(@user)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:games)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create game" do
    assert_difference('Game.count') do
      post :create, game: { name: @game.name }
    end

    assert_redirected_to game_path(assigns(:game))
  end

  test "should show game" do
    get :show, id: @game
    assert_response :success

    assert_not_nil assigns(:game)
    assert_not_nil assigns(:levels)
    assert_equal 10, assigns(:levels).count
  end

  test "should get edit" do
    get :edit, id: @game
    assert_response :success
  end

  test "should update game" do
    patch :update, id: @game, game: { name: @game.name }
    assert_redirected_to game_path(assigns(:game))
  end

  test "should destroy game" do
    assert_difference('Game.count', -1) do
      delete :destroy, id: @game
    end

    assert_redirected_to games_path
  end
end
