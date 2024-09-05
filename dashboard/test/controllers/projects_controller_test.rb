require 'test_helper'
require 'webmock/minitest'

class ProjectsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  # Sign in, and stub request.user_id to return the signed in user's id
  def sign_in_with_request(user)
    sign_in user
    ActionDispatch::TestRequest.any_instance.stubs(:user_id).returns(user.id)
  end

  setup do
    sign_in_with_request create :user
    Geocoder.stubs(:search).returns([OpenStruct.new(country_code: 'US')])
    AzureTextToSpeech.stubs(:get_voices).returns({})
  end

  self.use_transactional_test_case = true

  setup_all do
    # Create placeholder levels for the standalone project pages.
    # Note that all this does is create blank levels with appropriate names; it
    # doesn't set them up as actual project template levels, much less give
    # them specific content.
    ProjectsController::STANDALONE_PROJECTS.each do |type, config|
      next if Level.exists?(name: config[:name])
      factory = FactoryBot.factories.registered?(type) ? type : :level
      create(factory, name: config[:name])
    end

    @driver = create :user
    @navigator = create :user
    @section = create :section
    @section.add_student @driver
    @section.add_student @navigator
  end

  teardown do
    AzureTextToSpeech.unstub(:get_voices)
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

  test "index: redirect admins to root" do
    sign_in create(:admin)

    get :index
    assert_redirected_to root_path

    get :index, params: {tab_name: 'libraries'}
    assert_redirected_to root_path

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
      image_url: "https://test-studio.code.org/v3/files/#{channel}/.metadata/thumbnail.png",
      image_width: 400,
      image_height: 400,
      small_thumbnail: true
    )
  end

  test 'spritelab project level has sharing meta tags' do
    spritelab_level = Level.where(name: ProjectsController::STANDALONE_PROJECTS[:spritelab][:name])
    # populate level with correct game
    spritelab_level.update(game: Game.create(app: Game::SPRITELAB))

    channel = 'fake-channel'
    get :show, params: {key: 'spritelab', channel_id: channel, share: true}

    assert_response :success
    assert_sharing_meta_tags(
      url: "http://test.host/projects/spritelab/#{channel}",
      image_url: "https://test-studio.code.org/v3/files/#{channel}/.metadata/thumbnail.png",
      image_width: 400,
      image_height: 400
    )
  end

  test 'poetry_hoc project level has sharing meta tags' do
    poetry_hoc_level = Level.where(name: ProjectsController::STANDALONE_PROJECTS[:poetry_hoc][:name])
    # populate level with correct game
    poetry_hoc_level.update(game: Game.create(app: Game::POETRY))

    channel = 'fake-channel'
    get :show, params: {key: 'poetry_hoc', channel_id: channel, share: true}

    assert_response :success
    assert_sharing_meta_tags(
      url: "http://test.host/projects/poetry_hoc/#{channel}",
      image_url: "https://test-studio.code.org/v3/files/#{channel}/.metadata/thumbnail.png",
      image_width: 400,
      image_height: 400
    )
  end

  test 'applab project level has sharing meta tags' do
    applab_level = Level.where(name: ProjectsController::STANDALONE_PROJECTS[:applab][:name])
    # populate level with correct game
    applab_level.update(game: Game.create(app: Game::APPLAB))
    channel = 'fake-channel'

    ProjectsController.view_context_class.any_instance.stubs(:meta_image_url).returns('http://test.host/assets/applab_sharing_drawing.png')

    get :show, params: {key: 'applab', channel_id: channel, share: true}

    assert_response :success

    assert_sharing_meta_tags(
      url: "http://test.host/projects/applab/#{channel}",
      image_url: 'http://test.host/assets/applab_sharing_drawing.png',
      image_width: 400,
      image_height: 400,
      apple_mobile_web_app: true
    )
  end

  test 'playlab project level has sharing meta tags' do
    playlab_level = Level.where(name: ProjectsController::STANDALONE_PROJECTS[:playlab][:name])
    # populate level with correct game
    playlab_level.update(game: Game.create(app: Game::PLAYLAB))

    channel = 'fake-channel'

    ProjectsController.view_context_class.any_instance.stubs(:meta_image_url).returns('http://test.host/assets/studio_sharing_drawing.png')

    get :show, params: {key: 'playlab', channel_id: channel, share: true}

    assert_response :success

    assert_sharing_meta_tags(
      url: "http://test.host/projects/playlab/#{channel}",
      image_url: 'http://test.host/assets/studio_sharing_drawing.png',
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
    assert_includes(@response.body, '"send_to_phone_url":"http://test.host/sms/send"')
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
    assert_redirected_to root_path

    %w(applab gamelab).each do |lab|
      get :load, params: {key: lab}
      assert_redirected_to root_path
    end

    %w(applab gamelab).each do |lab|
      get :show, params: {key: lab, share: true, channel_id: 'fake_channel_id'}
      assert_redirected_to root_path
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

  test 'get_or_create_for_level without script creates new channel if none exists' do
    level = create(:level, :blockly)
    get :get_or_create_for_level, params: {level_id: level.id}
    assert_response :success
    refute_nil @response.body['channel']
  end

  test 'get_or_create_for_level without script returns existing channel' do
    level = create(:level, :blockly)
    get :get_or_create_for_level, params: {level_id: level.id}
    assert_response :success
    channel_id = @response.body['channel']
    refute_nil channel_id

    get :get_or_create_for_level, params: {level_id: level.id}
    assert_response :success
    assert_equal channel_id, @response.body['channel']
  end

  test 'get_or_create_for_level with script creates new channel if none exists' do
    script = create(:script)
    level = create(:level, :blockly)
    create(:script_level, script: script, levels: [level])
    get :get_or_create_for_level, params: {script_id: script.id, level_id: level.id}
    assert_response :success
    refute_nil @response.body['channel']
  end

  test 'get_or_create_for_level with script restricts usage for young students in app lab' do
    sign_in_with_request create(:young_student)
    script = create(:script)
    level = create(:applab)
    create(:script_level, script: script, levels: [level])
    get :get_or_create_for_level, params: {script_id: script.id, level_id: level.id}
    assert_response :forbidden
  end

  test 'get_or_create_for_level with script allows usage for young students with tos teacher in app lab' do
    sign_in_with_request create(:young_student_with_tos_teacher)
    script = create(:script)
    level = create(:applab)
    create(:script_level, script: script, levels: [level])
    get :get_or_create_for_level, params: {script_id: script.id, level_id: level.id}
    assert_response :success
    refute_nil @response.body['channel']
  end

  test 'get_or_create_for_level with user returns forbiddden if not teacher of student' do
    student = create :user
    script = create(:script)
    level = create(:level, :blockly)
    create(:script_level, script: script, levels: [level])
    get :get_or_create_for_level, params: {script_id: script.id, level_id: level.id, user_id: student.id}
    assert_response :forbidden
  end

  test 'get_or_create_for_level with user returns not started if student has not started' do
    teacher = create(:teacher)
    section = create(:section, user: teacher, login_type: 'word')
    student = create :user
    create(:follower, section: section, student_user: student)
    sign_in teacher

    script = create(:script)
    level = create(:level, :blockly)
    create(:script_level, script: script, levels: [level])
    get :get_or_create_for_level, params: {script_id: script.id, level_id: level.id, user_id: student.id}
    assert_response :success
    body = JSON.parse(@response.body)
    assert_equal body['started'], false
  end

  test 'get_or_create_for_level with user returns channel' do
    teacher = create(:teacher)
    section = create(:section, user: teacher, login_type: 'word')
    student = create :user
    create(:follower, section: section, student_user: student)

    # The student should do some work.
    sign_in_with_request(student)
    script = create(:script)
    level = create(:level, :blockly)
    create(:script_level, script: script, levels: [level])
    create :user_level, level: level, user: student, script: script
    get :get_or_create_for_level, params: {script_id: script.id, level_id: level.id}
    assert_response :success
    refute_nil @response.body['channel']
    sign_out student

    # Now that the channel has been created, check that the teacher can retrieve it for their student.
    sign_in teacher
    get :get_or_create_for_level, params: {script_id: script.id, level_id: level.id, user_id: student.id}
    assert_response :success
    refute_nil @response.body['channel']
  end

  test 'get_or_create_for_level with user uses script level ID if provided' do
    teacher = create(:teacher)
    section = create(:section, user: teacher, login_type: 'word')
    student = create :user
    other_student = create :user
    create(:follower, section: section, student_user: student)
    sign_in teacher

    script = create(:script)
    sublevel = create(:level, :blockly)
    parent_level = create(:bubble_choice_level, sublevels: [sublevel])
    script_level = create(:script_level, script: script, levels: [parent_level])

    # Teacher should be able to get the channel for the given sublevel for the student.
    get :get_or_create_for_level, params: {script_id: script.id, level_id: sublevel.id, script_level_id: script_level.id, user_id: student.id}
    assert_response :success

    # Teacher should be able to get the channel for the parent level for the student since it matches the script level ID.
    get :get_or_create_for_level, params: {script_id: script.id, level_id: parent_level.id, script_level_id: script_level.id, user_id: student.id}
    assert_response :success

    # Teacher should not be able to get the channel for the given sublevel for a student not in their section.
    get :get_or_create_for_level, params: {script_id: script.id, level_id: sublevel.id, script_level_id: script_level.id, user_id: other_student.id}
    assert_response :forbidden
  end

  test 'get_or_create_for_level with user returns forbidden if script level ID does not match level ID' do
    teacher = create(:teacher)
    section = create(:section, user: teacher, login_type: 'word')
    student = create :user
    create(:follower, section: section, student_user: student)
    sign_in teacher

    script = create(:script)
    sublevel = create(:level, :blockly)
    other_level = create(:level, :blockly)
    script_level = create(:script_level, script: script, levels: [other_level])

    # Teacher should not be able to get the channel for the given sublevel since the provided level ID does not match the script level ID.
    get :get_or_create_for_level, params: {script_id: script.id, level_id: sublevel.id, script_level_id: script_level.id, user_id: student.id}
    assert_response :forbidden
  end

  test 'on lab2 levels navigating to /view redirects to /edit if user is project owner' do
    channel_id = '12345'
    Projects.any_instance.stubs(:get).returns({isOwner: true})

    get :show, params: {path: "/projects/music/#{channel_id}/view", key: 'music', channel_id: channel_id, readonly: true}
    assert_response :redirect
    assert_redirected_to "/projects/music/#{channel_id}/edit"
  end

  test 'on lab2 levels navigating to /edit redirects to /view if user is not project owner' do
    channel_id = '12345'
    Projects.any_instance.stubs(:get).returns({isOwner: false})

    get :edit, params: {path: "/projects/music/#{channel_id}/edit", key: 'music', channel_id: channel_id}
    assert_response :redirect
    assert_redirected_to "/projects/music/#{channel_id}/view"
  end

  test 'on lab2 levels navigating to /edit redirects to /view if project is frozen' do
    channel_id = '12345'
    Projects.any_instance.stubs(:get).returns({isFrozen: true})

    get :edit, params: {path: "/projects/music/#{channel_id}/edit", key: 'music', channel_id: channel_id}
    assert_response :redirect
    assert_redirected_to "/projects/music/#{channel_id}/view"
  end
end
