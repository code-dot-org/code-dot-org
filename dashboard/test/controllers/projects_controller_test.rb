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

  test 'legacy /p/:key links redirect to /projects/:key' do
    get :redirect_legacy, key: ProjectsController::STANDALONE_PROJECTS[:artist][:name]
    assert_template 'projects/redirect_legacy'
  end

  test 'send to phone' do
    get :edit, key: :playlab, channel_id: 'my_channel_id'
    assert @response.body.include? '"send_to_phone_url":"http://test.host/sms/send"'
  end

  test 'applab project level gets redirected if under 13' do
    sign_in create(:young_student)

    get :load, key: :applab

    assert_redirected_to '/'
  end

  test 'applab project level gets redirected to edit if over 13' do
    sign_in create(:student)

    get :load, key: :applab

    assert @response.headers['Location'].ends_with? '/edit'
  end

  test 'shared applab project does get redirected if under 13' do
    sign_in create(:young_student)

    get :show, key: :applab, share: true, channel_id: 'my_channel_id'

    assert_redirected_to '/'
  end
end
