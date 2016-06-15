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

  test 'applab and gamelab project level gets redirected if under 13' do
    sign_in create(:young_student)

    [:applab, :gamelab].each do |lab|
      get :load, key: lab

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab project level gets redirected to edit if over 13' do
    sign_in create(:student)

    [:applab, :gamelab].each do |lab|
      get :load, key: lab

      assert @response.headers['Location'].ends_with? '/edit'
    end
  end

  test 'shared applab and gamelab project does get redirected if under 13' do
    sign_in create(:young_student)

    [:applab, :gamelab].each do |lab|
      get :show, key: lab, share: true, channel_id: 'my_channel_id'

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab project level redirects to login if not signed in' do
    sign_out :user
    [:applab, :gamelab].each do |lab|
      get :load, key: lab
      assert_redirected_to_sign_in
    end
  end

  test 'applab project level goes to edit if admin' do
    sign_in create(:admin)
    get :load, key: :applab
    assert @response.headers['Location'].ends_with? '/edit'
  end

  test 'applab project level goes to edit if teacher' do
    sign_in create(:teacher)
    get :load, key: :applab
    assert @response.headers['Location'].ends_with? '/edit'
  end

  test 'applab project level goes to edit if student of admin teacher' do
    sign_in create(:student_of_admin)
    get :load, key: :applab
    assert @response.headers['Location'].ends_with? '/edit'
  end

  test 'applab project level goes to edit if student without admin teacher' do
    sign_in create(:student)
    get :load, key: :applab
    assert @response.headers['Location'].ends_with? '/edit'
  end

  test 'gamelab project level redirects to login if not signed in' do
    sign_out :user
    get :load, key: :gamelab
    assert_redirected_to_sign_in
  end

  test 'gamelab project level goes to edit if admin' do
    sign_in create(:admin)
    get :load, key: :gamelab
    assert @response.headers['Location'].ends_with? '/edit'
  end
end
