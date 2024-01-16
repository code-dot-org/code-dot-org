require 'test_helper'

class CalloutsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @callout = Callout.first

    @user = create(:admin)
    sign_in(@user)

    @request.host = CDO.dashboard_hostname
  end

  test "should get index" do
    get :index
    assert_response :success
    refute_nil assigns(:callouts)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create callout" do
    assert_creates(Callout) do
      post :create, params: {
        callout: {
          element_id: @callout.element_id,
          localization_key: @callout.localization_key
        }
      }
    end

    assert_redirected_to callout_path(assigns(:callout))
  end

  test "should show callout" do
    get :show, params: {id: @callout}
    assert_response :success
  end

  test "should get edit" do
    get :edit, params: {id: @callout}
    assert_response :success
  end

  test "should update callout" do
    patch :update, params: {
      id: @callout,
      callout: {
        element_id: @callout.element_id,
        localization_key: @callout.localization_key
      }
    }
    assert_redirected_to callout_path(assigns(:callout))
  end

  test "should destroy callout" do
    assert_destroys(Callout) do
      delete :destroy, params: {id: @callout}
    end

    assert_redirected_to callouts_path
  end
end
