require 'test_helper'

class LevelsHelperTest < ActionView::TestCase
  include Devise::Test::ControllerHelpers

  def sign_in(user)
    # override the default sign_in helper because we don't actually have a request or anything here
    stubs(:current_user).returns user
  end

  setup do
    @level = create(:maze, level_num: 'custom')

    def request
      OpenStruct.new(
        env: {},
        headers: OpenStruct.new('User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36'),
        ip: '1.2.3.4'
      )
    end

    stubs(:current_user).returns nil
    stubs(:storage_decrypt_channel_id).returns([123, 456])
  end

  test "blockly_options refuses to generate options for non-blockly levels" do
    @level = create(:match)
    assert_raises(ArgumentError) do
      blockly_options
    end
  end

  test "should parse maze level with non string array" do
    @level.properties["maze"] = [[0, 0], [2, 3]]
    options = blockly_options
    assert options[:level]["map"].is_a?(Array), "Maze is not an array"

    reset_view_options

    @level.properties["maze"] = @level.properties["maze"].to_s
    options = blockly_options
    assert options[:level]["map"].is_a?(Array), "Maze is not an array"
  end

  test "non-custom level displays localized instruction after locale switch" do
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

  test "custom level displays english instruction" do
    default_locale = 'en-US'
    @level.short_instructions = "English instructions"

    I18n.locale = default_locale
    options = blockly_options
    refute_nil options[:level]['shortInstructions']
    assert_equal @level.short_instructions, options[:level]['shortInstructions']
  end

  test "custom level displays localized instruction if exists" do
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
    @level = create(:level, :blockly, user_id: nil)
    stage = create(:lesson, script: script)
    @script_level = create(:script_level, script: script, levels: [@level], lesson: stage)

    callout1 = create(:callout, script_level: @script_level)
    callout2 = create(:callout, script_level: @script_level)
    irrelevant_callout = create(:callout)

    callouts = select_and_remember_callouts

    assert callouts.any? {|callout| callout['id'] == callout1.id}
    assert callouts.any? {|callout| callout['id'] == callout2.id}
    assert callouts.none? {|callout| callout['id'] == irrelevant_callout.id}
  end

  test "should localize callouts" do
    script = create(:script)
    @level = create(:level, :blockly, user_id: nil)
    stage = create(:lesson, script: script)
    @script_level = create(:script_level, script: script, levels: [@level], lesson: stage)

    create(:callout, script_level: @script_level, localization_key: 'run')

    callouts = select_and_remember_callouts

    assert callouts.any? {|c| c['localized_text'] == 'Hit "Run" to try your program'}
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

  test 'app_options sets a channel' do
    user = create :user
    sign_in user

    channel = get_channel_for(@level)
    # Request it again, should get the same channel
    assert_equal channel, get_channel_for(@level)

    # Request it for a different level, should get a different channel
    level = create(:level, :blockly)
    assert_not_equal channel, get_channel_for(level)
  end

  test 'applab levels should have channels' do
    user = create :user
    sign_in user

    @level = create :applab
    assert_not_nil app_options['channel']
  end

  test 'applab levels should not load channel when viewing student solution of a student without a channel' do
    # two different users
    @user = create :user
    sign_in create(:user)

    @level = create :applab

    # channel does not exist
    assert_nil get_channel_for(@level, @user)
  end

  test 'applab levels should load channel when viewing student solution of a student with a channel' do
    # two different users
    @user = create :user
    sign_in create(:user)

    @level = create :applab

    # channel exists
    create :channel_token, level: @level, storage_id: storage_id_for_user_id(@user.id)
    assert_not_nil get_channel_for(@level, @user)

    # calling app_options should set readonly_workspace, since we're viewing for
    # different user
    app_options
    assert_equal true, view_options[:readonly_workspace]
  end

  test 'applab levels should include pairing_driver and pairing_channel_id when viewed by navigator' do
    @level = create :applab
    @driver = create :student
    @navigator = create :student
    create_applab_progress_for_pair @level, @driver, @navigator

    # "Load the level" as the navigator
    sign_in @navigator
    assert_not_nil app_options[:level]['pairingDriver']
    assert_not_nil app_options[:level]['pairingChannelId']

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
    assert_nil app_options[:level]['pairingDriver']
    assert_nil app_options[:level]['pairingChannelId']
  end

  def create_applab_progress_for_pair(level, driver, navigator)
    driver_user_level = create :user_level, user: driver, level: level
    navigator_user_level = create :user_level, user: navigator, level: level
    driver_user_level.navigator_user_levels << navigator_user_level
    create :channel_token, level: level, storage_id: storage_id_for_user_id(driver.id)
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

    assert_not app_options[:level]['submittable']
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
    assert_not can_view_solution?

    sign_out user
    user = create :levelbuilder
    sign_in user
    assert can_view_solution?

    @script.update(name: 'algebra')
    assert_not can_view_solution?

    @script.update(name: 'some pd script')
    @script_level = nil
    assert_not can_view_solution?

    @script_level = create(:script_level, levels: [@level], script: @script)
    @level.update(ideal_level_source_id: nil)
    assert_not can_view_solution?
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
    assert_not can_view_solution?

    sign_out user
    assert_not can_view_solution?
  end

  test 'build_script_level_path differentiates lockable and non-lockable' do
    # (position 1) Lockable 1
    # (position 2) Non-Lockable 1
    # (position 3) Lockable 2
    # (position 4) Lockable 3
    # (position 5) Non-Lockable 2

    input_dsl = <<~DSL
      lesson 'Lockable1', display_name: 'Lockable1',
        lockable: true;
      assessment 'LockableAssessment1';

      lesson 'Nonockable1', display_name: 'NonLockable1'
      assessment 'NonLockableAssessment1';

      lesson 'Lockable2', display_name: 'Lockable2',
        lockable: true;
      assessment 'LockableAssessment2';

      lesson 'Lockable3', display_name: 'Lockable3',
        lockable: true;
      assessment 'LockableAssessment3';

      lesson 'Nonockable2', display_name: 'NonLockable2'
      assessment 'NonLockableAssessment2';
    DSL

    create :level, name: 'LockableAssessment1'
    create :level, name: 'NonLockableAssessment1'
    create :level, name: 'LockableAssessment2'
    create :level, name: 'LockableAssessment3'
    create :level, name: 'NonLockableAssessment2'

    script_data, _ = ScriptDSL.parse(input_dsl, 'a filename')

    script = Script.add_script(
      {name: 'test_script'},
      script_data[:lesson_groups]
    )

    stage = script.lessons[0]
    assert_equal 1, stage.absolute_position
    assert_equal 1, stage.relative_position
    assert_equal '/s/test_script/lockable/1/puzzle/1', build_script_level_path(stage.script_levels[0], {})
    assert_equal '/s/test_script/lockable/1/puzzle/1/page/1', build_script_level_path(stage.script_levels[0], {puzzle_page: '1'})

    stage = script.lessons[1]
    assert_equal 2, stage.absolute_position
    assert_equal 1, stage.relative_position
    assert_equal '/s/test_script/stage/1/puzzle/1', build_script_level_path(stage.script_levels[0], {})
    assert_equal '/s/test_script/stage/1/puzzle/1/page/1', build_script_level_path(stage.script_levels[0], {puzzle_page: '1'})

    stage = script.lessons[2]
    assert_equal 3, stage.absolute_position
    assert_equal 2, stage.relative_position
    assert_equal '/s/test_script/lockable/2/puzzle/1', build_script_level_path(stage.script_levels[0], {})
    assert_equal '/s/test_script/lockable/2/puzzle/1/page/1', build_script_level_path(stage.script_levels[0], {puzzle_page: '1'})

    stage = script.lessons[3]
    assert_equal 4, stage.absolute_position
    assert_equal 3, stage.relative_position
    assert_equal '/s/test_script/lockable/3/puzzle/1', build_script_level_path(stage.script_levels[0], {})
    assert_equal '/s/test_script/lockable/3/puzzle/1/page/1', build_script_level_path(stage.script_levels[0], {puzzle_page: '1'})

    stage = script.lessons[4]
    assert_equal 5, stage.absolute_position
    assert_equal 2, stage.relative_position
    assert_equal '/s/test_script/stage/2/puzzle/1', build_script_level_path(stage.script_levels[0], {})
    assert_equal '/s/test_script/stage/2/puzzle/1/page/1', build_script_level_path(stage.script_levels[0], {puzzle_page: '1'})
  end

  test 'build_script_level_path uses names for bonus levels to support cross-environment links' do
    input_dsl = <<~DSL
      lesson 'Test bonus level links', display_name: 'Test bonus level links'
      level 'Level1'
      level 'BonusLevel1', bonus: true
    DSL

    create :level, name: 'Level1'
    create :level, name: 'BonusLevel1'

    script_data, _ = ScriptDSL.parse(input_dsl, 'test_bonus_level_links')

    script = Script.add_script(
      {name: 'test_bonus_level_links'},
      script_data[:lesson_groups]
    )

    bonus_script_level = script.lessons.first.script_levels[1]
    uri = URI(build_script_level_path(bonus_script_level, {}))
    assert_equal '/s/test_bonus_level_links/stage/1/extras', uri.path

    query_params = CGI.parse(uri.query)
    assert_equal bonus_script_level.level.name, query_params['level_name'].first
  end

  test 'build_script_level_path handles bonus levels with or without solutions' do
    input_dsl = <<~DSL
      lesson 'My cool stage', display_name: 'My cool stage'
      level 'Level1'
      level 'Level2'
      level 'BonusLevel1', bonus: true
      level 'BonusLevel2', bonus: true
    DSL

    create :level, name: 'Level1'
    create :level, name: 'Level2'
    create :level, name: 'BonusLevel1'
    create :level, name: 'BonusLevel2'

    script_data, _ = ScriptDSL.parse(input_dsl, 'my_cool_script')

    script = Script.add_script(
      {name: 'my_cool_script'},
      script_data[:lesson_groups]
    )

    stage = script.lessons[0]

    sl = stage.script_levels[2]
    uri = URI(build_script_level_path(sl, {}))
    query_params = CGI.parse(uri.query)
    assert_equal '/s/my_cool_script/stage/1/extras', uri.path
    assert_equal sl.level.name, query_params['level_name'].first
    assert_nil query_params['solution'].first

    sl = stage.script_levels[3]
    uri = URI(build_script_level_path(sl, {solution: true}))
    query_params = CGI.parse(uri.query)
    assert_equal '/s/my_cool_script/stage/1/extras', uri.path
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
    assert_not include_multi_answers?(standalone)
  end

  test 'section first_activity_at should not be nil when finding experiments' do
    Experiment.stubs(:should_cache?).returns true
    teacher = create(:teacher)
    experiment = create(:teacher_based_experiment,
      earliest_section_at: DateTime.now - 1.day,
      latest_section_at: DateTime.now + 1.day,
      percentage: 100,
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

  test 'block options are localized' do
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
      "<xml><xml><block type=\"embedded_block\"/></xml></xml>"\
      "<div id=\"codeWorkspace\" style=\"display: none\"></div>"\
      "<style>.blocklySvg { background: none; }</style>"\
      "<script src=\"/assets/js/blockly.js\"></script>"\
      "<script src=\"/assets/js/en_us/blockly_locale.js\"></script>"\
      "<script src=\"/assets/js/common.js\"></script>"\
      "<script src=\"/assets/js/en_us/maze_locale.js\"></script>"\
      "<script src=\"/assets/js/maze.js\" data-appoptions=\"{&quot;readonly&quot;:true,&quot;embedded&quot;:true,&quot;locale&quot;:&quot;en_us&quot;,&quot;baseUrl&quot;:&quot;/blockly/&quot;,&quot;blocks&quot;:&quot;\\u003cxml\\u003e\\u003c/xml\\u003e&quot;,&quot;dialog&quot;:{},&quot;nonGlobal&quot;:true}\"></script>"\
      "<script src=\"/assets/js/embedBlocks.js\"></script>"

    unstub(:request)
  end

  test 'render_multi_or_match_content can generate iframes' do
    test_level = create :level,
      name: "embedded iframe test"

    assert_equal render_multi_or_match_content("embedded iframe test.level"),
      "<div class=\"aspect-ratio\">"\
      "<iframe src=\"/levels/#{test_level.id}/embed_level\" width=\"100%\" scrolling=\"no\" seamless=\"seamless\" style=\"border: none;\"></iframe>"\
      "</div>"
  end
end
