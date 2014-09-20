require 'test_helper'

class PrizeProvidersControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @prize_provider = create(:prize_provider)
    @user = create(:admin)
    sign_in(@user)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:prize_providers)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create prize_provider" do
    assert_difference('PrizeProvider.count') do
      post :create, prize_provider: { description_token: @prize_provider.description_token, image_name: @prize_provider.image_name, name: @prize_provider.name, url: @prize_provider.url }
    end

    assert_redirected_to prize_provider_path(assigns(:prize_provider))
  end

  test "should show prize_provider" do
    get :show, id: @prize_provider
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @prize_provider
    assert_response :success
  end

  test "should update prize_provider" do
    patch :update, id: @prize_provider, prize_provider: { description_token: @prize_provider.description_token, image_name: @prize_provider.image_name, name: @prize_provider.name, url: @prize_provider.url }
    assert_redirected_to prize_provider_path(assigns(:prize_provider))
  end

  test "should destroy prize_provider" do
    assert_difference('PrizeProvider.count', -1) do
      delete :destroy, id: @prize_provider
    end

    assert_redirected_to prize_providers_path
  end
end
