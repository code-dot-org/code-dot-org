require 'test_helper'

class VideosControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @video = create(:video)
    @user = create(:admin)
    sign_in(@user)

    Rails.application.config.stubs(:levelbuilder_mode).returns true

    Video.stubs(:merge_and_write_i18n)
    Video.stubs(:merge_and_write_attributes)
    Video.any_instance.stubs(:fetch_thumbnail)
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
        title: 'Test create title',
        video: {key: 'test_key', youtube_code: '_fake_code_'}
      }
    end

    assert_redirected_to videos_path
  end

  test "should get edit" do
    get :edit, params: {id: @video}
    assert_response :success
  end

  test "should update video" do
    patch :update, params: {
      id: @video,
      title: 'Test title',
      video: {key: @video.key, youtube_code: @video.youtube_code}
    }
    assert_redirected_to videos_path
  end
end
