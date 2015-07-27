require 'test_helper'

class ProjectsControllerTest < ActionController::TestCase
  include Devise::TestHelpers
  setup do
    sign_in create(:user)
  end

  test "get index" do
    get :index
    assert_response :success
  end

  test "get projects template" do
    get :angular

    assert_response :success
    assert_template 'projects/projects'
  end

  test 'artist project level has sharing meta tags' do
    channel = 'fake-channel'
    get :show, key: :artist, channel_id: channel, share: true

    assert_response :success
    assert_sharing_meta_tags(
      url: "http://test.host/projects/artist/#{channel}",
      image: 'http://test.host/assets/sharing_drawing.png',
      image_width: 500,
      image_height: 261
    )
  end

  test 'applab project level has sharing meta tags' do
    channel = 'fake-channel'
    get :show, key: :applab, channel_id: channel, share: true

    assert_response :success
    assert_sharing_meta_tags(
      url: "http://test.host/projects/applab/#{channel}",
      image: 'http://test.host/assets/sharing_drawing.png',
      image_width: 400,
      image_height: 400,
      apple_mobile_web_app: true
    )
  end

  test 'playlab project level has sharing meta tags' do
    channel = 'fake-channel'
    get :show, key: :playlab, channel_id: channel, share: true

    assert_response :success
    assert_sharing_meta_tags(
      url: "http://test.host/projects/playlab/#{channel}",
      image: 'http://test.host/assets/sharing_drawing.png',
      image_width: 400,
      image_height: 400,
      apple_mobile_web_app: true
    )
  end
end
