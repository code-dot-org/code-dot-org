# -*- coding: utf-8 -*-
require 'test_helper'

class ActivitiesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers
  include LevelsHelper
  include UsersHelper

  # A fake queue implementation that captures each message sent and sends it to the handler
  # only when requested by the test.
  class FakeQueue
    def initialize(handler)
      @handler = handler
      @messages = []
    end

    def enqueue(message_body)
      @messages << message_body
    end

    def handle_pending_messages
      @handler.handle(@messages.map {|body| SQS::Message.new(body)})
      @messages.clear
    end
  end

  setup do
    client_state.reset
    Gatekeeper.clear

    # rubocop:disable Lint/Void
    LevelSourceImage # make sure this is loaded before we mess around with mocking S3...
    # rubocop:enable Lint/Void
    CDO.disable_s3_image_uploads = true # make sure image uploads are disabled unless specified in individual tests

    Geocoder.stubs(:find_potential_street_address).returns(nil) # don't actually call geocoder service

    @user = create(:user, total_lines: 15)
    sign_in(@user)

    @activity = create(:activity, user: @user)

    @admin = create(:admin)

    script_levels = Script.twenty_hour_script.script_levels
    @script_level_prev = script_levels[0]
    @script_level = @script_level_prev.next_progression_level
    @script_level_next = @script_level.next_progression_level
    @script = @script_level.script
    @level = @script_level.level

    @blank_image = File.read('test/fixtures/artist_image_blank.png', binmode: true)
    @good_image = File.read('test/fixtures/artist_image_1.png', binmode: true)
    @another_good_image = File.read('test/fixtures/artist_image_2.png', binmode: true)
    @jpg_image = File.read('test/fixtures/playlab_image.jpg', binmode: true)
    @milestone_params = {
      user_id: @user,
      script_level_id: @script_level.id,
      lines: 20,
      attempt: '1',
      result: 'true',
      testResult: '100',
      time: '1000',
      app: 'test',
      program: '<hey>'
    }

    # Stub out the SQS client to invoke the handler on queued messages only when requested.
    @fake_queue = FakeQueue.new(AsyncProgressHandler.new)
    AsyncProgressHandler.stubs(:progress_queue).returns(@fake_queue)
  end

  # Ignore any additional keys in 'actual' not found in 'expected'.
  # This allows additional keys to be added to the controller response
  # without having to update all existing test contracts.
  def assert_equal_expected_keys(expected, actual)
    expected.each do |key, value|
      # As we receive a warning that this will fail in MT6, though ugly, we gate
      # the assertion on whether the expected value is nil.
      if value.nil?
        assert_nil actual.with_indifferent_access[key], "for key #{key}"
      else
        assert_equal value, actual.with_indifferent_access[key], "for key #{key}"
      end
    end
  end

  def studio_program_with_text(text)
    '<xml><block type="when_run" deletable="false"><next><block type="studio_showTitleScreen"><title name="TITLE">' +
        text +
        '</title><title name="TEXT">type text here</title></block></next></block>'
  end

  def build_expected_response(options = {})
    {
      total_lines: 35,
      redirect: build_script_level_path(@script_level_next),
    }.merge options
  end

  def build_try_again_response(options = {})
    {
      message: 'try again',
      level_source: "http://test.host/c/#{assigns(:level_source).id}",
    }.merge options
  end

  test "logged in milestone" do
    _test_logged_in_milestone(async_activity_writes: false)
  end

  test "logged in milestone with async activity writes" do
    _test_logged_in_milestone(async_activity_writes: true)
  end

  def _test_logged_in_milestone(async_activity_writes:)
    # Configure a fake slogger to verify that the correct data is logged.
    slogger = FakeSlogger.new
    CDO.set_slogger_for_test(slogger)

    Gatekeeper.set('async_activity_writes', value: async_activity_writes)

    # do all the logging
    @controller.expects :log_milestone

    assert_creates(LevelSource, Activity, UserLevel, UserScript) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, params: @milestone_params
          @fake_queue.handle_pending_messages if async_activity_writes
        end
      end
    end
    assert_response :success

    expected_response = build_expected_response(level_source: "http://test.host/c/#{assigns(:level_source).id}")
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    # created a user script
    user_script = UserScript.last
    assert_equal @script_level.script, user_script.script
    assert_equal @user, user_script.user
    assert user_script.started_at
    assert_equal user_script.started_at, user_script.last_progress_at
    assert user_script.assigned_at.nil?
    assert user_script.completed_at.nil?

    # created activity and userlevel with the correct script
    assert_equal @script_level.script, UserLevel.last.script

    assert_equal(
      [{
        application: :dashboard,
        tag: 'activity_finish',
        script_level_id: @script_level.id,
        level_id: @script_level.level.id,
        user_agent: 'Rails Testing',
        locale: :'en-US'
      }],
      slogger.records
    )
  end

  test "successful milestone does not require script_level_id" do
    params = @milestone_params
    params.delete(:script_level_id)
    params[:level_id] = @script_level.level.id
    params[:result] = 'true'

    post :milestone, params: params
    assert_response :success
  end

  test "unsuccessful milestone does not require script_level_id" do
    params = @milestone_params
    params.delete(:script_level_id)
    params[:level_id] = @script_level.level.id
    params[:result] = 'false'

    post :milestone, params: params
    assert_response :success
  end

  test "milestone creates userlevel with specified level when scriptlevel has multiple levels" do
    params = @milestone_params
    level1 = create :maze, name: 'level 1'
    level2 = create :maze, name: 'level 2'
    script_level = create :script_level, levels: [level1, level2]
    params[:script_level_id] = script_level.id
    params[:level_id] = level1.id
    params[:result] = 'true'

    post :milestone, params: params

    assert_equal level1, UserLevel.last.level
  end

  test "milestone creates userlevel with specified level when scriptlevel has multiple levels for second level" do
    params = @milestone_params
    level1 = create :maze, name: 'level 1'
    level2 = create :maze, name: 'level 2'
    script_level = create :script_level, levels: [level1, level2]
    params[:script_level_id] = script_level.id
    params[:level_id] = level2.id
    params[:result] = 'true'

    post :milestone, params: params

    assert_equal level2, UserLevel.last.level
  end

  test "logged in milestone with existing userlevel with script" do
    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    UserScript.create(user: @user, script: @script_level.script)
    UserLevel.create(level: @script_level.level, user: @user, script: @script_level.script)

    assert_creates(LevelSource, Activity) do
      assert_does_not_create(GalleryActivity, UserLevel, UserScript) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, params: @milestone_params
        end
      end
    end

    assert_response :success
  end

  test "logged in milestone with too large program does not crash" do
    # the column that we store the program is 20000 bytes, don't crash if we fail to save because the field is too large

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    assert_creates(Activity, UserLevel, UserScript) do
      assert_does_not_create(GalleryActivity, LevelSource) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, params: @milestone_params.merge(program: "<hey>" * 10000)
        end
      end
    end

    assert_response :success
    assert_equal_expected_keys build_expected_response, JSON.parse(@response.body)

    # created a user script
    user_script = UserScript.last
    assert_equal @script_level.script, user_script.script
    assert_equal @user, user_script.user
    assert user_script.started_at
    assert_equal user_script.started_at, user_script.last_progress_at
    assert user_script.assigned_at.nil?
    assert user_script.completed_at.nil?

    # created activity and userleve with the correct script
    assert_equal @script_level.script, UserLevel.last.script
  end

  test "logged in milestone with panda does not crash" do
    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    assert_creates(Activity, UserLevel, UserScript, LevelSource) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, params: @milestone_params.merge(program: "<hey>#{panda_panda}</hey>")
        end
      end
    end

    assert_response :success
    assert_equal_expected_keys build_expected_response, JSON.parse(@response.body)
  end

  # Expect the controller to invoke "milestone_logger.info()" with a
  # string that matches given regular expression.
  def expect_controller_logs_milestone_regexp(regexp)
    @controller.send(:milestone_logger).expects(:info).with do |log_string|
      log_string !~ regexp
    end
  end

  test "logged in milestone does not allow negative lines of code" do
    expect_controller_logs_milestone_regexp(/-20/)
    @controller.expects :slog

    assert_creates(LevelSource, Activity, UserLevel, UserScript) do
      assert_does_not_create(GalleryActivity) do
        assert_no_difference('@user.reload.total_lines') do # update total lines
          post :milestone, params: @milestone_params.merge(lines: -20)
        end
      end
    end

    # pretend it succeeded
    assert_response :success

    expected_response = build_expected_response(
      total_lines: 15, # No change
      level_source: "http://test.host/c/#{assigns(:level_source).id}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    # activity does not have unreasonable lines of code either
    assert_equal 0, Activity.last.lines
  end

  test "logged in milestone does not allow unreasonably high lines of code" do
    expect_controller_logs_milestone_regexp(/9999999/)

    @controller.expects :slog

    assert_creates(LevelSource, Activity, UserLevel, UserScript) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 1000) do # update total lines
          post :milestone, params: @milestone_params.merge(lines: 9_999_999)
        end
      end
    end

    # pretend it succeeded
    assert_response :success

    expected_response = build_expected_response(
      total_lines: 1015, # Pretend it was 1000
      level_source: "http://test.host/c/#{assigns(:level_source).id}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    # activity does not have unreasonable lines of code either
    assert_equal 1000, Activity.last.lines
  end

  test "logged in milestone with messed up email" do
    # use update_attribute to bypass validations
    @user.update_attribute(:email, '')
    @user.update_attribute(:hashed_email, '')

    test_logged_in_milestone
  end

  test "logged in milestone should save to gallery when passing an impressive level" do
    _test_logged_in_milestone_should_save_gallery_when_passing_an_impressive_level(
      async_activity_writes: false
    )
  end

  test "logged in milestone should save to gallery when passing an impressive level with aysnc writes" do
    _test_logged_in_milestone_should_save_gallery_when_passing_an_impressive_level(
      async_activity_writes: true
    )
  end

  def _test_logged_in_milestone_should_save_gallery_when_passing_an_impressive_level(async_activity_writes:)
    Gatekeeper.set('async_activity_writes', value: async_activity_writes)

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    expect_s3_upload

    assert_creates(LevelSource, Activity, UserLevel, GalleryActivity, LevelSourceImage) do
      assert_difference('@user.reload.total_lines', 20) do # update total lines
        post :milestone,
          params: @milestone_params.merge(
            save_to_gallery: 'true',
            image: Base64.encode64(@good_image)
          )
        @fake_queue.handle_pending_messages if async_activity_writes
      end
    end

    assert_response :success

    expected_response = build_expected_response(level_source: "http://test.host/c/#{assigns(:level_source).id}")
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    # created gallery activity and activity for user
    assert_equal @user, Activity.last.user
    assert_equal @user, GalleryActivity.last.user
    assert_equal UserLevel.last.id, GalleryActivity.last.user_level_id
    assert_equal LevelSource.last.id,  GalleryActivity.last.level_source_id
  end

  test "logged in milestone should save to gallery when passing an impressive level with a jpg image" do
    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    expect_s3_upload

    assert_creates(LevelSource, Activity, UserLevel, GalleryActivity, LevelSourceImage) do
      assert_difference('@user.reload.total_lines', 20) do # update total lines
        post :milestone,
          params: @milestone_params.merge(
            save_to_gallery: 'true',
            image: Base64.encode64(@jpg_image),
            image_type: 'jpg'
          )
      end
    end

    assert_response :success

    expected_response = build_expected_response(level_source: "http://test.host/c/#{assigns(:level_source).id}")
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    # created gallery activity and activity for user
    assert_equal @user, Activity.last.user
    assert_equal @user, GalleryActivity.last.user
  end

  test "logged in milestone should not save to gallery when passing a level with undefined impressiveness" do
    # insurance for weird things that happen in javascript.

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    assert_creates(LevelSource, Activity, UserLevel) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone,
            params: @milestone_params.merge(
              save_to_gallery: 'undefined',
              image: Base64.encode64(@good_image)
            )
        end
      end
    end

    assert_response :success

    expected_response = build_expected_response(level_source: "http://test.host/c/#{assigns(:level_source).id}")
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    assert_equal @user, Activity.last.user
  end

  test "logged in milestone should not save to gallery when passing a level with false impressiveness" do
    # insurance for weird things that happen in javascript.

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    assert_creates(LevelSource, Activity, UserLevel) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone,
            params: @milestone_params.merge(
              save_to_gallery: 'false',
              image: Base64.encode64(@good_image)
            )
        end
      end
    end

    assert_response :success

    expected_response = build_expected_response(level_source: "http://test.host/c/#{assigns(:level_source).id}")
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    assert_equal @user, Activity.last.user
  end

  test "logged in milestone not passing" do
    # do all the logging
    @controller.expects :log_milestone

    assert_creates(LevelSource, Activity, UserLevel) do
      assert_does_not_create(GalleryActivity) do
        assert_no_difference('@user.reload.total_lines') do # don't update total lines
          post :milestone,
            params: @milestone_params.merge(result: 'false', testResult: 10)
        end
      end
    end

    assert_response :success
    assert_equal_expected_keys build_try_again_response, JSON.parse(@response.body)
  end

  test "logged in milestone with image not passing" do
    # do all the logging
    @controller.expects :log_milestone

    assert_creates(LevelSource, Activity, UserLevel) do
      assert_does_not_create(GalleryActivity) do
        assert_no_difference('@user.reload.total_lines') do # don't update total lines
          post :milestone,
            params: @milestone_params.merge(
              result: 'false',
              testResult: 10,
              image: Base64.encode64(@good_image),
              save_to_gallery: 'true'
            )
        end
      end
    end

    # assert_equal @good_image.size, LevelSourceImage.last.image.size

    assert_response :success
    assert_equal_expected_keys build_try_again_response, JSON.parse(@response.body)
  end

  test "logged in milestone with image" do
    _test_logged_in_milestone_with_image(async_activity_writes: false)
  end

  test "logged in milestone with image and async writes" do
    _test_logged_in_milestone_with_image(async_activity_writes: true)
  end

  def _test_logged_in_milestone_with_image(async_activity_writes:)
    Gatekeeper.set('async_activity_writes', value: async_activity_writes)

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    expect_s3_upload

    original_activity_count = Activity.count
    original_user_level_count = UserLevel.count

    expected_created_classes = async_activity_writes ? [LevelSource, LevelSourceImage] :
        [LevelSource, UserLevel, LevelSourceImage]

    assert_creates(*expected_created_classes) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone,
            params: @milestone_params.merge(image: Base64.encode64(@good_image))
        end
      end
    end
    if async_activity_writes
      # Activity count etc. shouldn't have changed yet.
      assert_equal original_activity_count, Activity.count
      assert_nil UserLevel.where(
        user_id: @user,
        level_id: @script_level.level_id,
        script_id: @script_level.script_id
      ).first
      assert_equal original_user_level_count, UserLevel.count

      @fake_queue.handle_pending_messages
    end
    assert_equal original_activity_count + 1, Activity.count
    assert_equal original_user_level_count + 1, UserLevel.count
    assert_not_nil UserLevel.where(
      user_id: @user,
      level_id: @script_level.level_id,
      script_id: @script_level.script_id
    ).first
    assert_not_nil UserScript.where(user_id: @user, script_id: @script_level.script_id).first

    assert_response :success

    expected_response = build_expected_response(
      level_source: "http://test.host/c/#{assigns(:level_source).id}",
      save_to_gallery_url: "/gallery"\
        "?gallery_activity%5Blevel_source_id%5D=#{assigns(:level_source).id}"\
        "&gallery_activity%5Buser_level_id%5D=#{assigns(:user_level).try(:id)}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with existing level source and level source image" do
    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    program = "<whatever>"

    level_source = LevelSource.find_identical_or_create(@script_level.level, program)
    level_source_image = LevelSourceImage.find_or_create_by(level_source_id: level_source.id) do |ls|
      ls.image = @good_image
    end
    assert_equal @good_image.size, level_source_image.reload.image.size

    expect_no_s3_upload

    assert_creates(Activity, UserLevel) do
      assert_does_not_create(LevelSource) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone,
            params: @milestone_params.merge(
              program: program,
              image: Base64.encode64(@good_image)
            )
        end
      end
    end

    assert_equal @good_image.size, level_source_image.reload.image.size

    assert_response :success

    assert_equal level_source, assigns(:level_source)

    expected_response = build_expected_response(
      level_source: "http://test.host/c/#{assigns(:level_source).id}",
      save_to_gallery_url: "/gallery"\
        "?gallery_activity%5Blevel_source_id%5D=#{assigns(:level_source).id}"\
        "&gallery_activity%5Buser_level_id%5D=#{assigns(:user_level).try(:id)}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with existing level source and level source image does not update image if old image was blank" do
    program = "<whatever>"

    level_source = LevelSource.find_identical_or_create(@script_level.level, program)
    LevelSourceImage.find_or_create_by(level_source_id: level_source.id) do |ls|
      ls.image = @blank_image
    end

    expect_no_s3_upload

    assert_creates(Activity, UserLevel) do
      assert_does_not_create(LevelSource) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone,
            params: @milestone_params.merge(
              program: program,
              image: Base64.encode64(@good_image)
            )
        end
      end
    end

    assert_response :success

    assert_equal level_source, assigns(:level_source)

    expected_response = build_expected_response(
      level_source: "http://test.host/c/#{assigns(:level_source).id}",
      save_to_gallery_url: "/gallery"\
        "?gallery_activity%5Blevel_source_id%5D=#{assigns(:level_source).id}"\
        "&gallery_activity%5Buser_level_id%5D=#{assigns(:user_level).try(:id)}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with existing level source and level source image does not update image if new image is blank" do
    program = "<whatever>"

    level_source = LevelSource.find_identical_or_create(@script_level.level, program)
    level_source_image = LevelSourceImage.find_or_create_by(level_source_id: level_source.id) do |ls|
      ls.image = @good_image
    end

    expect_no_s3_upload

    assert_creates(Activity, UserLevel) do
      assert_does_not_create(LevelSource) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone,
            params: @milestone_params.merge(
              program: program,
              image: Base64.encode64(@blank_image)
            )
        end
      end
    end

    assert_equal @good_image.size, level_source_image.reload.image.size

    assert_response :success

    assert_equal level_source, assigns(:level_source)

    expected_response = build_expected_response(
      level_source: "http://test.host/c/#{assigns(:level_source).id}",
      save_to_gallery_url: "/gallery"\
        "?gallery_activity%5Blevel_source_id%5D=#{assigns(:level_source).id}"\
        "&gallery_activity%5Buser_level_id%5D=#{assigns(:user_level).try(:id)}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with existing level source and level source image does not update image if old image is good" do
    program = "<whatever>"

    level_source = LevelSource.find_identical_or_create(@script_level.level, program)
    level_source_image = LevelSourceImage.find_or_create_by(level_source_id: level_source.id) do |ls|
      ls.image = @good_image
    end

    expect_no_s3_upload

    assert_creates(Activity, UserLevel) do
      assert_does_not_create(LevelSource) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone,
            params: @milestone_params.merge(
              program: program,
              image: Base64.encode64(@another_good_image)
            )
        end
      end
    end

    assert_equal @good_image.size, level_source_image.reload.image.size

    assert_response :success

    assert_equal level_source, assigns(:level_source)

    expected_response = build_expected_response(
      level_source: "http://test.host/c/#{assigns(:level_source).id}",
      save_to_gallery_url: "/gallery"\
        "?gallery_activity%5Blevel_source_id%5D=#{assigns(:level_source).id}"\
        "&gallery_activity%5Buser_level_id%5D=#{assigns(:user_level).try(:id)}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with race condition when creating UserLevel" do
    # first_or_create does not prevent race conditions between
    # checking for an existing object and creating it -- we have a db
    # uniqueness constraint so the right thing in this case is to
    # catch that exception and just run it again (the second time we
    # will get the 'existing' object)

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    # some Mocha shenanigans to simulate throwing a duplicate entry
    # error and then succeeding by returning the existing userlevel

    user_level_finder = mock('user_level_finder')
    user_level_finder.stubs(:first).returns(nil)
    existing_user_level = UserLevel.create(user: @user, level: @script_level.level, script: @script_level.script)
    user_level_finder.stubs(:first_or_initialize).
      raises(ActiveRecord::RecordNotUnique.new(Mysql2::Error.new("Duplicate entry '1208682-37' for key 'index_user_levels_on_user_id_and_level_id'"))).
      then.
      returns(existing_user_level)

    UserLevel.stubs(:where).returns(user_level_finder)

    assert_creates(LevelSource, Activity) do
      assert_does_not_create(GalleryActivity, UserLevel) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, params: @milestone_params
        end
      end
    end

    assert_response :success

    expected_response = build_expected_response(level_source: "http://test.host/c/#{assigns(:level_source).id}")
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone race condition retrying code will not retry forever" do
    # simulate always throwing an exception on first_or_create (not
    # supposed to happen, but we shouldn't get stuck in a loop anyway)
    user_level_finder = mock('user_level_finder')
    user_level_finder.stubs(:first).returns(nil)
    user_level_finder.stubs(:first_or_initialize).
      raises(ActiveRecord::RecordNotUnique.new(Mysql2::Error.new("Duplicate entry '1208682-37' for key 'index_user_levels_on_user_id_and_level_id'")))

    UserLevel.stubs(:where).returns(user_level_finder)

    # we should just raise the exception
    assert_raises(ActiveRecord::RecordNotUnique) do
      post :milestone, params: @milestone_params
    end
  end

  test "logged in milestone with undefined submitted" do
    post :milestone, params: @milestone_params.merge(submitted: 'undefined')
    assert_response :success

    assert_equal false, UserLevel.where(user_id: @user.id, level: @level.id).first.submitted?
  end

  test "Milestone with milestone posts disabled returns 503 status" do
    Gatekeeper.set('postMilestone', where: {script_name: @script.name}, value: false)
    post :milestone, params: @milestone_params
    assert_response 503
  end

  test "anonymous milestone starting with empty session saves progress in section" do
    sign_out @user

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    assert_creates(LevelSource) do
      assert_does_not_create(Activity, UserLevel) do
        post :milestone, params: @milestone_params.merge(user_id: 0)
      end
    end

    assert_response :success

    expected_response = build_expected_response(
      total_lines: 0,
      level_source: "http://test.host/c/#{assigns(:level_source).id}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "anonymous milestone with existing session adds progress in session" do
    sign_out @user

    # set up existing session
    client_state.set_level_progress(@script_level_prev, 50)
    client_state.add_lines(10)

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    assert_creates(LevelSource) do
      assert_does_not_create(Activity, UserLevel) do
        post :milestone, params: @milestone_params.merge(user_id: 0)
      end
    end

    assert_response :success

    expected_response = build_expected_response(
      total_lines: 10,
      level_source: "http://test.host/c/#{assigns(:level_source).id}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "anonymous milestone not passing" do
    sign_out @user

    client_state.add_lines(10)

    # do all the logging
    @controller.expects :log_milestone

    assert_creates(LevelSource) do
      assert_does_not_create(Activity, UserLevel) do
        post :milestone,
          params: @milestone_params.merge(
            user_id: 0, result: "false",
            testResult: "0"
          )
      end
    end

    # record activity in session
    assert_equal 0, client_state.level_progress(@script_level)

    # lines in session does not change
    assert_equal 10, client_state.lines

    assert_response :success
    assert_equal_expected_keys build_try_again_response, JSON.parse(@response.body)
  end

  test "anonymous milestone with image saves image but does not save to gallery" do
    sign_out @user

    # set up existing session
    client_state.set_level_progress(@script_level_prev, 50)
    client_state.add_lines(10)

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    expect_s3_upload

    assert_creates(LevelSource, LevelSourceImage) do
      assert_does_not_create(Activity, UserLevel, GalleryActivity) do
        post :milestone,
          params: @milestone_params.merge(
            user_id: 0,
            save_to_gallery: 'true',
            image: Base64.encode64(@good_image)
          )
      end
    end

    assert_response :success

    expected_response = build_expected_response(
      total_lines: 10,
      level_source: "http://test.host/c/#{assigns(:level_source).id}"
    )
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "does not save image when s3 upload fails" do
    sign_out @user

    # set up existing session
    client_state.set_level_progress(@script_level_prev, 50)
    client_state.add_lines(10)

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    expect_s3_upload_failure

    assert_creates(LevelSource) do
      assert_does_not_create(Activity, UserLevel, GalleryActivity, LevelSourceImage) do
        post :milestone,
          params: @milestone_params.merge(
            user_id: 0,
            save_to_gallery: 'true',
            image: Base64.encode64(@good_image)
          )
      end
    end

    assert_nil assigns(:level_source_image)
  end

  test 'sharing program with swear word returns error' do
    # unless CDO.webpurify_key
    # stub webpurify
    WebPurify.stubs(:find_potential_profanity).returns true
    # end

    assert_does_not_create(LevelSource, GalleryActivity) do
      post :milestone, params: {
        user_id: @user.id,
        script_level_id: create(:script_level, :playlab).id,
        program: studio_program_with_text('shit')
      }
    end
    assert_response :success
    expected_response = {
      'level_source' => nil,
      'share_failure' => {
        'message' => "It looks like there is profanity in it. Try changing the text.",
          'type' => 'profanity'
      }
    }
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test 'sharing program with swear word in German rejects word' do
    # unless CDO.webpurify_key
    # stub webpurify
    WebPurify.stubs(:find_potential_profanity).returns true
    # end

    with_default_locale(:de) do
      assert_does_not_create(LevelSource, GalleryActivity) do
        post :milestone,
          params: @milestone_params.merge(
            script_level_id: create(:script_level, :playlab).id,
            program: studio_program_with_text('scheiße')
          )
      end
    end
    assert_response :success
    expected_response = {'level_source' => nil}
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test 'sharing program with http error slogs' do
    # allow sharing when there's an error, slog so it's possible to look up and review later

    WebPurify.stubs(:find_potential_profanity).raises(OpenURI::HTTPError.new('something broke', 'fake io'))
    @controller.expects(:slog).with(:tag, :error, :level_source_id) do |params|
      params[:tag] == 'share_checking_error' && params[:error] == 'OpenURI::HTTPError: something broke' && !params[:level_source_id].nil?
    end
    @controller.expects(:slog).with(:tag) {|params| params[:tag] == 'activity_finish'}

    assert_creates(LevelSource) do
      post :milestone,
        params: @milestone_params.merge(
          script_level_id: create(:script_level, :playlab).id,
          program: studio_program_with_text('shit')
        )
    end

    assert_response :success
  end

  test 'sharing program with IO::EAGAINWaitReadable error slogs' do
    WebPurify.stubs(:find_potential_profanity).raises(IO::EAGAINWaitReadable)
    # allow sharing when there's an error, slog so it's possible to look up and review later

    @controller.expects(:slog).with(:tag, :error, :level_source_id) do |params|
      params[:tag] == 'share_checking_error' && params[:error] == 'IO::EAGAINWaitReadable: Resource temporarily unavailable' && !params[:level_source_id].nil?
    end
    @controller.expects(:slog).with(:tag) {|params| params[:tag] == 'activity_finish'}

    assert_creates(LevelSource) do
      post :milestone,
        params: @milestone_params.merge(
          script_level_id: create(:script_level, :playlab).id,
          program: studio_program_with_text('shit')
        )
    end

    assert_response :success
  end

  test 'sharing program with swear word in Spanish rejects word' do
    # unless CDO.webpurify_key
    # stub webpurify
    WebPurify.stubs(:find_potential_profanity).returns true
    # end

    with_default_locale(:es) do
      assert_does_not_create(LevelSource, GalleryActivity) do
        post :milestone,
          params: @milestone_params.merge(
            script_level_id: create(:script_level, :playlab).id,
            program: studio_program_with_text('putamadre')
          )
      end
    end
    assert_response :success
    expected_response = {'level_source' => nil}
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test 'sharing program with phone number' do
    assert_does_not_create(LevelSource, GalleryActivity) do
      post :milestone,
        params: @milestone_params.merge(
          script_level_id: create(:script_level, :playlab).id,
          program: studio_program_with_text('800-555-5555')
        )
    end
    assert_response :success

    expected_response = {
      'level_source' => nil,
      'share_failure' => {
        'message' => "It looks like there is a phone number in it. Try changing the text.",
          'contents' => '800-555-5555',
          'type' => 'phone'
      }
    }
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test 'sharing when gatekeeper has disabled sharing does not work' do
    script_level = create(:script_level, :playlab)
    Gatekeeper.set('shareEnabled', where: {script_name: script_level.script.name}, value: false)

    post :milestone,
      params: @milestone_params.merge(
        script_level_id: script_level.id,
        program: studio_program_with_text('hey some text')
      )

    assert_response :success
    response = JSON.parse(@response.body)

    assert_nil response['share_failure']
    assert_nil response['level_source']
  end

  test 'sharing when gatekeeper has disabled sharing for some other script still works' do
    WebPurify.stubs(:find_potential_profanity).returns false
    Gatekeeper.set('shareEnabled', where: {script_name: 'Best script ever'}, value: false)

    post :milestone,
      params: @milestone_params.merge(
        script_level_id: create(:script_level, :playlab).id,
        program: studio_program_with_text('hey some text')
      )

    assert_response :success
    response = JSON.parse(@response.body)

    assert_nil response['share_failure']
    assert response['level_source'].match(/^http:\/\/test.host\/c\//)
  end

  test 'milestone changes to next stage in default script' do
    last_level_in_stage = @script_level.script.script_levels.reverse.find {|x| x.level.game.name == 'Artist'}
    post :milestone,
      params: @milestone_params.merge(script_level_id: last_level_in_stage.id)
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal({'previous' => {'name' => 'The Artist', 'position' => 5}}, response['stage_changing'])
  end

  test 'milestone changes to next stage in custom script' do
    ScriptLevel.class_variable_set(:@@script_level_map, nil)
    game = create(:game)
    (1..3).each {|n| create(:level, name: "Level #{n}", game: game)}
    script_dsl = ScriptDSL.parse(
      "stage 'Milestone Stage 1'; level 'Level 1'; level 'Level 2'; stage 'Milestone Stage 2'; level 'Level 3'",
      "a filename"
    )
    script = Script.add_script({name: 'Milestone Script'}, script_dsl[0][:stages])

    last_level_in_first_stage = script.stages.first.script_levels.last
    post :milestone,
      params: @milestone_params.merge(
        script_level_id: last_level_in_first_stage.id
      )
    assert_response :success
    response = JSON.parse(@response.body)

    # find localized test strings for custom stage names in script
    assert response.key?('stage_changing'), "No key 'stage_changing' in response #{response.inspect}"
    assert_equal('milestone-stage-1', response['stage_changing']['previous']['name'])
  end

  test 'milestone post respects level_id for active level' do
    script = create :script
    stage = create :stage, script: script
    level1a = create :maze, name: 'maze 1'
    level1b = create :maze, name: 'maze 1 new'
    script_level = create :script_level, script: script, stage: stage, levels: [level1a, level1b], properties: {'maze 1': {'active': false}}

    post :milestone,
      params: @milestone_params.merge(
        script_level_id: script_level.id,
        level_id: level1a.id
      )
    response = JSON.parse(@response.body)

    assert_equal response['level_id'], level1a.id
  end

  test 'New level completed response' do
    def new_level
      post :milestone, params: @milestone_params
      JSON.parse(@response.body)['new_level_completed']
    end

    assert_equal true, new_level
    assert_equal false, new_level

    sign_out @user
    assert_equal true, new_level
  end

  test "milestone with one pairing creates new user levels" do
    section = create(:follower, student_user: @user).section
    pairing = create(:follower, section: section).student_user
    session[:pairings] = [pairing.id]

    assert_difference('UserLevel.count', 2) do # both get a UserLevel
      assert_creates(PairedUserLevel) do # there is one PairedUserLevel to link them
        post :milestone, params: @milestone_params
        assert_response :success
      end
    end

    paired_user_level = PairedUserLevel.last
    assert_equal @user, paired_user_level.driver_user_level.user
    assert_equal pairing, paired_user_level.navigator_user_level.user
  end

  test "milestone with multiple pairings creates multiple new user levels" do
    section = create(:follower, student_user: @user).section
    pairings = 3.times.map {create(:follower, section: section).student_user}
    session[:pairings] = pairings.map(&:id)

    assert_difference('UserLevel.count', 4) do # all 4 people
      assert_difference('PairedUserLevel.count', 3) do # there are 3 PairedUserLevel links
        post :milestone, params: @milestone_params
        assert_response :success
      end
    end

    user_level = UserLevel.find_by(user_id: @user.id, script_id: @script.id, level_id: @level.id)
    pairings.each do |pairing|
      pairing_user_level = UserLevel.find_by(user_id: pairing.id, script_id: @script.id, level_id: @level.id)
      assert PairedUserLevel.find_by(driver_user_level_id: user_level.id, navigator_user_level_id: pairing_user_level.id),
        "could not find PairedUserLevel"
    end
  end

  test "milestone with pairings updates driver's existing user level" do
    section = create(:follower, student_user: @user).section
    pairing = create(:follower, section: section).student_user
    session[:pairings] = [pairing.id]

    existing_navigator_user_level = create :user_level, user: pairing, script: @script, level: @level, best_result: 10

    assert_difference('UserLevel.count', 1) do # one gets a new user level
      assert_creates(PairedUserLevel) do # there is one PairedUserLevel to link them
        post :milestone, params: @milestone_params
        assert_response :success
      end
    end

    existing_navigator_user_level.reload
    assert_equal 100, existing_navigator_user_level.best_result

    assert_equal [@user], existing_navigator_user_level.driver_user_levels.map(&:user)
  end

  test "milestone with pairings updates navigator's existing user level" do
    section = create(:follower, student_user: @user).section
    pairing = create(:follower, section: section).student_user
    session[:pairings] = [pairing.id]

    existing_driver_user_level = create :user_level, user: @user, script: @script, level: @level, best_result: 10

    assert_difference('UserLevel.count', 1) do # one gets a new user level
      assert_creates(PairedUserLevel) do # there is one PairedUserLevel to link them
        post :milestone, params: @milestone_params
        assert_response :success
      end
    end

    existing_driver_user_level.reload
    assert_equal 100, existing_driver_user_level.best_result

    assert_equal [pairing], existing_driver_user_level.navigator_user_levels.map(&:user)
  end

  test "milestone fails to update locked/readonly level" do
    teacher = create(:teacher)

    # make them an authorized_teacher
    cohort = create(:cohort)
    cohort.teachers << teacher
    cohort.save!

    section = create(:section, user: teacher, login_type: 'word')
    student_1 = create(:follower, section: section).student_user
    sign_in student_1

    script = create :script

    # Create a LevelGroup level.
    level = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level.properties['title'] =  'Long assessment 1'
    level.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}]
    level.properties['submittable'] = true
    level.save!

    stage = create :stage, name: 'Stage1', script: script, lockable: true

    # Create a ScriptLevel joining this level to the script.
    script_level = create :script_level, script: script, levels: [level], assessment: true, stage: stage

    milestone_params = {
      user_id: student_1,
      script_level_id: script_level.id,
      level_id: level.id,
      program: '<hey>',
      app: 'level_group',
      level: nil,
      result: 'true',
      pass: 'true',
      testResult: '100',
      submitted: 'true'
    }

    # milestone post should fail because there's no user_level, and it is thus locked by implication
    post :milestone, params: milestone_params
    assert_response 403

    # explicity create a user_level that is unlocked
    user_level = create :user_level, user: student_1, script: script, level: level, submitted: false, unlocked_at: Time.now

    # should now succeed
    post :milestone, params: milestone_params
    assert_response :success

    # milestone post should cause it to become locked again
    user_level = UserLevel.find(user_level.id)
    assert user_level.locked?(stage)

    # milestone post should also fail when we have an existing user_level that is locked
    post :milestone, params: milestone_params
    assert_response 403

    user_level.delete
    # explicity create a user_level that is readonly_answers
    create :user_level, user: student_1, script: script, level: level, submitted: true, unlocked_at: nil, readonly_answers: true
    post :milestone, params: milestone_params
    assert_response 403
  end

  test "milestone strips emoji from program and saves it" do
    params = @milestone_params
    params[:program] = panda_panda

    post :milestone, params: params

    user_level = UserLevel.last
    # panda_panda contains a panda emoji, ensure that it's gone
    assert_equal user_level.level_source.data, 'Panda'
  end
end
