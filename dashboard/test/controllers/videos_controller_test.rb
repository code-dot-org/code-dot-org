require 'test_helper'

class VideosControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @video = create(:video)
    @user = create(:admin)
    sign_in(@user)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:videos)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create video" do
    assert_creates(Video) do
      post :create, params: {
        video: {key: @video.key, youtube_code: @video.youtube_code}
      }
    end

    assert_redirected_to video_path(assigns(:video))
  end

  test "should show video" do
    get :show, params: {id: @video}
    assert_response :success
  end

  test "should get edit" do
    get :edit, params: {id: @video}
    assert_response :success
  end

  test "should update video" do
    patch :update, params: {
      id: @video,
      video: {key: @video.key, youtube_code: @video.youtube_code}
    }
    assert_redirected_to video_path(assigns(:video))
  end

  test "should destroy video" do
    assert_destroys(Video) do
      delete :destroy, params: {id: @video}
    end

    assert_redirected_to videos_path
  end
end
