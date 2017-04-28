require 'test_helper'

class ProjectsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    # Workaround for 'undefined method `user_id` in ActionDispatch::TestRequest'
    ActionDispatch::TestRequest.any_instance.stubs(:user_id).returns(nil)
    sign_in create(:user)
  end

  self.use_transactional_test_case = true

  setup_all do
    @driver = create :user
    @navigator = create :user
    section = create :section
    section.add_student @driver
    section.add_student @navigator
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
    get :show, params: {key: 'artist', channel_id: channel, share: true}

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
    get :show, params: {key: 'applab', channel_id: channel, share: true}

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
    get :show, params: {key: 'playlab', channel_id: channel, share: true}

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
    get :redirect_legacy, params: {key: ProjectsController::STANDALONE_PROJECTS[:artist][:name]}
    assert_template 'projects/redirect_legacy'
  end

  test 'send to phone' do
    get :edit, params: {key: 'playlab', channel_id: 'my_channel_id'}
    assert @response.body.include? '"send_to_phone_url":"http://test.host/sms/send"'
  end

  test 'applab and gamelab project level gets redirected if under 13' do
    sign_in create(:young_student)

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab project level gets redirected to edit if over 13' do
    sign_in create(:student)

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert @response.headers['Location'].ends_with? '/edit'
    end
  end

  test 'applab and gamelab project levels gets redirected to edit if under 13 with tos teacher' do
    sign_in create(:young_student_with_tos_teacher)

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert @response.headers['Location'].ends_with? '/edit'
    end
  end

  test 'applab and gamelab project levels get redirected if under 13 with over 13 pair' do
    @driver.update(age: 10)
    @navigator.update(age: 18)
    sign_in @driver
    @controller.send :pairings=, [@navigator]

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab project levels get redirected if over 13 with under 13 pair' do
    @driver.update(age: 18)
    @navigator.update(age: 10)
    sign_in @driver
    @controller.send :pairings=, [@navigator]

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab project levels gets redirected to edit if over 13 with under 13 with tos teacher pair' do
    @driver.update(age: 18)
    @navigator.update(age: 10)
    create :follower, user: (create :terms_of_service_teacher), student_user: @navigator
    sign_in @driver
    @controller.send :pairings=, [@navigator]

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert @response.headers['Location'].ends_with? '/edit'
    end
  end

  test 'shared applab and gamelab project does get redirected if under 13' do
    sign_in create(:young_student)

    %w(applab gamelab).each do |lab|
      get :show, params: {key: lab, share: true, channel_id: 'my_channel_id'}

      assert_redirected_to '/'
    end
  end

  test 'shared applab and gamelab project level gets redirected to edit if under 13 with tos teacher' do
    sign_in create(:young_student_with_tos_teacher)

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert @response.headers['Location'].ends_with? '/edit'
    end
  end

  test 'applab and gamelab project level redirects to login if not signed in' do
    sign_out :user
    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}
      assert_redirected_to_sign_in
    end
  end

  test 'admins get redirected away' do
    sign_in create(:admin)

    get :index
    assert_redirected_to '/'

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}
      assert_redirected_to '/'
    end

    %w(applab gamelab).each do |lab|
      get :show, params: {key: lab, share: true, channel_id: 'fake_channel_id'}
      assert_redirected_to '/'
    end
  end

  test 'applab project level goes to edit if teacher' do
    sign_in create(:teacher)
    get :load, params: {key: 'applab'}
    assert @response.headers['Location'].ends_with? '/edit'
  end

  test 'applab project level goes to edit if student without admin teacher' do
    sign_in create(:student)
    get :load, params: {key: 'applab'}
    assert @response.headers['Location'].ends_with? '/edit'
  end

  test 'gamelab project level redirects to login if not signed in' do
    sign_out :user
    get :load, params: {key: 'gamelab'}
    assert_redirected_to_sign_in
  end
end
