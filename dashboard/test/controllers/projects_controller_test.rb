require 'webmock/minitest'
require 'test_helper'

class ProjectsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  # Sign in, and stub request.user_id to return the signed in user's id
  def sign_in_with_request(user)
    sign_in user
    ActionDispatch::TestRequest.any_instance.stubs(:user_id).returns(user.id)
  end

  setup do
    sign_in_with_request create :user
  end

  self.use_transactional_test_case = true

  setup_all do
    @driver = create :user
    @navigator = create :user
    @section = create :section
    @section.add_student @driver
    @section.add_student @navigator
  end

  test "index" do
    get :index
    assert_response :success
  end

  test "index/libraries" do
    get :index, params: {tab_name: 'libraries'}
    assert_response :success
  end

  test "index/public" do
    get :index, params: {tab_name: 'public'}
    assert_response :success
  end

  test "index: redirect to public tab if no user" do
    sign_out :user

    get :index
    assert_redirected_to '/projects/public'

    get :index, params: {tab_name: 'libraries'}
    assert_redirected_to '/projects/public'

    # Don't redirect if we're already on /projects/public
    get :index, params: {tab_name: 'public'}
    assert_response :success
  end

  test "index: redirect to '/' if user is admin" do
    sign_in create(:admin)

    get :index
    assert_redirected_to '/'

    get :index, params: {tab_name: 'libraries'}
    assert_redirected_to '/'

    # Don't redirect if we're already on /projects/public
    get :index, params: {tab_name: 'public'}
    assert_response :success
  end

  test 'artist project level has sharing meta tags' do
    channel = 'fake-channel'
    get :show, params: {key: 'artist', channel_id: channel, share: true}

    assert_response :success
    assert_sharing_meta_tags(
      url: "http://test.host/projects/artist/#{channel}",
      image: 'http://test.host/assets/sharing_drawing.png',
      image_width: 400,
      image_height: 400,
      small_thumbnail: true
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

  test 'applab and gamelab edit gets redirected if under 13' do
    sign_in_with_request create(:young_student)

    %w(applab gamelab).each do |lab|
      get :edit, params: {key: lab, channel_id: 'my_channel_id'}

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab remix gets redirected if under 13' do
    sign_in_with_request create(:young_student)

    %w(applab gamelab).each do |lab|
      get :remix, params: {key: lab, channel_id: 'my_channel_id'}

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab project level gets redirected if under 13' do
    sign_in_with_request create(:young_student)

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab project level gets redirected to edit if over 13' do
    sign_in_with_request create(:student)

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert @response.headers['Location'].ends_with? '/edit'
    end
  end

  test 'applab and gamelab project levels gets redirected to edit if under 13 with tos teacher' do
    sign_in_with_request create(:young_student_with_tos_teacher)

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert @response.headers['Location'].ends_with? '/edit'
    end
  end

  test 'applab and gamelab project levels get redirected if under 13 with over 13 pair' do
    @driver.update(age: 10)
    @navigator.update(age: 18)
    sign_in_with_request @driver
    @controller.send :pairings=, {pairings: [@navigator], section_id: @section.id}

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab project levels get redirected if over 13 with under 13 pair' do
    @driver.update(age: 18)
    @navigator.update(age: 10)
    sign_in_with_request @driver
    @controller.send :pairings=, {pairings: [@navigator], section_id: @section.id}

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert_redirected_to '/'
    end
  end

  test 'applab and gamelab project levels gets redirected to edit if over 13 with under 13 with tos teacher pair' do
    @driver.update(age: 18)
    @navigator.update(age: 10)
    create :follower, user: (create :terms_of_service_teacher), student_user: @navigator
    sign_in_with_request @driver
    @controller.send :pairings=, {pairings: [@navigator], section_id: @section.id}

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}

      assert @response.headers['Location'].ends_with? '/edit'
    end
  end

  test 'shared applab project does not get redirected if under 13' do
    sign_in_with_request create(:young_student)

    get :show, params: {key: 'applab', share: true, channel_id: 'my_channel_id'}

    assert_response :success
  end

  test 'shared applab project does not get redirected if over 13' do
    sign_in_with_request create(:student)

    # We can't make successful requests for both applab and gamelab within the
    # same test case, or we'll get an error about view_options already being
    # frozen.

    get :show, params: {key: 'applab', share: true, channel_id: 'my_channel_id'}

    assert_response :success
  end

  test 'shared applab and gamelab project level gets redirected to edit if under 13 with tos teacher' do
    sign_in_with_request create(:young_student_with_tos_teacher)

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
    sign_in_with_request create(:admin)

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
    sign_in_with_request create(:teacher)
    get :load, params: {key: 'applab'}
    assert @response.headers['Location'].ends_with? '/edit'
  end

  test 'applab project level goes to edit if student without admin teacher' do
    sign_in_with_request create(:student)
    get :load, params: {key: 'applab'}
    assert @response.headers['Location'].ends_with? '/edit'
  end

  test 'gamelab project level redirects to login if not signed in' do
    sign_out :user
    get :load, params: {key: 'gamelab'}
    assert_redirected_to_sign_in
  end

  test 'project validators can go to /featured' do
    @project_validator = create :teacher
    @project_validator.permission = UserPermission::PROJECT_VALIDATOR
    sign_in @project_validator
    get :featured
    assert_response :success
  end

  test '/featured gets redirected to /public if not project validator' do
    get :featured
    assert_redirected_to '/projects/public'
  end

  test '/featured get redirected to sign in if signed out' do
    sign_out :user
    get :featured
    assert_redirected_to '/users/sign_in'
  end

  test '/applab/new creates a channel and redirects to /applab/<channel>/edit' do
    get :create_new, params: {key: 'applab'}
    assert_response :redirect
    assert @response.headers['Location'].ends_with? '/edit'
  end

  test '/applab/new with enableMaker param preserves param in redirect' do
    get :create_new, params: {key: 'applab', enableMaker: 'true'}
    assert_response :redirect
    assert @response.headers['Location'].ends_with? '/edit?enableMaker=true'
  end
end
