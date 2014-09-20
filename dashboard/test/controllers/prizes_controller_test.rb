require 'test_helper'

class PrizesControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @prize = create(:prize)
    @admin = create(:admin)
    sign_in(@admin)

    @not_admin = create(:user)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:prizes)
  end

  test "should not get index if not signed in" do
    sign_out @admin
    get :index

    assert_redirected_to_sign_in
  end

  test "should not get index if not admin" do
    sign_in @not_admin

    get :index

    assert_response :forbidden
  end


  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create prize" do
    assert_difference('Prize.count') do
      post :create, prize: { code: @prize.code, prize_provider_id: @prize.prize_provider_id, user_id: @prize.user_id }
    end

    assert_redirected_to prize_path(assigns(:prize))
  end

  test "should show prize" do
    get :show, id: @prize
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @prize
    assert_response :success
  end

  test "should update prize" do
    patch :update, id: @prize, prize: { code: @prize.code, prize_provider_id: @prize.prize_provider_id, user_id: @prize.user_id }
    assert_redirected_to prize_path(assigns(:prize))
  end

  test "should destroy prize" do
    assert_difference('Prize.count', -1) do
      delete :destroy, id: @prize
    end

    assert_redirected_to prizes_path
  end
end
