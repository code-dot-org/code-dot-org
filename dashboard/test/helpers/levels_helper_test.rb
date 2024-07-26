require 'test_helper'
require 'webmock/minitest'

class LevelsHelperTest < ActionView::TestCase
  include Devise::Test::ControllerHelpers

  def sign_in(user)
    user.reload
    # override the default sign_in helper because we don't actually have a request or anything here
    stubs(:current_user).returns user
    stub_get_storage_id(user.id)
  end

  setup do
    @level = create(:maze)
    @game = Game.custom_maze
    @is_start_mode = false

    def request
      OpenStruct.new(
        env: {},
        headers: OpenStruct.new('User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36'),
        ip: '1.2.3.4'
      )
    end

    stubs(:current_user).returns nil
    stub_get_storage_id(nil)
    stubs(:storage_decrypt_channel_id).returns([123, 456])
  end

  test "blockly_options refuses to generate options for non-blockly levels" do
    @level = create(:match)
    assert_raises(ArgumentError) do
      blockly_options
    end
  end

  test "blockly_options should parse maze level with non string array" do
    @level.properties["maze"] = [[0, 0], [2, 3]]
    options = blockly_options
    assert options[:level]["map"].is_a?(Array), "Maze is not an array"

    reset_view_options

    @level.properties["maze"] = @level.properties["maze"].to_s
    options = blockly_options
    assert options[:level]["map"].is_a?(Array), "Maze is not an array"
  end

  test "blockly_options non-custom level displays localized instruction after locale switch" do
    default_locale = 'en-US'
    new_locale = 'es-ES'
    @level.short_instructions = nil
    @level.user_id = nil
    @level.level_num = '2_2'

    I18n.locale = default_locale
    options = blockly_options
    assert_equal I18n.t('data.level.instructions.maze_2_2', locale: default_locale), options[:level]['shortInstructions']

    reset_view_options

    I18n.locale = new_locale
    options = blockly_options
    assert_equal I18n.t('data.level.instructions.maze_2_2', locale: new_locale), options[:level]['shortInstructions']
  end

  test "blockly_options custom level displays english instruction" do
    default_locale = 'en-US'
    @level.short_instructions = "English instructions"

    I18n.locale = default_locale
    options = blockly_options
    refute_nil options[:level]['shortInstructions']
    assert_equal @level.short_instructions, options[:level]['shortInstructions']
  end

  test "blockly_options custom level displays localized instruction if exists" do
    @level.short_instructions = "English instructions"
    new_locale = 'es-ES'
    new_instructions = "Spanish instructions"

    I18n.locale = new_locale
    custom_i18n = {
      "data" => {
        "short_instructions" => {
          @level.name => new_instructions
        }
      }
    }
    I18n.backend.store_translations new_locale, custom_i18n
    assert_equal new_instructions, I18n.t("data.short_instructions.#{@level.name}", locale: new_locale)

    options = blockly_options
    assert_equal new_instructions, options[:level]['shortInstructions']

    reset_view_options

    @level.update(name: 'this_level_doesnt_exist')
    options = blockly_options
    assert_equal @level.short_instructions, options[:level]['shortInstructions']
  end

  test "blockly_options 'embed' is true for embed levels" do
    @level.embed = true
    assert blockly_options[:embed]
  end

  test "blockly_options 'embed' is true for widget levels not in start mode" do
    @level = create(:applab, embed: false, widget_mode: true)
    assert blockly_options[:embed]
  end

  test "blockly_options 'embed' is false for widget levels in start mode" do
    @level = create(:applab, embed: false, widget_mode: true)
    @is_start_mode = true
    refute blockly_options[:embed]
  end

  test "blockly_options 'level.isLastLevelInLesson' is false if script level is not the last level in the lesson" do
    @level = create :applab
    @lesson = create :lesson
    @script_level = create :script_level, levels: [@level], lesson: @lesson, chapter: 1, position: 1
    create :script_level, lesson: @lesson, chapter: 2, position: 2

    options = blockly_options

    refute options[:level]['isLastLevelInLesson']
  end

  test "blockly_options 'level.isLastLevelInLesson' is true if script level is the last level in the lesson" do
    @level = create :applab
    @lesson = create :lesson
    create :script_level, lesson: @lesson, position: 1, chapter: 1
    @script_level = create :script_level, levels: [@level], lesson: @lesson, position: 2, chapter: 2

    options = blockly_options

    assert options[:level]['isLastLevelInLesson']
  end

  test "blockly_options 'level.isLastLevelInScript' is false if script level is not the last level in the script" do
    @script = create :script
    lesson_group = create :lesson_group, script: @script
    @lesson = create :lesson, lesson_group: lesson_group, relative_position: 1
    lesson_2 = create :lesson, lesson_group: lesson_group, relative_position: 2
    @level = create :applab
    @script_level = create :script_level, lesson: @lesson, levels: [@level]
    create :script_level, lesson: lesson_2

    options = blockly_options

    refute options[:level]['isLastLevelInScript']
  end

  test "blockly_options 'level.isLastLevelInScript' is true if script level is the last level in the script" do
    @script = create :script
    lesson_group = create :lesson_group, script: @script
    create :lesson, lesson_group: lesson_group, relative_position: 1
    @lesson = create :lesson, lesson_group: lesson_group, relative_position: 2
    @level = create :applab
    @script_level = create :script_level, lesson: @lesson, levels: [@level], position: 1

    options = blockly_options

    assert options[:level]['isLastLevelInScript']
  end

  test "blockly_options 'level.showEndOfLessonMsgs' is true if script.show_unit_overview_between_lessons? is true" do
    Unit.any_instance.stubs(:show_unit_overview_between_lessons?).returns true
    @script = create :script
    @lesson = create :lesson
    @level = create :applab
    @script_level = create :script_level, lesson: @lesson, levels: [@level]

    options = blockly_options

    assert options[:level]['showEndOfLessonMsgs']
  end

  test "blockly_options 'level.showEndOfLessonMsgs' is false if script.show_unit_overview_between_lessons? is false" do
    Unit.any_instance.stubs(:show_unit_overview_between_lessons?).returns false
    @script = create :script
    @lesson = create :lesson
    @level = create :applab
    @script_level = create :script_level, lesson: @lesson, levels: [@level]

    options = blockly_options

    refute options[:level]['showEndOfLessonMsgs']
  end

  test "get video choices" do
    choices_cached = video_key_choices
    assert_equal(choices_cached.count, Video.where(locale: 'en-US').count)
    Video.all.each {|video| assert_includes(choices_cached, video.key)}
  end

  test "blockly options converts 'impressive' => 'false' to 'impressive => false'" do
    @level = create :artist
    @lesson = create :lesson
    @script_level = create :script_level, levels: [@level], lesson: @lesson
    @level.impressive = "false"
    @level.free_play = "false"

    options = blockly_options

    assert_equal false, options[:level]['impressive']
    assert_equal false, options[:level]['freePlay']
  end

  test "custom callouts" do
    @level.level_num = 'custom'
    @level.callout_json = '[{"localization_key": "run", "element_id": "#runButton"}]'

    callouts = select_and_remember_callouts
    assert_equal 1, callouts.count
    assert_equal '#runButton', callouts[0]['element_id']
    assert_equal 'Hit "Run" to try your program', callouts[0]['localized_text']

    callouts = select_and_remember_callouts
    assert_equal 0, callouts.count
  end

  test "should select only callouts for current script level" do
    script = create(:script)
    @level = create(:deprecated_blockly_level)
    lesson = create(:lesson, script: script)
    @script_level = create(:script_level, script: script, levels: [@level], lesson: lesson)

    callout1 = create(:callout, script_level: @script_level)
    callout2 = create(:callout, script_level: @script_level)
    irrelevant_callout = create(:callout)

    callouts = select_and_remember_callouts

    assert(callouts.any? {|callout| callout['id'] == callout1.id})
    assert(callouts.any? {|callout| callout['id'] == callout2.id})
    assert(callouts.none? {|callout| callout['id'] == irrelevant_callout.id})
  end

  test "should localize callouts" do
    script = create(:script)
    @level = create(:deprecated_blockly_level)
    lesson = create(:lesson, script: script)
    @script_level = create(:script_level, script: script, levels: [@level], lesson: lesson)

    create(:callout, script_level: @script_level, localization_key: 'run')

    callouts = select_and_remember_callouts

    assert(callouts.any? {|c| c['localized_text'] == 'Hit "Run" to try your program'})
  end

  test 'app_options returns camelCased view option on Blockly level' do
    @level.start_blocks = '<test/>'
    options = app_options
    assert_equal '<test/>', options[:level]['startBlocks']
  end

  test "embedded-freeplay level doesn't remove header and footer" do
    @level.embed = true
    app_options
    assert_nil view_options[:no_header]
    assert_nil view_options[:no_footer]
  end

  test 'Blockly#blockly_app_options and Blockly#blockly_level_options not modified by levels helper' do
    level = create(:level, :blockly, :with_autoplay_video)
    blockly_app_options = level.blockly_app_options level.game, level.skin
    blockly_level_options = level.blockly_level_options

    @level = level
    app_options

    assert_equal blockly_app_options, level.blockly_app_options(level.game, level.skin)
    assert_equal blockly_level_options, level.blockly_level_options
  end

  test 'app_options sets a channel if the level is not cached for a channel-backed level' do
    @public_caching = false

    @script = create(:script)
    @level = create :applab
    create(:script_level, script: @script, levels: [@level])

    refute_nil app_options['channel']
  end

  test 'app_options does not set a channel if the level is cached' do
    @public_caching = true

    @script = create(:script)
    @level = create :applab
    create(:script_level, script: @script, levels: [@level])

    assert_nil app_options['channel']
  end

  test "app_options sets level_requires_channel to false if level is not channel backed" do
    @level = create :artist
    assert_equal false, app_options['levelRequiresChannel']
  end

  test "app_options sets level_requires_channel to true if level is channel backed" do
    @level = create :applab
    assert_equal true, app_options['levelRequiresChannel']
  end

  test "app_options sets level_requires_channel to false if level is channel backed with contained levels" do
    @level = create :applab
    contained_level = create :multi
    @level.update(contained_level_names: [contained_level.name])
    assert_equal false, app_options['levelRequiresChannel']
  end

  test "app_options sets level_requires_channel to false if in edit_blocks mode" do
    @level = create :applab
    @controller.stubs(:params).returns({action: 'edit_blocks'})
    assert_equal false, app_options['levelRequiresChannel']
  end

  test "app_options sets level_requires_channel to true for Javalab with contained levels" do
    @level = create :javalab
    contained_level = create :multi
    @level.update(contained_level_names: [contained_level.name])
    @controller.stubs(:params).returns({action: 'edit_blocks'})
    assert_equal true, app_options['levelRequiresChannel']
  end

  test "app_options sets level_requires_channel to true for Javalab in edit_blocks mode" do
    @level = create :javalab
    @controller.stubs(:params).returns({action: 'edit_blocks'})
    assert_equal true, app_options['levelRequiresChannel']
  end

  test 'get_channel_for sets a channel' do
    user = create :user
    sign_in user

    script = create(:script)
    level = create(:level, :blockly)
    create(:script_level, script: script, levels: [@level, level])

    channel = get_channel_for(@level, script.id)
    # Request it again, should get the same channel
    assert_equal channel, get_channel_for(@level, script.id)

    # Request it for a different level, should get a different channel
    level = create(:level, :blockly)
    refute_equal channel, get_channel_for(level, script.id)
  end

  test 'use_google_blockly is false if not set' do
    Experiment.stubs(:enabled?).returns(false)
    @level = build :level
    refute use_google_blockly
    Experiment.unstub(:enabled?)
    reset_view_options
  end

  test 'use_google_blockly is true if Experiment is enabled for google_blockly' do
    Experiment.stubs(:enabled?).returns(true)
    @level = build :level
    assert use_google_blockly
    Experiment.unstub(:enabled?)
  end

  test 'use_google_blockly is true if blocklyVersion is set to Google in view_options' do
    Experiment.stubs(:enabled?).returns(false)
    view_options(blocklyVersion: 'google')
    @level = build :level
    assert use_google_blockly
    Experiment.unstub(:enabled?)
    reset_view_options
  end

  test 'use_google_blockly is false if blocklyVersion is set to Cdo in view_options even if level uses google_blockly' do
    Experiment.stubs(:enabled?).returns(false)
    view_options(blocklyVersion: 'cdo')
    @level = build :level
    @level.stubs(:uses_google_blockly?).returns(true)
    refute use_google_blockly
    Experiment.unstub(:enabled?)
    reset_view_options
  end

  test 'use_google_blockly is true if level uses google_blockly and blocklyVersion is not set to cdo' do
    Experiment.stubs(:enabled?).returns(false)
    view_options(blocklyVersion: nil)
    @level = build :level
    @level.stubs(:uses_google_blockly?).returns(true)
    assert use_google_blockly
    @level.unstub(:uses_google_blockly?)
    Experiment.unstub(:enabled?)
    reset_view_options
  end

  test 'applab levels should not load channel when viewing student solution of a student without a channel' do
    # two different users
    @user = create :user
    sign_in create(:user)

    script = create(:script)
    @level = create :applab
    create(:script_level, script: script, levels: [@level])

    # channel does not exist
    assert_nil get_channel_for(@level, script.id, @user)
  end

  test 'applab levels should load channel when viewing student solution of a student with a channel' do
    # two different users
    @user = create :user
    sign_in create(:user)
    stub_storage_id_for_user_id(@user.id)

    script = create(:script)
    @level = create :applab
    create(:script_level, script: script, levels: [@level])

    # channel exists
    create :channel_token, level: @level, storage_id: fake_storage_id_for_user_id(@user.id)
    refute_nil get_channel_for(@level, script.id, @user)

    # calling app_options should set readonly_workspace, since we're viewing for
    # different user
    app_options
    assert_equal true, view_options[:readonly_workspace]
  end

  test 'readonly workspace should be set if the level is channel-backed and a code review is open for the project' do
    @user = create :user
    sign_in @user
    stub_storage_id_for_user_id(@user.id)

    script = create(:script)
    @level = create :javalab
    create(:script_level, script: script, levels: [@level])

    create :channel_token, level: @level, storage_id: fake_storage_id_for_user_id(@user.id)
    @channel_id = get_channel_for(@level, script.id, @user)
    refute_nil @channel_id

    _,  @project_id = storage_decrypt_channel_id(@channel_id)
    create :code_review, user_id: @user.id, project_id: @project_id

    # calling app_options should set readonly_workspace, since a code review is open
    app_options
    assert_equal true, view_options[:readonly_workspace]
  end

  test 'level_started? should return true if a channel exists for a channel backed level' do
    user = create :user
    stub_storage_id_for_user_id(user.id)

    applab_level = create :applab # is channel backed
    script = create(:script)
    create(:script_level, levels: [applab_level], script: script)

    create :channel_token, level: applab_level, storage_id: fake_storage_id_for_user_id(user.id)

    assert_equal true, level_started?(applab_level, script, user)
  end

  test 'level_started? should return false if a channel does not exist for a channel backed level' do
    user = create :user
    applab_level = create :applab # is channel backed
    script = create(:script)
    create(:script_level, levels: [applab_level], script: script)

    assert_equal false, level_started?(applab_level, script, user)
  end

  test 'level_started? should return true if progress exists for a level that is not channel backed' do
    user = create :user
    maze_level = create :maze
    script = create(:script)
    create(:script_level, levels: [maze_level], script: script)
    create :user_level, level: maze_level, user: user, script: script

    assert_equal true, level_started?(maze_level, script, user)
  end

  test 'level_started? should return false if progress does not exist for a level that is not channel backed' do
    user = create :user
    maze_level = create :maze
    script = create(:script)
    create(:script_level, levels: [maze_level], script: script)

    assert_equal false, level_started?(maze_level, script, user)
  end

  test 'a teacher viewing student work should see isStarted value for student' do
    @user = create :user
    @level = create :applab
    @script = script = create(:script)
    create(:script_level, levels: [@level], script: script)

    stub_storage_id_for_user_id(@user.id)

    teacher = create :teacher
    sign_in teacher

    # create progress on level for teacher to ensure we get back student isStarted value
    create :channel_token, level: @level, storage_id: fake_storage_id_for_user_id(teacher.id)

    assert_equal false, app_options[:level][:isStarted]
  end

  test 'applab levels should include isNavigator=false when viewed by driver' do
    @level = create :applab
    @driver = create :student
    @navigator = create :student
    create_applab_progress_for_pair @level, @driver, @navigator

    # "Load the level" as the driver
    sign_in @driver
    assert_equal false, app_options[:level]['isNavigator']
  end

  test 'applab levels should include pairing_driver and pairing_channel_id when viewed by navigator' do
    @level = create :applab
    @driver = create :student
    stub_storage_id_for_user_id(@driver.id)
    @navigator = create :student
    create_applab_progress_for_pair @level, @driver, @navigator

    # "Load the level" as the navigator
    sign_in @navigator
    assert_equal true, app_options[:level]['isNavigator']
    refute_nil app_options[:level]['pairingDriver']
    refute_nil app_options[:level]['pairingChannelId']

    # calling app_options should not set readonly_workspace
    app_options
    assert_nil view_options[:readonly_workspace]
  end

  # Regression test for problem:
  #   https://codeorg.zendesk.com/agent/tickets/115705
  #   https://app.honeybadger.io/projects/3240/faults/35473924
  #
  # Given we have two users A and B
  # And they have pair-programming progress on a channel-backed level where
  #   user A was the driver and user B was the navigator
  # When user A is deleted
  # And user B returns to the level
  # Then we should load the level without pair-programming information
  test 'applab levels viewed by navigator omit pairing_driver and pairing_channel_id if the driver account was deleted' do
    @level = create :applab
    @driver = create :student
    @navigator = create :student
    create_applab_progress_for_pair @level, @driver, @navigator

    # Delete the driver
    @driver.destroy

    # "Load the level" as the navigator
    sign_in @navigator
    assert_equal true, app_options[:level]['isNavigator']
    assert_nil app_options[:level]['pairingDriver']
    assert_nil app_options[:level]['pairingChannelId']
  end

  def create_applab_progress_for_pair(level, driver, navigator)
    driver_user_level = create :user_level, user: driver, level: level
    navigator_user_level = create :user_level, user: navigator, level: level
    create :paired_user_level,
      driver_user_level: driver_user_level, navigator_user_level: navigator_user_level
    create :channel_token, level: level, storage_id: fake_storage_id_for_user_id(driver.id)
  end

  def stub_country(code)
    req = request
    req.location = OpenStruct.new country_code: code
    stubs(:request).returns(req)
  end

  test 'send to phone enabled for US' do
    stub_country 'US'
    assert app_options[:isUS]
  end

  test 'send to phone disabled for non-US' do
    stub_country 'RU'
    refute app_options[:isUS]
  end

  test 'send_to_phone_url provided when US' do
    stub_country 'US'
    assert_equal 'http://test.host/sms/send', app_options[:send_to_phone_url]
  end

  test 'submittable level is submittable for teacher enrolled in plc' do
    @level = create(:free_response, submittable: true, peer_reviewable: 'true')
    Plc::UserCourseEnrollment.stubs(:exists?).returns(true)

    user = create(:teacher)
    sign_in user

    app_options = question_options

    assert_equal true, app_options[:level]['submittable']
  end

  test 'submittable level is not submittable for a teacher not enrolled in plc' do
    @level = create(:free_response, submittable: true, peer_reviewable: 'true')
    Plc::UserCourseEnrollment.stubs(:exists?).returns(false)

    user = create(:teacher)
    sign_in user

    app_options = question_options

    refute app_options[:level]['submittable']
  end

  test 'submittable level is submittable for student with teacher' do
    @level = create(:applab, submittable: true)

    user = create(:follower).student_user
    sign_in user

    assert_equal true, app_options[:level]['submittable']
  end

  test 'submittable level is not submittable for student without teacher' do
    @level = create(:applab, submittable: true)

    user = create :student
    sign_in user

    assert_equal false, app_options[:level]['submittable']
  end

  test 'submittable level is not submittable for non-logged in user' do
    @level = create(:applab, submittable: true)

    assert_equal false, app_options[:level]['submittable']
  end

  test 'submittable multi level is submittable for student with teacher' do
    @level = create(:multi, submittable: true)

    user = create(:follower).student_user
    sign_in user

    assert_equal true, app_options[:level]['submittable']
  end

  test 'submittable multi level is not submittable for student without teacher' do
    @level = create(:multi, submittable: true)

    user = create :student
    sign_in user

    assert_equal false, app_options[:level]['submittable']
  end

  test 'submittable multi level is not submittable for non-logged in user' do
    @level = create(:multi, submittable: true)

    assert_equal false, app_options[:level]['submittable']
  end

  test 'show solution link shows link for appropriate courses' do
    user = create :teacher
    sign_in user

    @level = create(:level, :blockly, :with_ideal_level_source)
    @script = create(:script)
    @script.update(professional_learning_course: 'Professional Learning Course')
    @script_level = create(:script_level, levels: [@level], script: @script)
    refute can_view_solution?

    sign_out user
    user = create :levelbuilder
    sign_in user
    assert can_view_solution?

    @script.update(name: 'algebra')
    refute can_view_solution?

    @script.update(name: 'some pd script')
    @script_level = nil
    refute can_view_solution?

    @script_level = create(:script_level, levels: [@level], script: @script)
    @level.update(ideal_level_source_id: nil)
    refute can_view_solution?
  end

  test 'show solution link shows link for appropriate users' do
    @level = create(:level, :blockly, :with_ideal_level_source)
    @script = create(:script)
    @script_level = create(:script_level, levels: [@level], script: @script)

    user = create :levelbuilder
    sign_in user
    assert can_view_solution?

    sign_out user
    user = create :teacher
    sign_in user
    assert can_view_solution?

    sign_out user
    user = create :student
    sign_in user
    refute can_view_solution?

    sign_out user
    refute can_view_solution?
  end

  test 'build_script_level_path differentiates lesson and survey' do
    # (position 1) Survey 1 (lockable: true, has_lesson_plan: false)
    # (position 2) Lesson 1 (lockable: false, has_lesson_plan: false)
    # (position 3) Survey 2 (lockable: true, has_lesson_plan: false)
    # (position 4) Survey 3 (lockable: true, has_lesson_plan: false)
    # (position 5) Lesson 2 (lockable: true, has_lesson_plan: true)
    # (position 6) Lesson 3 (lockable: false, has_lesson_plan: true)

    lockable1 = create :level, name: 'LockableAssessment1'
    level1 = create :level, name: 'NonLockableAssessment1'
    lockable2 = create :level, name: 'LockableAssessment2'
    lockable3 = create :level, name: 'LockableAssessment3'
    lockable4 = create :level, name: 'LockableAssessment4'
    level2 = create :level, name: 'NonLockableAssessment2'

    unit = create :script, name: 'test-script'
    lesson_group = create :lesson_group, script: unit

    lesson = create :lesson, :with_activity_section, lesson_group: lesson_group, relative_position: 1, lockable: true
    create :script_level, activity_section: lesson.activity_sections.first, levels: [lockable1]

    lesson = create :lesson, :with_activity_section, lesson_group: lesson_group, relative_position: 1
    create :script_level, activity_section: lesson.activity_sections.first, levels: [level1]

    lesson = create :lesson, :with_activity_section, lesson_group: lesson_group, relative_position: 2, lockable: true
    create :script_level, activity_section: lesson.activity_sections.first, levels: [lockable2]

    lesson = create :lesson, :with_activity_section, lesson_group: lesson_group, relative_position: 3, lockable: true
    create :script_level, activity_section: lesson.activity_sections.first, levels: [lockable3]

    lesson = create :lesson, :with_activity_section, lesson_group: lesson_group, relative_position: 2, lockable: true, has_lesson_plan: true
    create :script_level, activity_section: lesson.activity_sections.first, levels: [lockable4]

    lesson = create :lesson, :with_activity_section, lesson_group: lesson_group, relative_position: 3
    create :script_level, activity_section: lesson.activity_sections.first, levels: [level2]

    lesson = unit.lessons[0]
    assert_equal 1, lesson.absolute_position
    assert_equal 1, lesson.relative_position
    assert_equal '/s/test-script/lockable/1/levels/1', build_script_level_path(lesson.script_levels[0], {})
    assert_equal '/s/test-script/lockable/1/levels/1/page/1', build_script_level_path(lesson.script_levels[0], {puzzle_page: '1'})

    lesson = unit.lessons[1]
    assert_equal 2, lesson.absolute_position
    assert_equal 1, lesson.relative_position
    assert_equal '/s/test-script/lessons/1/levels/1', build_script_level_path(lesson.script_levels[0], {})
    assert_equal '/s/test-script/lessons/1/levels/1/page/1', build_script_level_path(lesson.script_levels[0], {puzzle_page: '1'})

    lesson = unit.lessons[2]
    assert_equal 3, lesson.absolute_position
    assert_equal 2, lesson.relative_position
    assert_equal '/s/test-script/lockable/2/levels/1', build_script_level_path(lesson.script_levels[0], {})
    assert_equal '/s/test-script/lockable/2/levels/1/page/1', build_script_level_path(lesson.script_levels[0], {puzzle_page: '1'})

    lesson = unit.lessons[3]
    assert_equal 4, lesson.absolute_position
    assert_equal 3, lesson.relative_position
    assert_equal '/s/test-script/lockable/3/levels/1', build_script_level_path(lesson.script_levels[0], {})
    assert_equal '/s/test-script/lockable/3/levels/1/page/1', build_script_level_path(lesson.script_levels[0], {puzzle_page: '1'})

    lesson = unit.lessons[4]
    assert_equal 5, lesson.absolute_position
    assert_equal 2, lesson.relative_position
    assert_equal '/s/test-script/lessons/2/levels/1', build_script_level_path(lesson.script_levels[0], {})
    assert_equal '/s/test-script/lessons/2/levels/1/page/1', build_script_level_path(lesson.script_levels[0], {puzzle_page: '1'})

    lesson = unit.lessons[5]
    assert_equal 6, lesson.absolute_position
    assert_equal 3, lesson.relative_position
    assert_equal '/s/test-script/lessons/3/levels/1', build_script_level_path(lesson.script_levels[0], {})
    assert_equal '/s/test-script/lessons/3/levels/1/page/1', build_script_level_path(lesson.script_levels[0], {puzzle_page: '1'})
  end

  test 'build_script_level_path uses names for bonus levels to support cross-environment links' do
    unit = create :script, :with_levels, name: 'test-bonus-level-links'
    unit.script_levels.last.update(bonus: true)
    unit.reload

    bonus_script_level = unit.lessons.first.script_levels[1]
    uri = URI(build_script_level_path(bonus_script_level, {}))
    assert_equal '/s/test-bonus-level-links/lessons/1/extras', uri.path

    query_params = CGI.parse(uri.query)
    assert_equal bonus_script_level.level.name, query_params['level_name'].first
  end

  test 'build_script_level_path handles bonus levels with or without solutions' do
    unit = create :script, :with_levels, levels_count: 4, name: 'my-cool-script'
    unit.script_levels[2].update!(bonus: true)
    unit.script_levels[3].update!(bonus: true)
    unit.reload

    sl = unit.script_levels[2]
    uri = URI(build_script_level_path(sl, {}))
    query_params = CGI.parse(uri.query)
    assert_equal '/s/my-cool-script/lessons/1/extras', uri.path
    assert_equal sl.level.name, query_params['level_name'].first
    assert_nil query_params['solution'].first

    sl = unit.script_levels[3]
    uri = URI(build_script_level_path(sl, {solution: true}))
    query_params = CGI.parse(uri.query)
    assert_equal '/s/my-cool-script/lessons/1/extras', uri.path
    assert_equal sl.level.name, query_params['level_name'].first
    assert_equal 'true', query_params['solution'].first
  end

  test 'standalone multi should include answers for student' do
    sign_in create(:student)

    @script = create(:script)
    @level = create :multi
    @lesson = create :lesson
    @script_level = create :script_level, levels: [@level], lesson: @lesson

    @user_level = create :user_level, user: current_user, best_result: 20, script: @script, level: @level

    standalone = true
    assert include_multi_answers?(standalone)
  end

  test 'non-standalone multi should not include answers for student' do
    sign_in create(:student)

    @script = create(:script)
    @level = create :multi
    @lesson = create :lesson
    @script_level = create :script_level, levels: [@level], lesson: @lesson

    @user_level = create :user_level, user: current_user, best_result: 20, script: @script, level: @level

    standalone = false
    refute include_multi_answers?(standalone)
  end

  test 'section first_activity_at should not be nil when finding experiments' do
    Experiment.stubs(:should_cache?).returns true
    teacher = create(:teacher)
    @script = create :script
    experiment = create(
      :teacher_based_experiment,
      earliest_section_at: DateTime.now - 1.day,
      latest_section_at: DateTime.now + 1.day,
      percentage: 100,
      script: @script
    )
    Experiment.update_cache
    section = create(:section, user: teacher)
    student = create(:student)
    section.add_student(student)

    sign_in student

    assert_includes app_options[:experiments], experiment.name
    experiment.destroy
  end

  test 'video data available for levels with associated videos' do
    @level = create :applab, :with_autoplay_video
    assert_equal app_options[:level][:levelVideos].length, 1
    # accounts for the random assignmnet of video data in stub
    assert_includes app_options[:level][:levelVideos][0][:key], "concept_"
  end

  test 'video data is empty for levels with no associated videos' do
    leveldata = []
    @level = create :applab
    assert_equal app_options[:level][:levelVideos], leveldata
  end

  test 'map reference available for levels with associated map reference' do
    map_ref = '/test/alpha.html'
    @level = create :applab, :with_map_reference
    assert_equal app_options[:level][:mapReference], map_ref
  end

  test 'map reference is empty for levels with no associated map reference' do
    @level = create :applab
    assert_nil app_options[:level][:mapReference]
  end

  test 'reference links available for levels with associated reference links' do
    ref_links = ['/test/abc.html', '/test/def.html']
    @level = create :applab, :with_reference_links
    assert_equal app_options[:level][:referenceLinks], ref_links
  end

  test 'reference links is empty for levels with no associated reference links' do
    @level = create :applab
    assert_nil app_options[:level][:referenceLinks]
  end

  test 'data_t resolves localized key with trailing dot correctly' do
    assert_equal 'Test trailing dot in value.', data_t('multi.random question', 'Test trailing dot in key.')
  end

  test 'function block options are localized' do
    toolbox = "<xml><category name=\"Actions\"/></xml>"
    toolbox_translated_name = "Azioni"
    @level.toolbox_blocks = toolbox

    start = "<xml><block type=\"procedures_defnoreturn\"><mutation><arg name=\"parameter\"/><description>function description</description></mutation><title name=\"NAME\">details</title></block></xml>"
    start_translated_name = "dettagli"
    start_translated_description = "descrizione"
    start_translated_parameter = "parametro"
    @level.start_blocks = start

    I18n.locale = :'it-IT'
    custom_i18n = {
      "data" => {
        "function_definitions" => {
          @level.name => {
            "Actions" => {
              "name" => toolbox_translated_name
            },
            "details" => {
              "name" => start_translated_name,
              "description" => start_translated_description,
              "parameters" => {
                "parameter" => start_translated_parameter
              }
            }
          }
        }
      }
    }
    I18n.backend.store_translations I18n.locale, custom_i18n

    new_toolbox = toolbox.sub("Actions", toolbox_translated_name)
    new_start = start.sub("details", start_translated_name)
    new_start = new_start.sub("function description", start_translated_description)
    new_start = new_start.sub("parameter", start_translated_parameter)
    refute_equal new_toolbox, toolbox
    refute_equal new_start, start

    options = blockly_options
    assert_equal new_toolbox, options[:level]["toolbox"]
    assert_equal new_start, options[:level]["startBlocks"]
  end

  test 'variable block options are localized' do
    toolbox = "<xml><block type=\"variables_get\"><title name=\"VAR\">length</title></block></xml>"
    toolbox_translated_name = "lunghezza"
    @level.toolbox_blocks = toolbox

    start = "<xml><block type=\"parameters_get\"><title name=\"VAR\">points</title></block></xml>"
    start_translated_name = "punti"
    @level.start_blocks = start

    I18n.locale = :'it-IT'
    custom_i18n = {
      "data" => {
        "variable_names" => {
          "length" =>  toolbox_translated_name
        },
        "parameter_names" => {
          "points" => start_translated_name
        }
      }
    }
    I18n.backend.store_translations I18n.locale, custom_i18n

    new_toolbox = toolbox.sub("length", toolbox_translated_name)
    new_start = start.sub("points", start_translated_name)
    refute_equal new_toolbox, toolbox
    refute_equal new_start, start

    options = blockly_options
    assert_equal new_toolbox, options[:level]["toolbox"]
    assert_equal new_start, options[:level]["startBlocks"]
  end

  test 'block options fall back to English if no translation is given' do
    toolbox = "<xml><category name=\"Actions\"/></xml>"
    toolbox_translated_name = "Azioni"
    @level.toolbox_blocks = toolbox

    start = "<xml><block type=\"procedures_defnoreturn\"><mutation><arg name=\"parameter\"/><description>function description</description></mutation><title name=\"NAME\">details</title></block></xml>"
    start_translated_name = "dettagli"
    @level.start_blocks = start

    I18n.locale = :'it-IT'
    # Provide a translation for the function name for "details" but not the description
    custom_i18n = {
      "data" => {
        "function_definitions" => {
          @level.name => {
            "Actions" => {
              "name" => toolbox_translated_name
            },
            "details" => {
              "name" => start_translated_name
            }
          }
        }
      }
    }
    I18n.backend.store_translations I18n.locale, custom_i18n

    new_toolbox = toolbox.sub("Actions", toolbox_translated_name)
    new_start = start.sub("details", start_translated_name)
    refute_equal new_toolbox, toolbox
    refute_equal new_start, start

    options = blockly_options
    assert_equal new_toolbox, options[:level]["toolbox"]
    assert_equal new_start, options[:level]["startBlocks"]
  end

  test 'block options are localized in project-backed levels' do
    toolbox = "<xml><category name=\"Actions\"/></xml>"
    toolbox_translated_name = "Azioni"
    start = "<xml><block type=\"procedures_defnoreturn\"><title name=\"NAME\">details</title></block></xml>"
    start_translated_name = "dettagli"

    project_level = create :maze, toolbox_blocks: toolbox, start_blocks: start
    @level.project_template_level_name = project_level.name

    I18n.locale = :'it-IT'
    custom_i18n = {
      "data" => {
        "function_definitions" => {
          @level.name => {
            "Actions" => {
              "name" => toolbox_translated_name
            },
            "details" => {
              "name" => start_translated_name
            }
          }
        }
      }
    }
    I18n.backend.store_translations I18n.locale, custom_i18n

    new_toolbox = toolbox.sub("Actions", toolbox_translated_name)
    new_start = start.sub("details", start_translated_name)
    refute_equal new_toolbox, toolbox
    refute_equal new_start, toolbox

    options = blockly_options
    assert_equal new_toolbox, options[:level]["toolbox"]
    assert_equal new_start, options[:level]["startBlocks"]
  end

  test 'render_multi_or_match_content can retrieve plain text' do
    @level = create :multi, name: "test render_multi_or_match_content plain text"
    assert_equal render_multi_or_match_content("test"), "test"
  end

  test 'render_multi_or_match_content can generate images' do
    assert_equal render_multi_or_match_content("example.png"), "<img src=\"example.png\"></img>"
  end

  test 'render_multi_or_match_content can generate embedded blockly' do
    create :level,
      name: "embedded blockly test",
      start_blocks: "<xml><block type='embedded_block' /></xml>"

    #request.env['cdo-locale'] is used to generate the js_locale, but isn't
    #correctly set up in this test context, so we have to mock it.
    mock_request = mock
    mock_request.stubs(:env).returns({"cdo.locale" => I18n.default_locale})
    stubs(:request).returns(mock_request)

    assert_equal render_multi_or_match_content("embedded blockly test.start_blocks"),
      "<xml><xml><block type=\"embedded_block\"/></xml></xml>" \
      "<div id=\"codeWorkspace\" style=\"display: none\"></div>" \
      "<style>.blocklySvg { background: none; }</style>" \
      "<script src=\"/assets/js/blockly.js\"></script>" \
      "<script src=\"/assets/js/en_us/blockly_locale.js\"></script>" \
      "<script src=\"/assets/js/en_us/maze_locale.js\"></script>" \
      "<script src=\"/assets/js/maze.js\" data-appoptions=\"{&quot;readonly&quot;:true,&quot;embedded&quot;:true,&quot;locale&quot;:&quot;en_us&quot;,&quot;baseUrl&quot;:&quot;/blockly/&quot;,&quot;blocks&quot;:&quot;\\u003cxml\\u003e\\u003c/xml\\u003e&quot;,&quot;dialog&quot;:{},&quot;nonGlobal&quot;:true}\"></script>" \
      "<script src=\"/assets/js/embedBlocks.js\"></script>"

    unstub(:request)
  end

  test 'render_multi_or_match_content can generate iframes' do
    test_level = create :level,
      name: "embedded iframe test"

    assert_equal render_multi_or_match_content("embedded iframe test.level"),
      "<div class=\"aspect-ratio\">" \
      "<iframe src=\"/levels/#{test_level.id}/embed_level\" width=\"100%\" scrolling=\"no\" seamless=\"seamless\" style=\"border: none;\"></iframe>" \
      "</div>"
  end

  test 'sets hint prompt attempts threshold in options for level in csf script' do
    @script = create :csf_script
    @level = create :level
    @lesson = create :lesson
    @script_level = create :script_level, levels: [@level], lesson: @lesson
    @level.hint_prompt_attempts_threshold = 6
    level_options = {}
    set_hint_prompt_options(level_options)
    assert_equal level_options[:hintPromptAttemptsThreshold], @level.hint_prompt_attempts_threshold
  end

  test 'sets hint prompt attempts threshold in options to default if not already set' do
    @script = create :csf_script
    @level = create :level
    @lesson = create :lesson
    @script_level = create :script_level, levels: [@level], lesson: @lesson
    level_options = {}
    set_hint_prompt_options(level_options)
    assert_equal level_options[:hintPromptAttemptsThreshold], 6.5
  end

  test 'does not set hint prompt attempts threshold in options for level in csp script' do
    @script = create :csp_script
    @level = create :level
    @lesson = create :lesson
    @script_level = create :script_level, levels: [@level], lesson: @lesson
    @level.hint_prompt_attempts_threshold = 6
    level_options = {}
    set_hint_prompt_options(level_options)
    assert_nil level_options[:hintPromptAttemptsThreshold]
  end

  test "lab2_options refuses to generate options for non-Lab2 levels" do
    @level = create(:gamelab)
    assert_raises(ArgumentError) do
      lab2_options
    end
  end

  test "lab2_options generates options for Lab2 levels" do
    @level = create(:music)

    channel = 'channel123'
    view_options(channel: channel)
    level_view_options(@level.id, share: true)

    options = lab2_options
    assert_equal channel, options["channel"]
    assert_equal @level.id, options["levelId"]
    assert_equal true, options["share"]

    reset_view_options
  end
end
