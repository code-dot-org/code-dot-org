require 'test_helper'

class CalloutsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @callout = callouts(:one)
    @user = create(:admin)
    sign_in(@user)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:callouts)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create callout" do
    assert_difference('Callout.count') do
      post :create, callout: { element_id: @callout.element_id, localization_key: @callout.localization_key }
    end

    assert_redirected_to callout_path(assigns(:callout))
  end

  test "should show callout" do
    get :show, id: @callout
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @callout
    assert_response :success
  end

  test "should update callout" do
    patch :update, id: @callout, callout: { element_id: @callout.element_id, localization_key: @callout.localization_key }
    assert_redirected_to callout_path(assigns(:callout))
  end

  test "should destroy callout" do
    assert_difference('Callout.count', -1) do
      delete :destroy, id: @callout
    end

    assert_redirected_to callouts_path
  end
end
