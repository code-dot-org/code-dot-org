require 'test_helper'
require 'cdo/script_config'

class ScriptLevelsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers
  include UsersHelper  # For user session state accessors.
  include LevelsHelper  # Test the levels helper stuff here because it has to do w/ routes...
  include ScriptLevelsHelper

  self.use_transactional_test_case = true

  setup_all do
    @student = create :student
    @young_student = create :young_student
    @teacher = create :teacher
    @admin = create :admin
    @section = create :section, user_id: @teacher.id
    Follower.create!(section_id: @section.id, student_user_id: @student.id, user: @teacher)

    @custom_script = create(:script, name: 'laurel', hideable_stages: true)
    @custom_stage_1 = create(:stage, script: @custom_script, name: 'Laurel Stage 1', absolute_position: 1, relative_position: '1')
    @custom_stage_2 = create(:stage, script: @custom_script, name: 'Laurel Stage 2', absolute_position: 2, relative_position: '2')
    @custom_stage_3 = create(:stage, script: @custom_script, name: 'Laurel Stage 3', absolute_position: 3, relative_position: '3')
    @custom_s1_l1 = create(
      :script_level,
      script: @custom_script,
      stage: @custom_stage_1,
      position: 1
    )
    @custom_s2_l1 = create(
      :script_level,
      script: @custom_script,
      stage: @custom_stage_2,
      position: 1
    )
    @custom_s2_l2 = create(
      :script_level,
      script: @custom_script,
      stage: @custom_stage_2,
      position: 2
    )
    create(:script_level, script: @custom_script, stage: @custom_stage_3, position: 1)

    @script = @custom_script
    @script_level = @custom_s1_l1
  end

  setup do
    client_state.reset
    Gatekeeper.clear
  end

  test 'should show script level for twenty hour' do
    get_show_script_level_page(@script_level)
    assert_response :success

    assert_equal @script_level, assigns(:script_level)
  end

  test 'should make script level pages uncachable by default' do
    get_show_script_level_page(@script_level)

    # Make sure the content is not cachable by default
    assert_response :success

    assert_caching_disabled response.headers['Cache-Control']
  end

  test 'should allow public caching for script level pages with default lifetime' do
    ScriptConfig.stubs(:allows_public_caching_for_script).with(@script.name).returns(true)

    # Verify the default max age is used if none is specifically configured.
    get_show_script_level_page(@script_level)
    assert_caching_enabled response.headers['Cache-Control'],
      ScriptLevelsController::DEFAULT_PUBLIC_CLIENT_MAX_AGE,
      ScriptLevelsController::DEFAULT_PUBLIC_PROXY_MAX_AGE
  end

  test 'should allow public caching for script level pages with dynamic lifetime' do
    ScriptConfig.stubs(:allows_public_caching_for_script).with(@script.name).returns(true)
    DCDO.set('public_max_age', 3600)
    DCDO.set('public_proxy_max_age', 7200)
    get_show_script_level_page(@script_level)
    assert_caching_enabled response.headers['Cache-Control'], 3600, 7200
  end

  test 'should make script level pages uncachable if disabled' do
    # Configure the script not to use public caching and make the headers disable caching.
    ScriptConfig.stubs(:allows_public_caching_for_script).with(@script.name).returns(false)
    get_show_script_level_page(@script_level)
    assert_caching_disabled response.headers['Cache-Control']
  end

  def get_show_script_level_page(script_level)
    get :show, params: {
      script_id: script_level.script,
      stage_position: script_level.stage.absolute_position,
      id: script_level.position
    }
  end

  # Asserts that each expected directive is contained in the cache-control header,
  # delimited by commas and optional whitespace
  def assert_cache_control_match(expected_directives, cache_control_header)
    expected_directives.each do |directive|
      assert_match(/(^|,)\s*#{directive}\s*(,|$)/, cache_control_header)
    end
  end

  def assert_caching_disabled(cache_control_header)
    expected_directives = [
      'no-cache',
      'no-store',
      'must-revalidate',
      'max-age=0'
    ]
    assert_cache_control_match expected_directives, cache_control_header
  end

  def assert_caching_enabled(cache_control_header, max_age, proxy_max_age)
    expected_directives = [
      'public',
      "max-age=#{max_age}",
      "s-maxage=#{proxy_max_age}"
    ]
    assert_cache_control_match expected_directives, cache_control_header
  end

  test 'should not log an activity monitor start for netsim' do
    allthethings_script = Script.find_by_name('allthethings')
    netsim_level = allthethings_script.levels.find {|level| level.game == Game.netsim}
    netsim_script_level = allthethings_script.script_levels.find {|script_level| script_level.level_id == netsim_level.id}
    get :show, params: {
      script_id: allthethings_script,
      stage_position: netsim_script_level.stage.relative_position,
      id: netsim_script_level.position
    }
    assert_response :success

    assert_equal netsim_script_level, assigns(:script_level)
  end

  test "should show script level of ECSPD if signed in" do
    sign_in @student
    get :show, params: {script_id: 'ECSPD', stage_position: 1, id: 1}
    assert_response :success
  end

  test "should not get show of ECSPD if not signed in" do
    get :show, params: {script_id: 'ECSPD', stage_position: 1, id: 1}
    assert_redirected_to_sign_in
  end

  test 'project template level sets start blocks when defined' do
    template_level = create :level
    template_level.start_blocks = '<xml/>'
    template_level.save!

    real_level = create :level
    real_level.project_template_level_name = template_level.name
    real_level.start_blocks = "<should:override/>"
    real_level.save!

    sl = create :script_level, levels: [real_level]
    get :show, params: {script_id: sl.script, stage_position: '1', id: '1'}

    assert_response :success
    # start blocks comes from project_level not real_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<xml/>', level_options['startBlocks']
  end

  test 'project template level does not set start blocks when not defined' do
    template_level = create :level
    template_level.save!

    real_level = create :level
    real_level.project_template_level_name = template_level.name
    real_level.start_blocks = "<shouldnot:override/>"
    real_level.save!

    sl = create :script_level, levels: [real_level]
    get :show, params: {script_id: sl.script, stage_position: '1', id: '1'}

    assert_response :success
    # start blocks comes from real_level not project_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<shouldnot:override/>', level_options['startBlocks']
  end

  test 'project template level sets start html when defined' do
    template_level = create :applab
    template_level.start_html = '<div><label id="label1">expected html</label></div>'
    template_level.save!

    real_level = create :applab
    real_level.project_template_level_name = template_level.name
    real_level.start_html = '<div><label id="label1">wrong html</label></div>'
    real_level.save!

    sl = create :script_level, levels: [real_level]
    get :show, params: {script_id: sl.script, stage_position: '1', id: '1'}

    assert_response :success
    # start html comes from project_level not real_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<div><label id="label1">expected html</label></div>', level_options['startHtml']
  end

  test 'project template level does not set start html when not defined' do
    template_level = create :applab
    template_level.save!

    real_level = create :applab
    real_level.project_template_level_name = template_level.name
    real_level.start_html = '<div><label id="label1">real_level html</label></div>'
    real_level.save!

    sl = create :script_level, levels: [real_level]
    get :show, params: {script_id: sl.script, stage_position: '1', id: '1'}

    assert_response :success
    # start html comes from real_level not project_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<div><label id="label1">real_level html</label></div>', level_options['startHtml']
  end

  test 'project template level sets start animations when defined' do
    template_animations_json = '{"orderedKeys":["expected"],"propsByKey":{"expected":{}}}'
    template_level = create :gamelab
    template_level.start_animations = template_animations_json
    template_level.save!

    real_animations_json = '{"orderedKeys":["wrong"],"propsByKey":{"wrong":{}}}'
    real_level = create :gamelab
    real_level.project_template_level_name = template_level.name
    real_level.start_animations = real_animations_json
    real_level.save!

    sl = create :script_level, levels: [real_level]
    get :show, params: {script_id: sl.script, stage_position: '1', id: '1'}

    assert_response :success
    # start animations comes from project_level not real_level
    level_options = assigns(:level).blockly_level_options
    assert_equal template_animations_json, level_options['startAnimations']
  end

  test 'project template level does not set start animations when not defined' do
    template_level = create :gamelab
    template_level.save!

    real_animations_json = '{"orderedKeys":["expected"],"propsByKey":{"expected":{}}}'
    real_level = create :gamelab
    real_level.project_template_level_name = template_level.name
    real_level.start_animations = real_animations_json
    real_level.save!

    sl = create :script_level, levels: [real_level]
    get :show, params: {script_id: sl.script, stage_position: '1', id: '1'}

    assert_response :success
    # start animations comes from real_level not project_level
    level_options = assigns(:level).blockly_level_options
    assert_equal real_animations_json, level_options['startAnimations']
  end

  test 'project template level sets toolbox blocks when defined' do
    template_level = create :level
    template_level.toolbox_blocks = '<xml><toolbox/></xml>'
    template_level.save!

    real_level = create :level
    real_level.project_template_level_name = template_level.name
    real_level.toolbox_blocks = "<should:override/>"
    real_level.save!

    sl = create :script_level, levels: [real_level]
    get :show, params: {script_id: sl.script, stage_position: '1', id: '1'}

    assert_response :success
    # toolbox blocks comes from project_level not real_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<xml><toolbox/></xml>', level_options['toolbox']
  end

  test 'project template level does not set toolbox blocks when not defined' do
    template_level = create :level
    template_level.save!

    real_level = create :level
    real_level.project_template_level_name = template_level.name
    real_level.toolbox_blocks = "<shouldnot:override/>"
    real_level.save!

    sl = create :script_level, levels: [real_level]
    get :show, params: {script_id: sl.script, stage_position: '1', id: '1'}

    assert_response :success
    # toolbox blocks comes from real_level not project_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<shouldnot:override/>', level_options['toolbox']
  end

  test 'should not show concept video for non-legacy script level' do
    non_legacy_script_level = create(:script_level)
    concept_with_video = Concept.find_by_name('sequence')
    non_legacy_script_level.level.concepts = [concept_with_video]

    get :show, params: {
      script_id: non_legacy_script_level.script,
      stage_position: '1',
      id: '1'
    }

    assert_response :success
    assert_empty assigns(:level).related_videos
  end

  test 'should show specified video for script level with video' do
    non_legacy_script_level = create(:script_level, :with_autoplay_video)
    assert_empty(non_legacy_script_level.level.concepts)
    get :show, params: {
      script_id: non_legacy_script_level.script,
      stage_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_not_nil assigns(:view_options)[:autoplay_video]
  end

  test 'should have autoplay video when never_autoplay_video is false on level' do
    level_with_autoplay_video = create(:script_level, :never_autoplay_video_false)
    get :show, params: {
      script_id: level_with_autoplay_video.script,
      stage_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_not_nil assigns(:view_options)[:autoplay_video]
  end

  test 'should not have autoplay video when never_autoplay_video is true on level' do
    level_with_autoplay_video = create(:script_level, :never_autoplay_video_true)
    get :show, params: {
      script_id: level_with_autoplay_video.script,
      stage_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_nil assigns(:view_options)[:autoplay_video]
  end

  test "shouldn't show autoplay video when already seen" do
    non_legacy_script_level = create(:script_level, :with_autoplay_video)
    client_state.add_video_seen(non_legacy_script_level.level.video_key)
    get :show, params: {
      script_id: non_legacy_script_level.script,
      stage_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_nil assigns(:view_options)[:autoplay_video]
  end

  test 'non-legacy script level with concepts should have related but not autoplay video' do
    non_legacy_script_level = create(:script_level)
    non_legacy_script_level.level.concepts = [create(:concept, :with_video)]
    get :show, params: {
      script_id: non_legacy_script_level.script,
      stage_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_nil assigns(:view_options)[:autoplay_video]
  end

  test "ridiculous chapter number throws NotFound instead of RangeError" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {
        script_id: Script.twenty_hour_script,
        stage_position: '99999999999999999999999999',
        id: '1'
      }
    end

    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {
        script_id: Script.twenty_hour_script,
        stage_position: '1',
        id: '99999999999999999999999999'
      }
    end
  end

  test "updated routing for 20 hour script" do
    sl = ScriptLevel.find_by script: Script.twenty_hour_script, chapter: 3
    assert_equal '/s/20-hour/stage/2/puzzle/2', build_script_level_path(sl)
    assert_routing(
      {method: "get", path: build_script_level_path(sl)},
      {controller: "script_levels", action: "show", script_id: Script::TWENTY_HOUR_NAME, stage_position: sl.stage.to_param, id: sl.to_param}
    )
  end

  test "chapter based routing" do
    assert_routing(
      {method: "get", path: '/hoc/reset'},
      {controller: "script_levels", action: "reset", script_id: Script::HOC_NAME}
    )

    hoc_level = ScriptLevel.find_by(script_id: Script.get_from_cache(Script::HOC_NAME).id, chapter: 1)
    assert_routing(
      {method: "get", path: '/hoc/1'},
      {controller: "script_levels", action: "show", script_id: Script::HOC_NAME, chapter: "1"}
    )
    assert_equal '/hoc/1', build_script_level_path(hoc_level)

    flappy_level = ScriptLevel.find_by(script_id: Script.get_from_cache(Script::FLAPPY_NAME).id, chapter: 5)
    assert_routing(
      {method: "get", path: '/flappy/5'},
      {controller: "script_levels", action: "show", script_id: Script::FLAPPY_NAME, chapter: "5"}
    )
    assert_equal "/flappy/5", build_script_level_path(flappy_level)

    jigsaw_level = ScriptLevel.find_by(script_id: Script.get_from_cache(Script::JIGSAW_NAME).id, chapter: 3)
    assert_routing(
      {method: "get", path: '/jigsaw/3'},
      {controller: "script_levels", action: "show", script_id: Script::JIGSAW_NAME, chapter: "3"}
    )
    assert_equal "/s/jigsaw/stage/1/puzzle/3", build_script_level_path(jigsaw_level)
  end

  test "routing for custom scripts with stage" do
    assert_routing(
      {method: "get", path: "/s/laurel/stage/1/puzzle/1"},
      {controller: "script_levels", action: "show", script_id: 'laurel', stage_position: "1", id: "1"}
    )
    assert_equal "/s/laurel/stage/1/puzzle/1", build_script_level_path(@custom_s1_l1)

    assert_routing(
      {method: "get", path: "/s/laurel/stage/2/puzzle/1"},
      {controller: "script_levels", action: "show", script_id: 'laurel', stage_position: "2", id: "1"}
    )
    assert_equal "/s/laurel/stage/2/puzzle/1", build_script_level_path(@custom_s2_l1)

    assert_routing(
      {method: "get", path: "/s/laurel/stage/2/puzzle/2"},
      {controller: "script_levels", action: "show", script_id: 'laurel', stage_position: "2", id: "2"}
    )
    assert_equal "/s/laurel/stage/2/puzzle/2", build_script_level_path(@custom_s2_l2)
  end

  test "build_script_level_url" do
    assert_equal "/s/laurel/stage/1/puzzle/1", build_script_level_path(@custom_s1_l1)
    assert_equal "http://test.host/s/laurel/stage/1/puzzle/1", build_script_level_url(@custom_s1_l1)
  end

  test "next routing for custom scripts" do
    assert_routing(
      {method: "get", path: "/s/laurel/next"},
      {controller: "script_levels", action: "next", script_id: 'laurel'}
    )
    assert_equal "/s/laurel/next", script_next_path(@custom_script)
  end

  test "next redirects to next level for custom scripts" do
    get :next, params: {script_id: 'laurel'}
    assert_redirected_to "/s/laurel/stage/#{@custom_s1_l1.stage.absolute_position}/puzzle/#{@custom_s1_l1.position}"
  end

  test "next redirects to first non-unplugged level for custom scripts" do
    custom_script = create(:script, name: 'coolscript')
    unplugged_stage = create(:stage, script: custom_script, name: 'unplugged stage', absolute_position: 1)
    create(:script_level, levels: [create(:unplugged)], script: custom_script, stage: unplugged_stage, position: 1)
    plugged_stage = create(:stage, script: custom_script, name: 'plugged stage', absolute_position: 2)
    create(:script_level, script: custom_script, stage: plugged_stage, position: 1)

    get :next, params: {script_id: 'coolscript'}
    assert_redirected_to "/s/coolscript/stage/2/puzzle/1"
  end

  test "next when logged in redirects to first non-unplugged non-finished level" do
    sign_in @student

    custom_script = create(:script, name: 'coolscript')
    custom_stage_1 = create(:stage, script: custom_script, name: 'neat stage', absolute_position: 1)
    first_level = create(:script_level, script: custom_script, stage: custom_stage_1, position: 1)
    UserLevel.create(user: @student, level: first_level.level, script: custom_script, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    second_level = create(:script_level, script: custom_script, stage: custom_stage_1, position: 2)
    UserLevel.create(user: @student, level: second_level.level, script: custom_script, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    create(:script_level, levels: [create(:unplugged)], script: custom_script, stage: custom_stage_1, position: 3)
    last_level = create(:script_level, script: custom_script, stage: custom_stage_1, position: 4)

    get :next, params: {script_id: 'coolscript'}
    assert_redirected_to "/s/coolscript/stage/#{last_level.stage.absolute_position}/puzzle/#{last_level.position}"
  end

  test "next skips entire unplugged stage" do
    custom_script = create(:script, name: 'coolscript')
    unplugged_stage = create(:stage, script: custom_script, name: 'unplugged stage', absolute_position: 1)
    create(:script_level, levels: [create(:unplugged)], script: custom_script, stage: unplugged_stage, position: 1)
    create(:script_level, script: custom_script, stage: unplugged_stage, position: 2)
    create(:script_level, script: custom_script, stage: unplugged_stage, position: 3)
    plugged_stage = create(:stage, script: custom_script, name: 'plugged stage', absolute_position: 2)
    create(:script_level, script: custom_script, stage: plugged_stage, position: 1)

    get :next, params: {script_id: 'coolscript'}
    assert_redirected_to "/s/coolscript/stage/2/puzzle/1"
  end

  test "next when only unplugged level goes back to home" do
    custom_script = create(:script, name: 'coolscript')
    custom_stage_1 = create(:stage, script: custom_script, name: 'neat stage', absolute_position: 1)
    create(:script_level, levels: [create(:unplugged)], script: custom_script, stage: custom_stage_1, position: 1)

    assert_raises RuntimeError do
      get :next, params: {script_id: 'coolscript'}
    end
  end

  test "show redirects to canonical url for hoc" do
    get :show, params: {
      script_id: Script::HOC_NAME,
      stage_position: '1',
      id: '2'
    }

    assert_response 301 # moved permanently
    assert_redirected_to '/hoc/2'
  end

  test "should show special script level by chapter" do
    # this works for 'special' scripts like flappy, hoc
    expected_script_level = ScriptLevel.where(script_id: Script.get_from_cache(Script::FLAPPY_NAME).id, chapter: 5).first

    get :show, params: {script_id: Script::FLAPPY_NAME, chapter: '5'}
    assert_response :success

    assert_equal expected_script_level, assigns(:script_level)
  end

  test "show redirects to canonical url for special scripts" do
    get :show, params: {
      script_id: Script::FLAPPY_NAME,
      stage_position: '1',
      id: '2'
    }

    assert_response 301 # moved permanently
    assert_redirected_to '/flappy/2'
  end

  test "should show script level by stage and puzzle position" do
    # this works for custom scripts

    get :show, params: {script_id: @custom_script, stage_position: 2, id: 1}

    assert_response :success

    assert_equal @custom_s2_l1, assigns(:script_level)
  end

  test 'should show new style unplugged level with PDF link' do
    script_level = Script.find_by_name('course1').script_levels.first

    get :show, params: {
      script_id: script_level.script,
      stage_position: script_level.stage.absolute_position,
      id: script_level.position
    }

    assert_response :success

    assert_select 'div.unplugged > h1', 'Happy Maps'
    assert_select 'div.unplugged > p', 'Students create simple algorithms (sets of instructions) to move a character through a maze using a single command.'
    assert_select '.pdf-button', 2

    unplugged_curriculum_path_start = "curriculum/#{script_level.script.name}/#{script_level.stage.absolute_position}"
    assert_select '.pdf-button' do
      assert_select ":match('href', ?)", /.*#{unplugged_curriculum_path_start}.*/
    end

    assert_equal script_level, assigns(:script_level)
  end

  test "show with the reset param should reset session when not logged in" do
    client_state.set_level_progress(create(:script_level), 10)
    refute client_state.level_progress_is_empty_for_test

    get :reset, params: {script_id: Script::HOC_NAME}

    assert_response 200

    assert client_state.level_progress_is_empty_for_test
    refute session['warden.user.user.key']
  end

  test "show with the reset param should not reset session when logged in" do
    sign_in(create(:user))
    get :reset, params: {script_id: Script::HOC_NAME}

    assert_redirected_to hoc_chapter_path(chapter: 1)

    # still logged in
    assert signed_in_user_id
  end

  test "reset routing for custom scripts" do
    assert_routing(
      {method: "get", path: "/s/laurel/reset"},
      {controller: "script_levels", action: "reset", script_id: 'laurel'}
    )
  end

  test "reset resets for custom scripts" do
    client_state.set_level_progress(create(:script_level), 10)
    refute client_state.level_progress_is_empty_for_test

    get :reset, params: {script_id: 'laurel'}
    assert_response 200

    assert client_state.level_progress_is_empty_for_test
    refute session['warden.user.user.key']
  end

  test "reset redirects for custom scripts for signed in users" do
    sign_in(create(:user))

    get :reset, params: {script_id: 'laurel'}
    assert_redirected_to '/s/laurel/stage/1/puzzle/1'
  end

  test "should render blockly partial for blockly levels" do
    script = create(:script)
    level = create(:level, :blockly)
    stage = create(:stage, script: script)
    script_level = create(:script_level, script: script, levels: [level], stage: stage)

    get :show, params: {
      script_id: script,
      stage_position: stage.absolute_position,
      id: script_level.position
    }

    assert_equal script_level, assigns(:script_level)

    assert_template partial: '_blockly'
  end

  test "with callout defined should define callout JS" do
    script = create(:script)
    level = create(:level, :blockly, user_id: nil)
    stage = create(:stage, script: script)
    script_level = create(:script_level, script: script, levels: [level], stage: stage)

    create(:callout, script_level: script_level)

    get :show, params: {
      script_id: script,
      stage_position: stage.absolute_position,
      id: script_level.position
    }

    assert(@response.body.include?('Drag a \"move\" block and snap it below the other block'))
  end

  test 'should render title for puzzle in custom script' do
    get :show, params: {
      script_id: @custom_script.name,
      stage_position: @custom_s2_l1.stage,
      id: @custom_s2_l1.position
    }
    assert_equal 'Code.org [test] - custom-script-laurel: laurel-stage-2 #1',
      Nokogiri::HTML(@response.body).css('title').text.strip
  end

  test 'end of HoC for a user is HOC endpoint' do
    stubs(:current_user).returns(@student)
    assert_equal('//test.code.org/api/hour/finish/hourofcode', script_completion_redirect(Script.find_by_name(Script::HOC_NAME)))
  end

  test 'post script redirect is HOC endpoint' do
    stubs(:current_user).returns(nil)
    assert_equal('//test.code.org/api/hour/finish/hourofcode', script_completion_redirect(Script.find_by_name(Script::HOC_NAME)))
  end

  test 'post script redirect is frozen endpoint' do
    stubs(:current_user).returns(nil)
    assert_equal('//test.code.org/api/hour/finish/frozen', script_completion_redirect(Script.find_by_name(Script::FROZEN_NAME)))
  end

  test 'post script redirect is starwars endpoint' do
    stubs(:current_user).returns(nil)
    assert_equal('//test.code.org/api/hour/finish/starwars', script_completion_redirect(Script.find_by_name(Script::STARWARS_NAME)))
  end

  test 'end of HoC for logged in user works' do
    sign_in(create(:user))
    get :show, params: {script_id: Script::HOC_NAME, chapter: '20'}
    assert_response :success
  end

  test 'end of HoC for anonymous visitor works' do
    get :show, params: {script_id: Script::HOC_NAME, chapter: '20'}
    assert_response :success
  end

  # test 'end of HoC has wrapup video in response' do
  #   get :show, {script_id: Script::HOC_NAME, chapter: '20'}
  #   assert(@response.body.include?('hoc_wrapup'))
  # end

  # test 'end of HoC for signed-in users has no wrapup video, does have stage change info' do
  #   get :show, {script_id: Script::HOC_NAME, chapter: '20'}
  #   assert(!@response.body.include?('hoc_wrapup'))
  #   assert(@response.body.include?('/s/1/level/show?chapter=next'))
  # end

  test 'next for non signed in user' do
    get :next, params: {script_id: Script::HOC_NAME}

    assert_response :redirect
    assert_redirected_to '/hoc/1'
  end

  test 'should show tracking pixel for hoc chapter 1 in prod' do
    set_env :production
    get :show, params: {script_id: Script::HOC_NAME, chapter: 1}

    assert_select 'img[src="//code.org/api/hour/begin_hourofcode.png"]'
  end

  test 'should show tracking pixel for frozen chapter 1 in prod' do
    set_env :production
    get :show, params: {
      script_id: Script::FROZEN_NAME,
      stage_position: 1,
      id: 1
    }
    assert_select 'img[src="//code.org/api/hour/begin_frozen.png"]'
  end

  test 'should show tracking pixel for flappy chapter 1 in prod' do
    set_env :production
    get :show, params: {script_id: Script::FLAPPY_NAME, chapter: 1}
    assert_select 'img[src="//code.org/api/hour/begin_flappy.png"]'
  end

  test 'should show tracking pixel for playlab chapter 1 in prod' do
    set_env :production
    get :show, params: {
      script_id: Script::PLAYLAB_NAME,
      stage_position: 1,
      id: 1
    }
    assert_select 'img[src="//code.org/api/hour/begin_playlab.png"]'
  end

  test "should 404 for invalid chapter for flappy" do
    assert_raises(ActiveRecord::RecordNotFound) do # renders a 404 in prod
      get :show, params: {script_id: 'flappy', chapter: 40000}
    end
  end

  test "should 404 for invalid stage for course1" do
    assert_raises(ActiveRecord::RecordNotFound) do # renders a 404 in prod
      get :show, params: {script_id: 'course1', stage_position: 4000, id: 1}
    end
  end

  test "should 404 for invalid puzzle for course1" do
    assert_raises(ActiveRecord::RecordNotFound) do # renders a 404 in prod
      get :show, params: {script_id: 'course1', stage_position: 1, id: 4000}
    end
  end

  test 'loads state from last attempt' do
    sign_in @student
    # Ensure that activity data from the last attempt is present in the @last_attempt instance variable
    # Used by TextMatch view partial

    last_attempt_data = 'test'
    level = @custom_s1_l1.level
    script = @custom_s1_l1.script
    level_source = LevelSource.find_identical_or_create(level, last_attempt_data)
    UserLevel.create!(script: script, level: level, user: @student, level_source: level_source)

    get :show, params: {
      script_id: @custom_script,
      stage_position: @custom_stage_1.absolute_position,
      id: @custom_s1_l1.position
    }
    assert_equal last_attempt_data, assigns(:last_attempt)
  end

  test 'loads state from students last attempt when you are a teacher viewing your student' do
    sign_in @teacher
    # Ensure that activity data from the last attempt is present in the @last_attempt instance variable
    # Used by TextMatch view partial

    last_attempt_data = 'test'
    level = @custom_s1_l1.level
    level_source = LevelSource.find_identical_or_create(level, last_attempt_data)
    UserLevel.create!(script: @custom_script, level: level, user: @student, level_source: level_source)

    get :show, params: {
      script_id: @custom_script,
      stage_position: @custom_stage_1.absolute_position,
      id: @custom_s1_l1.position,
      user_id: @student.id,
      section_id: @section.id
    }

    assert_equal last_attempt_data, assigns(:last_attempt)
  end

  test 'loads applab if you are a teacher viewing your student and they have a channel id' do
    sign_in @teacher

    user_storage_id = storage_id_for_user_id(@student.id)

    level = create :applab
    script_level = create :script_level, levels: [level]

    create :channel_token, level: level, storage_id: user_storage_id

    get :show, params: {
      script_id: script_level.script,
      stage_position: script_level.stage,
      id: script_level.position,
      user_id: @student.id,
      section_id: @section.id
    }

    assert_select '#codeApp'
    assert_select '#notStarted', 0
  end

  test 'does not load applab if you are a teacher viewing your student and they do not have a channel id' do
    sign_in @teacher

    level = create :applab
    script_level = create :script_level, levels: [level]

    get :show, params: {
      script_id: script_level.script,
      stage_position: script_level.stage,
      id: script_level.position,
      user_id: @student.id,
      section_id: @section.id
    }

    assert_select '#notStarted'
    assert_select '#codeApp', 0
  end

  test 'shows expanded teacher panel when student is chosen' do
    sign_in @teacher

    last_attempt_data = 'test'
    level = @custom_s1_l1.level
    Activity.create!(level: level, user: @student, level_source: LevelSource.find_identical_or_create(level, last_attempt_data))

    get :show, params: {
      script_id: @custom_script,
      stage_position: @custom_stage_1.absolute_position,
      id: @custom_s1_l1.position,
      user_id: @student.id,
      section_id: @section.id
    }

    assert_select '.teacher-panel'
    assert_select '.teacher-panel.hidden', 0

    assert_equal @section, assigns(:section)
    assert_equal @student, assigns(:user)

    assert_equal true, assigns(:view_options)[:readonly_workspace]
    assert_equal true, assigns(:level_view_options_map)[level.id][:skip_instructions_popup]
    assert_equal [], assigns(:view_options)[:callouts]
  end

  test 'shows expanded teacher panel when section is chosen but student is not' do
    sign_in @teacher

    get :show, params: {
      script_id: @custom_script,
      stage_position: @custom_stage_1.absolute_position,
      id: @custom_s1_l1.position,
      section_id: @section.id
    }

    assert_select '.teacher-panel'
    assert_select '.teacher-panel.hidden', 0

    assert_equal @section, assigns(:section)
    assert_nil assigns(:user)
  end

  test 'shows collapsed teacher panel when student not chosen, chooses section when teacher has one section' do
    sign_in @teacher

    get :show, params: {
      script_id: @custom_script,
      stage_position: @custom_stage_1.absolute_position,
      id: @custom_s1_l1.position
    }

    assert_select '.teacher-panel.hidden'

    assert_equal @section, assigns(:section)
    assert_nil assigns(:user)
  end

  test 'chooses section when teacher has multiple sections, but only one unhidden' do
    @section.update!(hidden: true)
    unhidden_section = create :section, user_id: @teacher.id

    sign_in @teacher

    get :show, params: {
      script_id: @custom_script,
      stage_position: @custom_stage_1.absolute_position,
      id: @custom_s1_l1.position
    }

    assert_equal unhidden_section, assigns(:section)
    assert_nil assigns(:user)
  end

  test 'shows collapsed teacher panel when student not chosen, does not choose section when teacher has multiple sections' do
    create :section, user: @teacher

    sign_in @teacher

    get :show, params: {
      script_id: @custom_script,
      stage_position: @custom_stage_1.absolute_position,
      id: @custom_s1_l1.position
    }

    assert_select '.teacher-panel.hidden'

    assert_nil assigns(:section)
    assert_nil assigns(:user)
  end

  test 'teacher tray is not visible for pd and plc scripts' do
    sign_in @teacher

    script = Script.find_by_name('ECSPD')
    assert script.professional_learning_course?

    get :show, params: {script_id: script, stage_position: 1, id: 1}
    assert_select '.teacher-panel', 0

    script = create(:script)
    stage = create(:stage, script: script)
    level = create(:maze)
    create(:script_level, script: script, stage: stage, levels: [level])

    script.update(professional_learning_course: 'Professional Learning Course')
    assert script.professional_learning_course?

    get :show, params: {script_id: script, stage_position: 1, id: 1}
    assert_select '.teacher-panel', 0
  end

  test 'teacher can view solution to non plc script' do
    sl = ScriptLevel.joins(:script, :levels).find_by(
      scripts: {name: 'allthethings'},
      levels:  Level.key_to_params('K-1 Artist1 1')
    )

    assert_routing(
      {method: "get", path: build_script_level_path(sl)},
      {controller: "script_levels", action: "show", script_id: 'allthethings', stage_position: sl.stage.absolute_position.to_s, id: sl.position.to_s, solution: true},
      {},
      {solution: true}
    )

    sign_in @teacher

    get :show, params: {
      script_id: sl.script,
      stage_position: sl.stage,
      id: sl,
      solution: true
    }

    assert_response :success
    assert assigns(:ideal_level_source)

    assert_select '.teacher-panel' # showing teacher panel
    assert_select '.teacher-panel.hidden', 0 # not hidden

    assert_equal true, assigns(:view_options)[:readonly_workspace]
    assert_equal true, assigns(:level_view_options_map)[sl.levels[0].id][:skip_instructions_popup]
    assert_equal [], assigns(:view_options)[:callouts]
  end

  test 'teacher cannot view solution to plc script' do
    sign_in @teacher
    script = create :script
    script.update(professional_learning_course: true)
    stage = create(:stage, script: script)
    level = Artist.first
    script_level = create(:script_level, script: script, stage: stage, levels: [level])

    get :show, params: {
      script_id: script,
      stage_position: stage,
      id: script_level,
      solution: true
    }
    assert_response :forbidden
  end

  test 'student cannot view solution' do
    sl = ScriptLevel.joins(:script, :levels).find_by(
      scripts: {name: 'allthethings'},
      levels: Level.key_to_params('K-1 Artist1 1')
    )

    sign_in @student

    get :show, params: {
      script_id: sl.script,
      stage_position: sl.stage,
      id: sl,
      solution: true
    }
    assert_response :forbidden
  end

  test 'under 13 gets redirected when trying to access applab' do
    sl = ScriptLevel.joins(:script, :levels).find_by(
      scripts: {name: 'allthethings'},
      levels: Level.key_to_params('U3L2 Using Simple Commands')
    )

    sign_in @young_student

    get :show, params: {
      script_id: sl.script,
      stage_position: sl.stage,
      id: sl
    }

    assert_redirected_to '/'
  end

  test 'over 13 does not get redirected when trying to access applab' do
    sl = ScriptLevel.joins(:script, :levels).find_by(
      scripts: {name: 'allthethings'},
      levels: Level.key_to_params('U3L2 Using Simple Commands')
    )

    sign_in @student

    get :show, params: {
      script_id: sl.script,
      stage_position: sl.stage,
      id: sl
    }

    assert_response :success
  end

  test 'submitted view option if submitted' do
    sign_in @student

    last_attempt_data = 'test'
    level = create(:applab, submittable: true)
    script_level = create(:script_level, levels: [level])
    Activity.create!(level: level, user: @student, level_source: LevelSource.find_identical_or_create(level, last_attempt_data))
    ul = UserLevel.create!(level: level, script: script_level.script, user: @student, best_result: ActivityConstants::FREE_PLAY_RESULT, submitted: true)

    get :show, params: {
      script_id: script_level.script,
      stage_position: script_level.stage,
      id: script_level
    }
    assert_response :success

    assert_equal true, assigns(:level_view_options_map)[level.id][:submitted]
    assert_equal "http://test.host/user_levels/#{ul.id}", assigns(:level_view_options_map)[level.id][:unsubmit_url]
  end

  test "should have milestone posting disabled if Milestone is set" do
    Gatekeeper.set('postMilestone', where: {script_name: @script.name}, value: false)
    get_show_script_level_page @script_level
    assert_equal POST_MILESTONE_MODE.final_level_only, assigns(:view_options)[:post_milestone_mode]
  end

  test "should not have milestone posting disabled if Milestone is not set" do
    Gatekeeper.set('postMilestone', where: {script_name: 'Some other level'}, value: false)
    get_show_script_level_page(@script_level)
    assert_equal POST_MILESTONE_MODE.all, assigns(:view_options)[:post_milestone_mode]
  end

  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  test "should not see examples if an unauthorized teacher is signed in" do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    sign_in create(:teacher)

    level = create(:applab, examples: ['fakeexample'])
    Level.any_instance.stubs(:examples).returns(['fakeexample'])

    get_show_script_level_page(create(:script_level, levels: [level]))

    assert_select 'button', text: I18n.t('teacher.panel.example'), count: 0
  end

  test "should see examples if an authorized teacher is signed in" do
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    authorized_teacher = create(:teacher)
    cohort = create(:cohort)
    cohort.teachers << authorized_teacher
    cohort.save!
    assert authorized_teacher.authorized_teacher?
    sign_in authorized_teacher

    level = create(:applab, examples: ['fakeexample'])

    get_show_script_level_page(create(:script_level, levels: [level]))

    assert_select 'button', I18n.t('teacher.panel.example')
  end

  test "logged out can not view teacher markdown" do
    refute can_view_teacher_markdown?
  end

  test "can view CSF teacher markdown as non-authorized teacher" do
    stubs(:current_user).returns(@teacher)
    @script.stubs(:k5_course?).returns(true)
    assert can_view_teacher_markdown?
  end

  test "students can not view CSF teacher markdown" do
    stubs(:current_user).returns(@student)
    @script.stubs(:k5_course?).returns(true)
    refute can_view_teacher_markdown?
  end

  test "should present single available level for single-level scriptlevels" do
    level = create :maze
    get_show_script_level_page(create(:script_level, levels: [level]))

    assert_equal assigns(:level), level
  end

  test "should present first available level if missing properties" do
    level = create :maze
    level2 = create :maze
    get_show_script_level_page(create(:script_level, levels: [level, level2]))

    assert_equal assigns(:level), level
  end

  test "should present first level if active" do
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        levels: [level, level2],
        properties: {variants: {'maze 2': {'active': false}}}
      )
    )
    assert_equal assigns(:level), level
  end

  test "should present second level if first is inactive" do
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false}}}
      )
    )
    assert_equal assigns(:level), level2
  end

  test "should raise if all levels inactive" do
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    assert_raises do
      get_show_script_level_page(
        create(
          :script_level,
          levels: [level, level2],
          properties: {'variants': {'maze 1': {'active': false}, 'maze 2': {'active': false}}}
        )
      )
    end
  end

  test "should present level with activity" do
    sign_in @student
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    level_source = create :level_source, level: level, data: 'level source'
    create :user_level, user: @student, level_id: level.id, attempts: 1,
      level_source: level_source

    get_show_script_level_page(
      create(
        :script_level,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false}}}
      )
    )
    assert_equal assigns(:level), level
  end

  test "should present level with most recent activity" do
    sign_in @student
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    level_source = create :level_source, level: level, data: 'level source'
    level_source2 = create :level_source, level: level2, data: 'level source'
    create :user_level, user: @student, level_id: level2.id, attempts: 1,
      level_source: level_source2, updated_at: '2016-01-01'
    create :user_level, user: @student, level_id: level.id, attempts: 1,
      level_source: level_source, updated_at: '2016-01-02'

    get_show_script_level_page(
      create(
        :script_level,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false}}}
      )
    )
    assert_equal assigns(:level), level
  end

  test "should present experiment level if in the experiment" do
    sign_in @student
    experiment = create :single_user_experiment, min_user_id: @student.id
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false, 'experiments': [experiment.name]}}}
      )
    )
    assert_equal assigns(:level), level
  end

  test "should present experiment level if in the section experiment" do
    sign_in @student
    experiment = create :single_section_experiment, section: @section
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false, 'experiments': [experiment.name]}}}
      )
    )
    assert_equal assigns(:level), level
  end

  test "should present experiment level if in one of the experiments" do
    sign_in @student
    experiment1 = create :single_user_experiment, min_user_id: @student.id + 1
    experiment2 = create :single_user_experiment, min_user_id: @student.id
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false, 'experiments': [experiment1.name, experiment2.name]}}}
      )
    )
    assert_equal assigns(:level), level
  end

  test "should not present experiment level if not in the experiment" do
    sign_in @student
    experiment = create :single_user_experiment, min_user_id: @student.id + 1
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false, 'experiments': [experiment.name]}}}
      )
    )
    assert_equal assigns(:level), level2
  end

  test "hidden_stage_ids for user not signed in" do
    response = get :hidden_stage_ids, params: {script_id: @script.name}
    assert_response :success

    hidden = JSON.parse(response.body)
    assert_equal [], hidden
  end

  test "hidden_stage_ids for user signed in" do
    SectionHiddenStage.create(section_id: @section.id, stage_id: @custom_stage_1.id)

    sign_in @student
    response = get :hidden_stage_ids, params: {script_id: @script.name}
    assert_response :success

    hidden = JSON.parse(response.body)
    assert_equal [@custom_stage_1.id.to_s], hidden
  end

  def put_student_in_section(student, teacher, script)
    section = create :section, user_id: teacher.id, script_id: script.id
    Follower.create!(section_id: section.id, student_user_id: student.id, user: teacher)
    section
  end

  test "teacher can hide and unhide stages in sections they own" do
    teacher = create :teacher
    student = create :student
    sign_in teacher

    section = put_student_in_section(student, teacher, @custom_script)
    stage1 = @custom_script.stages[0]
    assert @custom_script.hideable_stages

    # start with no hidden stages
    assert_equal 0, SectionHiddenStage.where(section_id: section.id).length

    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      stage_id: stage1.id,
      section_id: section.id,
      hidden: true
    }
    assert_response :success
    assert_equal 1, SectionHiddenStage.where(section_id: section.id).length

    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      stage_id: stage1.id,
      section_id: section.id,
      hidden: false
    }
    assert_equal 0, SectionHiddenStage.where(section_id: section.id).length
  end

  test "teacher can hide and unhide scripts in sections they own" do
    teacher = create :teacher
    student = create :student
    sign_in teacher

    section = put_student_in_section(student, teacher, @custom_script)
    assert @custom_script.hideable_stages

    # start with no hidden scripts
    assert_equal 0, SectionHiddenScript.where(section_id: section.id).length
    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      section_id: section.id,
      hidden: true
    }
    assert_equal 1, SectionHiddenScript.where(section_id: section.id).length

    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      section_id: section.id,
      hidden: false
    }
    assert_equal 0, SectionHiddenScript.where(section_id: section.id).length
  end

  test "teacher can't hide stages if script has hideable_stages false" do
    script = create(:script, hideable_stages: false)
    stage = create(:stage, script: script)

    teacher = create :teacher
    student = create :student
    sign_in teacher

    section = put_student_in_section(student, teacher, script)
    refute script.hideable_stages

    post :toggle_hidden, params: {
      script_id: script.id,
      stage_id: stage.id,
      section_id: section.id,
      hidden: true
    }
    assert_response 403
    assert_equal 0, SectionHiddenStage.where(section_id: section.id).length
  end

  test "teacher can't hide or unhide stages in sections they don't own" do
    teacher = create :teacher
    other_teacher = create :teacher
    student = create :student
    sign_in teacher

    section = put_student_in_section(student, other_teacher, @custom_script)
    stage1 = @custom_script.stages[0]
    assert @custom_script.hideable_stages

    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      stage_id: stage1.id,
      section_id: section.id,
      hidden: "true"
    }
    assert_response 403

    # add a SectionHiddenStage directly
    SectionHiddenStage.create(stage_id: stage1.id, section_id: section.id)

    # try to unhide
    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      stage_id: stage1.id,
      section_id: section.id,
      hidden: "false"
    }
    assert_response 403

    assert_equal 1, SectionHiddenStage.where(section_id: section.id).length
  end

  test "teacher can't hide or unhide scripts in sections they don't own" do
    teacher = create :teacher
    other_teacher = create :teacher
    student = create :student
    sign_in teacher

    section = put_student_in_section(student, other_teacher, @custom_script)

    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      section_id: section.id,
      hidden: "true"
    }
    assert_response 403

    # add a SectionHiddenStage directly
    SectionHiddenScript.create(script_id: @custom_script.id, section_id: section.id)

    # try to unhide
    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      section_id: section.id,
      hidden: "false"
    }
    assert_response 403

    assert_equal 1, SectionHiddenScript.where(section_id: section.id).length
  end

  test "should redirect when script has a redirect_to property" do
    script = create :script
    new_script = create :script
    create(:script_level, script: script)
    create(:script_level, script: script)
    create(:script_level, script: new_script)
    script.update(redirect_to: new_script.name)

    get :show, params: {script_id: script.name, stage_position: '1', id: '2'}
    assert_redirected_to "/s/#{new_script.name}/stage/1/puzzle/1"
  end

  test "should indicate challenge levels as challenge levels" do
    script_level = create :script_level,
      properties: {challenge: true}
    get :show, params: {
      script_id: script_level.script,
      stage_position: 1,
      id: '1',
    }
    assert_response :success
    assert_not_nil assigns(:view_options)[:is_challenge_level]
  end

  test "should not indicate non-challenge levels as challenge levels" do
    script_level = create :script_level
    get :show, params: {
      script_id: script_level.script,
      stage_position: 1,
      id: '1',
    }
    assert_response :success
    assert_nil assigns(:view_options)[:is_challenge_level]
  end
end
