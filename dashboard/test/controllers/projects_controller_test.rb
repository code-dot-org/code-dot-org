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
    get :edit, key: :artist

    assert_response :success
    assert_sharing_meta_tags(
      url: 'http://test.host/projects/artist',
      image: 'http://test.host/assets/sharing_drawing.png',
      image_width: 500,
      image_height: 261
    )
  end

  test 'applab project level has sharing meta tags' do
    get :edit, key: :applab

    assert_response :success
    assert_sharing_meta_tags(
      url: 'http://test.host/projects/applab',
      image: 'http://test.host/assets/sharing_drawing.png',
      image_width: 400,
      image_height: 400,
      apple_mobile_web_app: true
    )
  end

  test 'playlab project level has sharing meta tags' do
    get :edit, key: :playlab

    assert_response :success
    assert_sharing_meta_tags(
      url: 'http://test.host/projects/playlab',
      image: 'http://test.host/assets/sharing_drawing.png',
      image_width: 400,
      image_height: 400,
      apple_mobile_web_app: true
    )
  end

  test 'send to phone' do
    get :edit, key: :playlab
    assert @response.body.include? '"send_to_phone_url":"http://test.host/sms/send"'
  end

  test 'applab project level gets redirected if under 13' do
    sign_in create(:young_student)

    get :edit, key: :applab

    assert_redirected_to '/'
  end

  test 'applab project level doesnt get redirected if over 13' do
    sign_in create(:student)

    get :edit, key: :applab

    assert_response :success
  end

  test 'shared applab project does not get redirected if under 13' do
    sign_in create(:young_student)

    get :show, key: :applab, share: true, channel_id: 'my_channel_id'

    assert_response :success
  end
end
