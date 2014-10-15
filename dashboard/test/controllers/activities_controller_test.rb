require 'test_helper'

class ActivitiesControllerTest < ActionController::TestCase
  include Devise::TestHelpers
  setup do
    @user = create(:user, total_lines: 15)
    sign_in(@user)

    @activity = create(:activity, user: @user)

    @admin = create(:admin)

    script_levels = Script.find(Script::TWENTY_HOUR_ID).script_levels
    @script_level_prev = script_levels[0]
    @script_level = @script_level_prev.next_progression_level
    @script_level_next = @script_level.next_progression_level
    @script = @script_level.script

    @blank_image = File.read('test/fixtures/artist_image_blank.png', binmode: true)
    @good_image = File.read('test/fixtures/artist_image_1.png', binmode: true)
    @another_good_image = File.read('test/fixtures/artist_image_2.png', binmode: true)
    @post_hash = {user_id: @user, script_level_id: @script_level, lines: 20, attempt: '1', result: 'true', testResult: '100', time: '1000', app: 'test', program: '<hey>'}
  end

  # Ignore any additional keys in 'actual' not found in 'expected'.
  # This allows additional keys to be added to the controller response
  # without having to update all existing test contracts.
  def assert_equal_expected_keys(expected, actual)
    act = actual.clone
    # milestone provides hints based on the program's level_source_id.
    # Some of these are coincidentally the same as level_source_ids in
    # level_source_hints, which uses the level_source_ids in production.
    # To avoid brittle hint equivalencies, ignore response[:hint] values.
    act.delete 'hint'
    expected.each do |key, value|
      assert_equal value, act[key]
    end
  end

  def studio_program_with_text(text)
    '<xml><block type="when_run" deletable="false"><next><block type="studio_showTitleScreen"><title name="TITLE">' +
        text +
        '</title><title name="TEXT">type text here</title></block></next></block>'
  end

  test "logged in milestone" do
    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    @controller.expects(:trophy_check).with(@user)

    assert_creates(LevelSource, Activity, UserLevel, UserScript) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>"
        end
      end
    end

    assert_response :success

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    # created a user script
    user_script = assigns(:user_script)
    assert_equal @script_level.script, user_script.script
    assert_equal @user, user_script.user
    assert user_script.started_at
    assert_equal user_script.started_at, user_script.last_progress_at
    assert user_script.assigned_at.nil?
    assert user_script.completed_at.nil?
  end

  test "logged in milestone with messed up email" do
    # use update_attribute to bypass validations
    @user.update_attribute(:email, '')
    @user.update_attribute(:hashed_email, '')

    test_logged_in_milestone
  end

  test "logged in milestone should backfill userscript" do
    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    @controller.expects(:trophy_check).with(@user)

    # existing level
    script_start_date = Time.now - 5.days
    existing_sl = @script_level.script.script_levels.last
    UserLevel.record_timestamps = false
    UserLevel.create!(user_id: @user.id, level_id: existing_sl.level.id, best_result: 100,
                     created_at: script_start_date, updated_at: script_start_date)
    UserLevel.record_timestamps = true

    assert_creates(LevelSource, Activity, UserLevel, UserScript) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>"
        end
      end
    end

    assert_response :success

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    # created a user script that we started in the past with the other userlevel
    user_script = assigns(:user_script)
    assert_equal @script_level.script, user_script.script
    assert_equal @user, user_script.user
    assert_equal script_start_date.to_i, user_script.started_at.to_i
    assert user_script.started_at != user_script.last_progress_at
    assert user_script.assigned_at.nil?
    assert user_script.completed_at.nil?
  end

  test "logged in milestone should save to gallery when passing an impressive level" do
    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    @controller.expects(:trophy_check).with(@user)

    assert_creates(LevelSource, Activity, UserLevel, GalleryActivity) do
      assert_difference('@user.reload.total_lines', 20) do # update total lines
        post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>", :save_to_gallery => true, image: Base64.encode64(@good_image)
      end
    end

    assert_response :success

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    # created gallery activity and activity for user
    assert_equal @user, Activity.last.user
    assert_equal @user, GalleryActivity.last.user
    assert_equal Activity.last, GalleryActivity.last.activity
  end

  test "logged in milestone should not save to gallery when passing a level with undefined impressiveness" do
    # insurance for weird things that happen in javascript.

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    @controller.expects(:trophy_check).with(@user)

    assert_creates(LevelSource, Activity, UserLevel) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>", :save_to_gallery => 'undefined', image: Base64.encode64(@good_image)
        end
      end
    end

    assert_response :success

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)

    # created gallery activity and activity for user
    assert_equal @user, Activity.last.user
  end

  test "logged in milestone not passing" do
    # do all the logging
    @controller.expects :log_milestone

    assert_creates(LevelSource, Activity, UserLevel) do
      assert_does_not_create(GalleryActivity) do
          assert_no_difference('@user.reload.total_lines') do # don't update total lines
            post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "false", :testResult => "10", :time => "1000", :app => "test", :program => "<hey>"
          end
      end
    end

    assert_response :success

    expected_response = {"previous_level"=>"/s/1/level/#{@script_level_prev.id}",
                         "message"=>"try again",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end


  test "logged in milestone with image not passing" do
    # do all the logging
    @controller.expects :log_milestone

    assert_creates(LevelSource, Activity, UserLevel, LevelSourceImage) do
      assert_does_not_create(GalleryActivity) do
        assert_no_difference('@user.reload.total_lines') do # don't update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "false", :testResult => "10", :time => "1000", :app => "test", :program => "<hey>", image: Base64.encode64(@good_image), :save_to_gallery => true
        end
      end
    end

    assert_equal @good_image.size, LevelSourceImage.last.image.size

    assert_response :success

    expected_response = {"previous_level"=>"/s/1/level/#{@script_level_prev.id}",
                         "message"=>"try again",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with image" do
    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    @controller.expects(:trophy_check)

    assert_creates(LevelSource, Activity, UserLevel, LevelSourceImage) do
      assert_does_not_create(GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>", :image => Base64.encode64(@good_image)
        end
      end
    end

    assert_equal @good_image.size, LevelSourceImage.last.image.size

    assert_response :success

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with existing level source and level source image" do
    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    @controller.expects(:trophy_check)

    program = "<whatever>"

    level_source = LevelSource.find_identical_or_create(@script_level.level, program)
    level_source_image = LevelSourceImage.find_or_create_by(level_source_id: level_source.id) do |ls|
      ls.image = @good_image
    end
    assert_equal @good_image.size, level_source_image.reload.image.size

    assert_creates(Activity, UserLevel) do
      assert_does_not_create(LevelSource, LevelSourceImage, GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => program, :image => Base64.encode64(@good_image)
        end
      end
    end

    assert_equal @good_image.size, level_source_image.reload.image.size

    assert_response :success

    assert_equal level_source, assigns(:level_source)

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with existing level source and level source image updates image if old image was blank" do
    program = "<whatever>"

    level_source = LevelSource.find_identical_or_create(@script_level.level, program)
    level_source_image = LevelSourceImage.find_or_create_by(level_source_id: level_source.id) do |ls|
      ls.image = @blank_image
    end

    assert_creates(Activity, UserLevel) do
      assert_does_not_create(LevelSource, LevelSourceImage, GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => program, :image => Base64.encode64(@good_image)
        end
      end
    end

    assert_equal @good_image.size, level_source_image.reload.image.size

    assert_response :success

    assert_equal level_source, assigns(:level_source)

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with existing level source and level source image does not update image if new image is blank" do
    program = "<whatever>"

    level_source = LevelSource.find_identical_or_create(@script_level.level, program)
    level_source_image = LevelSourceImage.find_or_create_by(level_source_id: level_source.id) do |ls|
      ls.image = @good_image
    end

    assert_creates(Activity, UserLevel) do
      assert_does_not_create(LevelSource, LevelSourceImage, GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => program, :image => Base64.encode64(@blank_image)
        end
      end
    end

    assert_equal @good_image.size, level_source_image.reload.image.size

    assert_response :success

    assert_equal level_source, assigns(:level_source)

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone with existing level source and level source image does not update image if old image is good" do
    program = "<whatever>"

    level_source = LevelSource.find_identical_or_create(@script_level.level, program)
    level_source_image = LevelSourceImage.find_or_create_by(level_source_id: level_source.id) do |ls|
      ls.image = @good_image
    end

    assert_creates(Activity, UserLevel) do
      assert_does_not_create(LevelSource, LevelSourceImage, GalleryActivity) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => program, :image => Base64.encode64(@another_good_image)
        end
      end
    end

    assert_equal @good_image.size, level_source_image.reload.image.size

    assert_response :success

    assert_equal level_source, assigns(:level_source)

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}

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
    @controller.expects(:trophy_check).with(@user)

    # some Mocha shenanigans to simulate throwing a duplicate entry
    # error and then succeeding by returning the existing userlevel
    existing_user_level = UserLevel.create(user: @user, level: @script_level.level)
    user_level_creator = mock('user_level_creator')
    user_level_creator.stubs(:first_or_create).
      raises(ActiveRecord::RecordNotUnique.new(Mysql2::Error.new("Duplicate entry '1208682-37' for key 'index_user_levels_on_user_id_and_level_id'"))).
      then.
      returns(existing_user_level)

    UserLevel.stubs(:where).returns(user_level_creator)

    assert_creates(LevelSource, Activity) do
      assert_does_not_create(GalleryActivity, UserLevel) do
        assert_difference('@user.reload.total_lines', 20) do # update total lines
          post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>"
        end
      end
    end

    assert_response :success

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>35,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "save_to_gallery_url"=>"/gallery?gallery_activity%5Bactivity_id%5D=#{assigns(:activity).id}",
                         "design"=>"white_background"}


    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "logged in milestone race condition retrying code will not retry forever" do
    # do all the logging
    @controller.expects :log_milestone

    # simulate always throwing an exception on first_or_create (not
    # supposed to happen, but we shouldn't get stuck in a loop anyway)
    user_level_creator = mock('user_level_creator')
    user_level_creator.stubs(:first_or_create).
      raises(ActiveRecord::RecordNotUnique.new(Mysql2::Error.new("Duplicate entry '1208682-37' for key 'index_user_levels_on_user_id_and_level_id'")))
    UserLevel.stubs(:where).returns(user_level_creator)

    # we should just raise the exception
    assert_raises(ActiveRecord::RecordNotUnique) do
      post :milestone, user_id: @user, script_level_id: @script_level, :lines => 20, :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>"
    end
  end

  # TODO actually test trophies

  test "anonymous milestone starting with empty session saves progress in section" do
    sign_out @user

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    @controller.expects(:trophy_check).never # no trophy if not logged in

    assert_creates(LevelSource) do
      assert_does_not_create(Activity, UserLevel, LevelSourceImage, GalleryActivity) do
        post :milestone, user_id: 0, script_level_id: @script_level, :lines => "1", :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>", :save_to_gallery => true
      end
    end

    # record activity in session
    expected_progress = {@script_level.level_id => 100}
    assert_equal expected_progress, session["progress"]

    # record the total lines of code in session
    assert_equal 1, session['lines']

    assert_response :success

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>1,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "anonymous milestone with existing session adds progress in session" do
    sign_out @user

    # set up existing session
    session['progress'] = {@script_level_prev.level_id => 50}
    session['lines'] = 10

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    @controller.expects(:trophy_check).never # no trophy if not logged in

    assert_creates(LevelSource) do
      assert_does_not_create(Activity, UserLevel, LevelSourceImage, GalleryActivity) do
        post :milestone, user_id: 0, script_level_id: @script_level, :lines => "1", :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>"
      end
    end

    # record activity in session
    expected_progress = {@script_level_prev.level_id => 50, @script_level.level_id => 100}
    assert_equal expected_progress, session['progress']

    # record the total lines of code in session
    assert_equal 11, session['lines']

    assert_response :success

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>11,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "anonymous milestone not passing" do
    sign_out @user

    session['lines'] = 10

    # do all the logging
    @controller.expects :log_milestone

    assert_creates(LevelSource) do
      assert_does_not_create(Activity, UserLevel, LevelSourceImage, GalleryActivity) do
        post :milestone, user_id: 0, script_level_id: @script_level, :lines => "100", :attempt => "1", :result => "false", :testResult => "0", :time => "1000", :app => "test", :program => "<hey>"
      end
    end

    # record activity in session
    expected_progress = {@script_level.level_id => 0}
    assert_equal expected_progress, session["progress"]

    # lines in session does not change
    assert_equal 10, session['lines']

    assert_response :success
    expected_response = {"previous_level"=>"/s/1/level/#{@script_level_prev.id}",
                         "message"=>"try again",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "design"=>"white_background"}
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test "anonymous milestone with image saves image but does not save to gallery" do
    sign_out @user

    # set up existing session
    session['progress'] = {@script_level_prev.level_id => 50}
    session['lines'] = 10

    # do all the logging
    @controller.expects :log_milestone
    @controller.expects :slog

    @controller.expects(:trophy_check).never # no trophy if not logged in

    assert_creates(LevelSource, LevelSourceImage) do
      assert_does_not_create(Activity, UserLevel, GalleryActivity) do
        post :milestone, user_id: 0, script_level_id: @script_level, :lines => "1", :attempt => "1", :result => "true", :testResult => "100", :time => "1000", :app => "test", :program => "<hey>", :save_to_gallery => true, image: Base64.encode64(@good_image)
      end
    end

    # record activity in session
    expected_progress = {@script_level_prev.level_id => 50, @script_level.level_id => 100}
    assert_equal expected_progress, session['progress']

    # record the total lines of code in session
    assert_equal 11, session['lines']

    assert_response :success

    expected_response = {"previous_level"=>"/s/#{@script.id}/level/#{@script_level_prev.id}",
                         "total_lines"=>11,
                         "redirect"=>"/s/#{@script.id}/level/#{@script_level_next.id}",
                         "level_source"=>"http://test.host/sh/#{assigns(:level_source).id}",
                         "design"=>"white_background"}

    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test 'sharing program with swear word returns error' do
    return unless CDO.webpurify_key
    assert_does_not_create(LevelSource, GalleryActivity) do
      post :milestone, user_id: @user.id, script_level_id: @script_level, :program => studio_program_with_text('shit')
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
    return unless CDO.webpurify_key
    with_default_locale(:de) do
      assert_does_not_create(LevelSource, GalleryActivity) do
        post :milestone, user_id: @user.id, script_level_id: @script_level, :program => studio_program_with_text('scheiße')
      end
    end
    assert_response :success
    expected_response = {'level_source' => nil }
    assert_equal_expected_keys expected_response, JSON.parse(@response.body)
  end

  test 'sharing program with phone number' do
    assert_does_not_create(LevelSource, GalleryActivity) do
      post :milestone, user_id: @user.id, script_level_id: @script_level, :program => studio_program_with_text('800-555-5555')
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

  test 'milestone changes to next stage in default script' do
    last_level_in_stage = @script_level.script.script_levels.select{|x|x.level.game.name == 'Artist'}.last
    post :milestone, @post_hash.merge(script_level_id: last_level_in_stage)
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal({'previous'=>{'name'=>'Stage 5'}}, response['stage_changing'])
  end

  test 'milestone changes to next stage in custom script' do
    ScriptLevel.class_variable_set(:@@script_level_map, nil)
    game = create(:game)
    levels = (1..3).map { |n| create(:level, :name => "Level #{n}", :game => game) }
    script_dsl = ScriptDSL.parse(
      "stage 'Milestone Stage 1'; level 'Level 1'; level 'Level 2'; stage 'Milestone Stage 2'; level 'Level 3'",
      "a filename"
    )
    script = Script.add_script({name: 'Milestone Script'}, script_dsl[0][:stages].map{|stage| stage[:levels]}.flatten)

    last_level_in_first_stage = script.stages.first.script_levels.last
    post :milestone, @post_hash.merge(script_level_id: last_level_in_first_stage)
    assert_response :success
    response = JSON.parse(@response.body)

    # find localized test strings for custom stage names in script
    assert(response.has_key?('stage_changing'))
    assert_equal('milestone-stage-1', response['stage_changing']['previous']['name'])
  end

  test 'New level completed response' do
    def new_level
      post :milestone, @post_hash
      JSON.parse(@response.body)['new_level_completed']
    end

    assert_equal true, new_level
    assert_equal false, new_level

    sign_out @user
    assert_equal true, new_level
    assert_equal false, new_level
  end
end
