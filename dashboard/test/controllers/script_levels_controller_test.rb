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
    @levelbuilder = create(:levelbuilder)
    @project_validator = create :project_validator
    @section = create :section, user_id: @teacher.id
    Follower.create!(section_id: @section.id, student_user_id: @student.id, user: @teacher)

    @custom_script = create(:script, name: 'laurel', hideable_lessons: true)
    @custom_lesson_group = create(:lesson_group, script: @custom_script)
    @custom_lesson_1 = create(:lesson, script: @custom_script, lesson_group: @custom_lesson_group, key: 'Laurel Lesson 1', name: 'Laurel Lesson 1', absolute_position: 1, relative_position: '1')
    @custom_lesson_2 = create(:lesson, script: @custom_script, lesson_group: @custom_lesson_group, key: 'Laurel Lesson 2', name: 'Laurel Lesson 2', absolute_position: 2, relative_position: '2')
    @custom_lesson_3 = create(:lesson, script: @custom_script, lesson_group: @custom_lesson_group, key: 'Laurel Lesson 3', name: 'Laurel Lesson 3', absolute_position: 3, relative_position: '3')
    @custom_s1_l1 = create(
      :script_level,
      script: @custom_script,
      lesson: @custom_lesson_1,
      position: 1
    )
    @custom_s2_l1 = create(
      :script_level,
      script: @custom_script,
      lesson: @custom_lesson_2,
      position: 1
    )
    @custom_s2_l2 = create(
      :script_level,
      script: @custom_script,
      lesson: @custom_lesson_2,
      position: 2
    )
    create(:script_level, script: @custom_script, lesson: @custom_lesson_3, position: 1)

    @script = @custom_script
    @script_level = @custom_s1_l1

    pilot_script = create(:script, pilot_experiment: 'pilot-experiment')
    pilot_lesson_group = create(:lesson_group, script: pilot_script)
    pilot_lesson = create(:lesson, script: pilot_script, lesson_group: pilot_lesson_group)
    @pilot_script_level = create :script_level, script: pilot_script, lesson: pilot_lesson
    @pilot_teacher = create :teacher, pilot_experiment: 'pilot-experiment'
    pilot_section = create :section, user: @pilot_teacher, script: pilot_script
    @pilot_student = create(:follower, section: pilot_section).student_user
  end

  setup do
    client_state.reset
    Gatekeeper.clear
    AzureTextToSpeech.stubs(:get_voices).returns({})
  end

  teardown do
    AzureTextToSpeech.unstub(:get_voices)
  end

  test 'should show script level for csp1-2020 lockable lesson with lesson plan' do
    @unit = create :script, name: 'csp1-2020'
    @lesson_group = create :lesson_group, script: @unit
    @lockable_lesson = create(:lesson, script: @unit, name: 'Assessment Day', lockable: true, lesson_group: @lesson_group, has_lesson_plan: true, absolute_position: 15, relative_position: 14)
    @external = create(:external, name: 'markdown level')
    @external_sl = create(:script_level, script: @unit, lesson: @lockable_lesson, levels: [@external])
    @level_group = create(:level_group, :with_sublevels, name: 'assessment 1')
    @lockable_level_group_sl = create(:script_level, script: @unit, lesson: @lockable_lesson, levels: [@level_group], assessment: true)

    get :show, params: {
      script_id: @unit.name,
      lesson_position: @lockable_lesson.absolute_position - 1,
      id: @external_sl.position
    }

    assert_response :success
    assert_includes @response.body, '/s/csp1-2020/lessons/14/'

    get :show, params: {
      script_id: @unit.name,
      lesson_position: @lockable_lesson.absolute_position - 1,
      id: @lockable_level_group_sl.position
    }

    assert_redirected_to '/s/csp1-2020/lessons/14/levels/2/page/1'

    get :show, params: {
      script_id: @unit.name,
      lesson_position: @lockable_lesson.absolute_position - 1,
      id: @lockable_level_group_sl.position,
      puzzle_page: 1
    }

    assert_redirected_to '/s/csp1-2020/lessons/14/levels/2/page/1'
  end

  test 'should show script level for csp2-2020 lockable lesson with lesson plan' do
    @unit = create :script, name: 'csp2-2020'
    @lesson_group = create :lesson_group, script: @unit
    @lockable_lesson = create(:lesson, script: @unit, name: 'Assessment Day', lockable: true, lesson_group: @lesson_group, has_lesson_plan: true, absolute_position: 9, relative_position: 9)
    @external = create(:external, name: 'markdown level')
    @external_sl = create(:script_level, script: @unit, lesson: @lockable_lesson, levels: [@external])
    @level_group = create(:level_group, :with_sublevels, name: 'assessment 1')
    @lockable_level_group_sl = create(:script_level, script: @unit, lesson: @lockable_lesson, levels: [@level_group], assessment: true)

    get :show, params: {
      script_id: @unit.name,
      lesson_position: @lockable_lesson.absolute_position,
      id: @external_sl.position
    }

    assert_response :success
    assert_includes @response.body, '/s/csp2-2020/lessons/9/'

    get :show, params: {
      script_id: @unit.name,
      lesson_position: @lockable_lesson.absolute_position,
      id: @lockable_level_group_sl.position
    }

    assert_redirected_to '/s/csp2-2020/lessons/9/levels/2/page/1'

    get :show, params: {
      script_id: @unit.name,
      lesson_position: @lockable_lesson.absolute_position,
      id: @lockable_level_group_sl.position,
      puzzle_page: 1
    }

    assert_redirected_to '/s/csp2-2020/lessons/9/levels/2/page/1'
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
    get :show, params: script_level_params(script_level)
  end

  def script_level_params(script_level)
    {
      script_id: script_level.script,
      lesson_position: script_level.lesson.absolute_position,
      id: script_level.position
    }
  end

  test 'should not log an activity monitor start for netsim' do
    allthethings_script = Script.find_by_name('allthethings')
    netsim_level = allthethings_script.levels.find {|level| level.game == Game.netsim}
    netsim_script_level = allthethings_script.script_levels.find {|script_level| script_level.level_id == netsim_level.id}
    get :show, params: {
      script_id: allthethings_script,
      lesson_position: netsim_script_level.lesson.relative_position,
      id: netsim_script_level.position
    }
    assert_response :success

    assert_equal netsim_script_level, assigns(:script_level)
  end

  test "should show script level of ECSPD if signed in" do
    sign_in @student
    get :show, params: {script_id: 'ECSPD', lesson_position: 1, id: 1}
    assert_response :success
  end

  test "should not get show of ECSPD if not signed in" do
    get :show, params: {script_id: 'ECSPD', lesson_position: 1, id: 1}
    assert_redirected_to_sign_in
  end

  test "should render sublevel for BubbleChoice script_level with sublevel_position param" do
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create(:bubble_choice_level, :with_sublevels)
    script_level = create :script_level, script: script, levels: [level], lesson: lesson
    sublevel_position = 1

    get :show, params: {
      script_id: script,
      lesson_position: script_level.lesson.relative_position,
      id: script_level.position,
      sublevel_position: sublevel_position
    }
    assert_response :success
    assert_equal level.sublevels[sublevel_position - 1], assigns(:level)
  end

  test 'project template level sets start blocks when defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_level = create :level
    template_level.start_blocks = '<xml/>'
    template_level.save!

    real_level = create :level
    real_level.project_template_level_name = template_level.name
    real_level.start_blocks = "<should:override/>"
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # start blocks comes from project_level not real_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<xml/>', level_options['startBlocks']
  end

  test 'project template level does not set start blocks when not defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_level = create :level
    template_level.save!

    real_level = create :level
    real_level.project_template_level_name = template_level.name
    real_level.start_blocks = "<shouldnot:override/>"
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # start blocks comes from real_level not project_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<shouldnot:override/>', level_options['startBlocks']
  end

  test 'project template level sets start html when defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_level = create :applab
    template_level.start_html = '<div><label id="label1">expected html</label></div>'
    template_level.save!

    real_level = create :applab
    real_level.project_template_level_name = template_level.name
    real_level.start_html = '<div><label id="label1">wrong html</label></div>'
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # start html comes from project_level not real_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<div><label id="label1">expected html</label></div>', level_options['startHtml']
  end

  test 'project template level does not set start html when not defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_level = create :applab
    template_level.save!

    real_level = create :applab
    real_level.project_template_level_name = template_level.name
    real_level.start_html = '<div><label id="label1">real_level html</label></div>'
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # start html comes from real_level not project_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<div><label id="label1">real_level html</label></div>', level_options['startHtml']
  end

  test 'project template level sets data tables when defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_level = create :applab
    template_level.data_tables = '{"key":"expected"}'
    template_level.data_properties = '{"prop":"expected"}'
    template_level.save!

    real_level = create :applab
    real_level.project_template_level_name = template_level.name
    real_level.data_tables = '{"key":"wrong"}'
    real_level.data_properties = '{"prop":"wrong"}'
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # data tables comes from project_level not real_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '{"key":"expected"}', level_options['dataTables']
    assert_equal '{"prop":"expected"}', level_options['dataProperties']
  end

  test 'project template level does not set data tables when not defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_level = create :applab
    template_level.save!

    real_level = create :applab
    real_level.project_template_level_name = template_level.name
    real_level.data_tables = '{"key":"real"}'
    real_level.data_properties = '{"prop":"real"}'
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # data tables comes from real_level not project_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '{"key":"real"}', level_options['dataTables']
    assert_equal '{"prop":"real"}', level_options['dataProperties']
  end

  test 'project template level sets start animations when defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_animations_json = '{"orderedKeys":["expected"],"propsByKey":{"expected":{}}}'
    template_level = create :gamelab
    template_level.start_animations = template_animations_json
    template_level.save!

    real_animations_json = '{"orderedKeys":["wrong"],"propsByKey":{"wrong":{}}}'
    real_level = create :gamelab
    real_level.project_template_level_name = template_level.name
    real_level.start_animations = real_animations_json
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # start animations comes from project_level not real_level
    level_options = assigns(:level).blockly_level_options
    assert_equal template_animations_json, level_options['startAnimations']
  end

  test 'project template level does not set start animations when not defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_level = create :gamelab
    template_level.save!

    real_animations_json = '{"orderedKeys":["expected"],"propsByKey":{"expected":{}}}'
    real_level = create :gamelab
    real_level.project_template_level_name = template_level.name
    real_level.start_animations = real_animations_json
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # start animations comes from real_level not project_level
    level_options = assigns(:level).blockly_level_options
    assert_equal real_animations_json, level_options['startAnimations']
  end

  test 'project template level sets toolbox blocks when defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_level = create :level
    template_level.toolbox_blocks = '<xml><toolbox/></xml>'
    template_level.save!

    real_level = create :level
    real_level.project_template_level_name = template_level.name
    real_level.toolbox_blocks = "<should:override/>"
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # toolbox blocks comes from project_level not real_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<xml><toolbox/></xml>', level_options['toolbox']
  end

  test 'project template level does not set toolbox blocks when not defined' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    template_level = create :level
    template_level.save!

    real_level = create :level
    real_level.project_template_level_name = template_level.name
    real_level.toolbox_blocks = "<shouldnot:override/>"
    real_level.save!

    sl = create :script_level, levels: [real_level], lesson: lesson, script: script
    get :show, params: {script_id: sl.script, lesson_position: '1', id: '1'}

    assert_response :success
    # toolbox blocks comes from real_level not project_level
    level_options = assigns(:level).blockly_level_options
    assert_equal '<shouldnot:override/>', level_options['toolbox']
  end

  test 'should not show concept video for non-legacy script level' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    non_legacy_script_level = create(:script_level, lesson: lesson, script: script)
    concept_with_video = Concept.find_by_name('sequence')
    non_legacy_script_level.level.concepts = [concept_with_video]

    get :show, params: {
      script_id: non_legacy_script_level.script,
      lesson_position: '1',
      id: '1'
    }

    assert_response :success
    assert_empty assigns(:level).related_videos
  end

  test 'should show specified video for script level with video' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    non_legacy_script_level = create(:script_level, :with_autoplay_video, lesson: lesson, script: script)
    assert_empty(non_legacy_script_level.level.concepts)
    get :show, params: {
      script_id: non_legacy_script_level.script,
      lesson_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_not_nil assigns(:view_options)[:autoplay_video]
  end

  test 'should have autoplay video when never_autoplay_video is false on level' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level_with_autoplay_video = create(:script_level, :never_autoplay_video_false, lesson: lesson, script: script)
    get :show, params: {
      script_id: level_with_autoplay_video.script,
      lesson_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_not_nil assigns(:view_options)[:autoplay_video]
  end

  test 'should not have autoplay video when never_autoplay_video is true on level' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level_with_autoplay_video = create(:script_level, :never_autoplay_video_true, lesson: lesson, script: script)
    get :show, params: {
      script_id: level_with_autoplay_video.script,
      lesson_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_nil assigns(:view_options)[:autoplay_video]
  end

  test "shouldn't show autoplay video when already seen" do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    non_legacy_script_level = create(:script_level, :with_autoplay_video, lesson: lesson, script: script)
    client_state.add_video_seen(non_legacy_script_level.level.video_key)
    get :show, params: {
      script_id: non_legacy_script_level.script,
      lesson_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_nil assigns(:view_options)[:autoplay_video]
  end

  test 'non-legacy script level with concepts should have related but not autoplay video' do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)

    non_legacy_script_level = create(:script_level, lesson: lesson, script: script)
    non_legacy_script_level.level.concepts = [create(:concept, :with_video)]
    get :show, params: {
      script_id: non_legacy_script_level.script,
      lesson_position: '1',
      id: '1'
    }
    assert_response :success
    assert_not_empty assigns(:level).related_videos
    assert_nil assigns(:view_options)[:autoplay_video]
  end

  test "ridiculous chapter number throws NotFound instead of RangeError" do
    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {
        script_id: Script.twenty_hour_unit,
        lesson_position: '99999999999999999999999999',
        id: '1'
      }
    end

    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {
        script_id: Script.twenty_hour_unit,
        lesson_position: '1',
        id: '99999999999999999999999999'
      }
    end
  end

  test "show: redirect to latest stable script version in family for logged out user if one exists" do
    courseg_2017 = create :script, name: 'courseg-2017', family_name: 'courseg', version_year: '2017', is_stable: true
    create :script, name: 'courseg-2018', family_name: 'courseg', version_year: '2018', is_stable: true
    create :script, name: 'courseg-2019', family_name: 'courseg', version_year: '2019'

    courseg_2017_lesson_group_1 = create :lesson_group, script: courseg_2017
    courseg_2017_lesson_1 = create :lesson, script: courseg_2017, lesson_group: courseg_2017_lesson_group_1, name: 'Course G Lesson 1', absolute_position: 1, relative_position: '1'
    courseg_2017_lesson_1_script_level = create :script_level, script: courseg_2017, lesson: courseg_2017_lesson_1, position: 1

    get :show, params: {
      script_id: courseg_2017.name,
      lesson_position: courseg_2017_lesson_1.relative_position,
      id: courseg_2017_lesson_1_script_level.position,
    }

    assert_redirected_to '/s/courseg-2018?redirect_warning=true'
  end

  test "show: redirect to latest assigned script version in family for student if one exists" do
    sign_in @student

    courseg_2017 = create :script, name: 'courseg-2017', family_name: 'courseg', version_year: '2017', is_stable: true
    create :script, name: 'courseg-2018', family_name: 'courseg', version_year: '2018', is_stable: true
    create :script, name: 'courseg-2019', family_name: 'courseg', version_year: '2019'

    courseg_2017_lesson_group_1 = create :lesson_group, script: courseg_2017
    courseg_2017_lesson_1 = create :lesson, script: courseg_2017, lesson_group: courseg_2017_lesson_group_1, name: 'Course G Lesson 1', absolute_position: 1, relative_position: '1'
    courseg_2017_lesson_1_script_level = create :script_level, script: courseg_2017, lesson: courseg_2017_lesson_1, position: 1

    get :show, params: {
      script_id: courseg_2017.name,
      lesson_position: courseg_2017_lesson_1.relative_position,
      id: courseg_2017_lesson_1_script_level.position,
    }
    assert_redirected_to '/s/courseg-2018?redirect_warning=true'

    # Does not redirect if no_redirect query param is provided.
    get :show, params: {
      script_id: courseg_2017.name,
      lesson_position: courseg_2017_lesson_1.relative_position,
      id: courseg_2017_lesson_1_script_level.position,
      no_redirect: "true"
    }
    assert_response :ok
  end

  test "updated routing for 20 hour script" do
    sl = ScriptLevel.find_by script: Script.twenty_hour_unit, chapter: 3
    assert_equal '/s/20-hour/lessons/2/levels/2', build_script_level_path(sl)
    assert_routing(
      {method: "get", path: build_script_level_path(sl)},
      {controller: "script_levels", action: "show", script_id: Script::TWENTY_HOUR_NAME, lesson_position: sl.lesson.to_param, id: sl.to_param}
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
    assert_equal "/s/jigsaw/lessons/1/levels/3", build_script_level_path(jigsaw_level)
  end

  test "routing for custom scripts with lesson" do
    assert_routing(
      {method: "get", path: "/s/laurel/lessons/1/levels/1"},
      {controller: "script_levels", action: "show", script_id: 'laurel', lesson_position: "1", id: "1"}
    )
    assert_equal "/s/laurel/lessons/1/levels/1", build_script_level_path(@custom_s1_l1)

    assert_routing(
      {method: "get", path: "/s/laurel/lessons/2/levels/1"},
      {controller: "script_levels", action: "show", script_id: 'laurel', lesson_position: "2", id: "1"}
    )
    assert_equal "/s/laurel/lessons/2/levels/1", build_script_level_path(@custom_s2_l1)

    assert_routing(
      {method: "get", path: "/s/laurel/lessons/2/levels/2"},
      {controller: "script_levels", action: "show", script_id: 'laurel', lesson_position: "2", id: "2"}
    )
    assert_equal "/s/laurel/lessons/2/levels/2", build_script_level_path(@custom_s2_l2)
  end

  test "build_script_level_url" do
    assert_equal "/s/laurel/lessons/1/levels/1", build_script_level_path(@custom_s1_l1)
    assert_equal "http://test.host/s/laurel/lessons/1/levels/1", build_script_level_url(@custom_s1_l1)
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
    assert_redirected_to "/s/laurel/lessons/#{@custom_s1_l1.lesson.absolute_position}/levels/#{@custom_s1_l1.position}"
  end

  test "next redirects to first non-unplugged level for custom scripts" do
    custom_script = create(:script, name: 'coolscript')
    lesson_group = create(:lesson_group, script: custom_script)
    unplugged_lesson = create(:lesson, script: custom_script, lesson_group: lesson_group, name: 'unplugged lesson', absolute_position: 1)
    create(:script_level, levels: [create(:unplugged)], script: custom_script, lesson: unplugged_lesson, position: 1)
    plugged_lesson = create(:lesson, script: custom_script, lesson_group: lesson_group, name: 'plugged lesson', absolute_position: 2)
    create(:script_level, script: custom_script, lesson: plugged_lesson, position: 1)

    get :next, params: {script_id: 'coolscript'}
    assert_redirected_to "/s/coolscript/lessons/2/levels/1"
  end

  test "next when logged in redirects to first non-unplugged non-finished level" do
    sign_in @student

    custom_script = create(:script, name: 'coolscript')
    lesson_group = create(:lesson_group, script: custom_script)
    custom_lesson_1 = create(:lesson, script: custom_script, lesson_group: lesson_group, name: 'neat lesson', absolute_position: 1)
    first_level = create(:script_level, script: custom_script, lesson: custom_lesson_1, position: 1)
    UserLevel.create(user: @student, level: first_level.level, script: custom_script, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    second_level = create(:script_level, script: custom_script, lesson: custom_lesson_1, position: 2)
    UserLevel.create(user: @student, level: second_level.level, script: custom_script, attempts: 1, best_result: Activity::MINIMUM_PASS_RESULT)
    create(:script_level, levels: [create(:unplugged)], script: custom_script, lesson: custom_lesson_1, position: 3)
    last_level = create(:script_level, script: custom_script, lesson: custom_lesson_1, position: 4)

    get :next, params: {script_id: 'coolscript'}
    assert_redirected_to "/s/coolscript/lessons/#{last_level.lesson.absolute_position}/levels/#{last_level.position}"
  end

  test "next skips entire unplugged lesson" do
    custom_script = create(:script, name: 'coolscript')
    lesson_group = create(:lesson_group, script: custom_script)
    unplugged_lesson = create(:lesson, script: custom_script, lesson_group: lesson_group, name: 'unplugged lesson', absolute_position: 1)
    create(:script_level, levels: [create(:unplugged)], script: custom_script, lesson: unplugged_lesson, position: 1)
    create(:script_level, script: custom_script, lesson: unplugged_lesson, position: 2)
    create(:script_level, script: custom_script, lesson: unplugged_lesson, position: 3)
    plugged_lesson = create(:lesson, script: custom_script, lesson_group: lesson_group, name: 'plugged lesson', absolute_position: 2)
    create(:script_level, script: custom_script, lesson: plugged_lesson, position: 1)

    get :next, params: {script_id: 'coolscript'}
    assert_redirected_to "/s/coolscript/lessons/2/levels/1"
  end

  test "next when only unplugged level goes back to home" do
    custom_script = create(:script, name: 'coolscript')
    lesson_group = create(:lesson_group, script: custom_script)
    custom_lesson_1 = create(:lesson, script: custom_script, lesson_group: lesson_group, name: 'neat lesson', absolute_position: 1)
    create(:script_level, levels: [create(:unplugged)], script: custom_script, lesson: custom_lesson_1, position: 1)

    assert_raises RuntimeError do
      get :next, params: {script_id: 'coolscript'}
    end
  end

  test "show redirects to canonical url for hoc" do
    get :show, params: {
      script_id: Script::HOC_NAME,
      lesson_position: '1',
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
      lesson_position: '1',
      id: '2'
    }

    assert_response 301 # moved permanently
    assert_redirected_to '/flappy/2'
  end

  test "should show script level by lesson and puzzle position" do
    # this works for custom scripts

    get :show, params: {script_id: @custom_script, lesson_position: 2, id: 1}

    assert_response :success

    assert_equal @custom_s2_l1, assigns(:script_level)
  end

  test 'should show new style unplugged level with PDF link' do
    script_level = Script.find_by_name('course1').script_levels.first

    get :show, params: {
      script_id: script_level.script,
      lesson_position: script_level.lesson.absolute_position,
      id: script_level.position
    }

    assert_response :success

    assert_select 'div.unplugged > h1', 'Happy Maps'
    assert_select 'div.unplugged > p', 'Students create simple algorithms (sets of instructions) to move a character through a maze using a single command.'
    assert_select '.pdf-button', 2

    unplugged_curriculum_path_start = "curriculum/#{script_level.script.name}/#{script_level.lesson.absolute_position}"
    assert_select '.pdf-button' do
      assert_select ":match('href', ?)", /.*#{unplugged_curriculum_path_start}.*/
    end

    assert_equal script_level, assigns(:script_level)
  end

  test "show with the login_required param should redirect when not logged in" do
    script_level = Script.find_by_name('courseb-2017').script_levels.first

    get :show, params: {
      script_id: script_level.script,
      lesson_position: script_level.lesson.absolute_position,
      id: script_level.position,
      login_required: "true"
    }

    assert_redirected_to_sign_in
  end

  test "show with the reset param should reset session when not logged in" do
    client_state.set_level_progress(create(:script_level), 10)
    refute client_state.level_progress_is_empty_for_test

    get :reset, params: {script_id: Script::HOC_NAME}

    assert_response 200

    assert client_state.level_progress_is_empty_for_test
    refute session['warden.user.user.key']
  end

  test "show with the reset param should destroy the storage_id cookie when not logged in" do
    get :reset, params: {script_id: Script::HOC_NAME}
    assert_response 200
    # Ensure storage_id is set to empty value and domain is correct
    cookie_header = response.header['Set-Cookie']
    assert cookie_header.include?("#{storage_id_cookie_name}=;")
    assert cookie_header.include?("domain=.test.host;")
  end

  test "show with the reset param should not create a new storage_id cookie when logged in" do
    sign_in(create(:user))

    get :reset, params: {script_id: Script::HOC_NAME}
    assert_response 302
    # Ensure storage_id is not being set
    cookie_header = response.header['Set-Cookie']
    refute cookie_header.include?("#{storage_id_cookie_name}=")
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
    assert_redirected_to '/s/laurel/lessons/1/levels/1'
  end

  test "should render blockly partial for blockly levels" do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    level = create(:level, :blockly)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level = create(:script_level, script: script, levels: [level], lesson: lesson)

    get :show, params: {
      script_id: script,
      lesson_position: lesson.absolute_position,
      id: script_level.position
    }

    assert_equal script_level, assigns(:script_level)

    assert_template partial: '_blockly'
  end

  test "with callout defined should define callout JS" do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    level = create(:level, :blockly, user_id: nil)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level = create(:script_level, script: script, levels: [level], lesson: lesson)

    create(:callout, script_level: script_level)

    get :show, params: {
      script_id: script,
      lesson_position: lesson.absolute_position,
      id: script_level.position
    }

    assert(@response.body.include?('Drag a \"move\" block and snap it below the other block'))
  end

  test 'should render title for puzzle in custom script' do
    get :show, params: {
      script_id: @custom_script.name,
      lesson_position: @custom_s2_l1.lesson,
      id: @custom_s2_l1.position
    }
    assert_equal 'Code.org [test] - custom-script-laurel: laurel-lesson-2 #1',
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

  # test 'end of HoC for signed-in users has no wrapup video, does have lesson change info' do
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
      lesson_position: 1,
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
      lesson_position: 1,
      id: 1
    }
    assert_select 'img[src="//code.org/api/hour/begin_playlab.png"]'
  end

  test "should 404 for invalid chapter for flappy" do
    assert_raises(ActiveRecord::RecordNotFound) do # renders a 404 in prod
      get :show, params: {script_id: 'flappy', chapter: 40000}
    end
  end

  test "should 404 for invalid lesson for course1" do
    assert_raises(ActiveRecord::RecordNotFound) do # renders a 404 in prod
      get :show, params: {script_id: 'course1', lesson_position: 4000, id: 1}
    end
  end

  test "should 404 for invalid puzzle for course1" do
    assert_raises(ActiveRecord::RecordNotFound) do # renders a 404 in prod
      get :show, params: {script_id: 'course1', lesson_position: 1, id: 4000}
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
      lesson_position: @custom_lesson_1.absolute_position,
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
      lesson_position: @custom_lesson_1.absolute_position,
      id: @custom_s1_l1.position,
      user_id: @student.id,
      section_id: @section.id
    }

    assert_equal last_attempt_data, assigns(:last_attempt)
  end

  test 'renders error message when attempting to view a student\'s work while not signed in' do
    # Note that this also applies when trying to view a student's work for a
    # cached page, as we tend to do for high-traffic levels.

    get :show, params: {
      script_id: @script,
      lesson_position: @script_level.lesson,
      id: @script_level.position,
      user_id: @student.id,
      section_id: @section.id
    }

    assert_response :success
    assert_includes response.body, 'Student code cannot be viewed for this activity.'
  end

  test 'loads applab if you are a teacher viewing your student and they have a channel id' do
    sign_in @teacher

    fake_last_attempt = 'STUDENT_LAST_ATTEMPT_SOURCE'

    user_storage_id = storage_id_for_user_id(@student.id)

    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :applab
    script_level = create :script_level, levels: [level], lesson: lesson, script: script
    create(:user_level,
      user: @student,
      script: script_level.script,
      level: script_level.level,
      level_source: create(:level_source, data: fake_last_attempt)
    )

    create :channel_token, level: level, storage_id: user_storage_id

    get :show, params: {
      script_id: script_level.script,
      lesson_position: script_level.lesson,
      id: script_level.position,
      user_id: @student.id,
      section_id: @section.id
    }

    assert_select '#codeApp'
    assert_select '#notStarted', 0
    assert_includes response.body, fake_last_attempt
  end

  test 'loads applab if you are a project validator viewing a student and they have a channel id' do
    sign_in @project_validator

    fake_last_attempt = 'STUDENT_LAST_ATTEMPT_SOURCE'

    user_storage_id = storage_id_for_user_id(@student.id)

    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :applab
    script_level = create :script_level, levels: [level], lesson: lesson, script: script
    create(:user_level,
      user: @student,
      script: script_level.script,
      level: script_level.level,
      level_source: create(:level_source, data: fake_last_attempt)
    )

    create :channel_token, level: level, storage_id: user_storage_id

    get :show, params: {
      script_id: script_level.script,
      lesson_position: script_level.lesson,
      id: script_level.position,
      user_id: @student.id,
      section_id: @section.id
    }

    assert_select '#codeApp'
    assert_select '#notStarted', 0
    assert_includes response.body, fake_last_attempt
  end

  test 'does not load applab if you are viewing a student but do not have permission' do
    sign_in @teacher

    other_student = create :student
    user_storage_id = storage_id_for_user_id(other_student.id)

    fake_last_attempt = 'STUDENT_LAST_ATTEMPT_SOURCE'

    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :applab
    script_level = create :script_level, levels: [level], lesson: lesson, script: script
    create(:user_level,
      user: @student,
      script: script,
      level: level,
      level_source: create(:level_source, data: fake_last_attempt)
    )

    create :channel_token, level: level, storage_id: user_storage_id

    get :show, params: {
      script_id: script_level.script,
      lesson_position: script_level.lesson,
      id: script_level.position,
      user_id: other_student.id,
      section_id: @section.id
    }

    assert_select '#codeApp'
    assert_select '#notStarted', 0
    refute_includes response.body, fake_last_attempt
  end

  test 'loads applab if you are a teacher viewing your student and they do not have a channel id' do
    sign_in @teacher

    fake_last_attempt = 'STUDENT_LAST_ATTEMPT_SOURCE'

    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :applab
    script_level = create :script_level, levels: [level], lesson: lesson, script: script
    create(:user_level,
      user: @student,
      script: script_level.script,
      level: script_level.level,
      level_source: create(:level_source, data: fake_last_attempt)
    )

    get :show, params: {
      script_id: script_level.script,
      lesson_position: script_level.lesson,
      id: script_level.position,
      user_id: @student.id,
      section_id: @section.id
    }

    assert_select '#codeApp'
    assert_select '#notStarted', 0
    assert_includes response.body, fake_last_attempt
  end

  test 'chooses section when teacher has multiple sections, but only one unhidden' do
    @section.update!(hidden: true)
    unhidden_section = create :section, user_id: @teacher.id

    sign_in @teacher

    get :show, params: {
      script_id: @custom_script,
      lesson_position: @custom_lesson_1.absolute_position,
      id: @custom_s1_l1.position
    }

    assert_equal unhidden_section, assigns(:section)
    assert_nil assigns(:user)
  end

  test 'teacher cannot view solution to plc script' do
    sign_in @teacher
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    script.update(professional_learning_course: true)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create(:level, :with_ideal_level_source)
    script_level = create(:script_level, script: script, lesson: lesson, levels: [level])

    get :show, params: {
      script_id: script,
      lesson_position: lesson,
      id: script_level,
      solution: true
    }
    assert_response :forbidden
  end

  test 'student cannot view solution' do
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create(:level, :with_ideal_level_source)
    script_level = create(:script_level, script: script, lesson: lesson, levels: [level])

    sign_in @student

    get :show, params: {
      script_id: script,
      lesson_position: lesson,
      id: script_level,
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
      lesson_position: sl.lesson,
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
      lesson_position: sl.lesson,
      id: sl
    }

    assert_response :success
  end

  test 'submitted view option if submitted' do
    sign_in @student

    last_attempt_data = 'test'
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create(:applab, submittable: true)
    script_level = create(:script_level, levels: [level], lesson: lesson, script: script)
    Activity.create!(level: level, user: @student, level_source: LevelSource.find_identical_or_create(level, last_attempt_data))
    ul = UserLevel.create!(level: level, script: script_level.script, user: @student, best_result: ActivityConstants::FREE_PLAY_RESULT, submitted: true)

    get :show, params: {
      script_id: script,
      lesson_position: lesson,
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
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :maze
    get_show_script_level_page(create(:script_level, levels: [level], lesson: lesson, script: script))

    assert_equal assigns(:level), level
  end

  test "should present first available level if missing properties" do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :maze
    level2 = create :maze
    get_show_script_level_page(create(:script_level, levels: [level, level2], lesson: lesson, script: script))

    assert_equal assigns(:level), level
  end

  test "should present first level if active" do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        lesson: lesson,
        script: script,
        levels: [level, level2],
        properties: {variants: {'maze 2': {'active': false}}}
      )
    )
    assert_equal assigns(:level), level
  end

  test "should present second level if first is inactive" do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        lesson: lesson,
        script: script,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false}}}
      )
    )
    assert_equal assigns(:level), level2
  end

  test "should raise if all levels inactive" do
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    assert_raises do
      get_show_script_level_page(
        create(
          :script_level,
          lesson: lesson,
          script: script,
          levels: [level, level2],
          properties: {'variants': {'maze 1': {'active': false}, 'maze 2': {'active': false}}}
        )
      )
    end
  end

  test "should present level with activity" do
    sign_in @student
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    level_source = create :level_source, level: level, data: 'level source'
    create :user_level, user: @student, level_id: level.id, attempts: 1,
      level_source: level_source

    get_show_script_level_page(
      create(
        :script_level,
        lesson: lesson,
        script: script,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false}}}
      )
    )
    assert_equal assigns(:level), level
  end

  test "should present level with most recent activity" do
    sign_in @student
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
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
        lesson: lesson,
        script: script,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false}}}
      )
    )
    assert_equal assigns(:level), level
  end

  test "should present experiment level if in the experiment" do
    sign_in @student
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    experiment = create :single_user_experiment, min_user_id: @student.id
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        lesson: lesson,
        script: script,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false, 'experiments': [experiment.name]}}}
      )
    )
    assert_equal assigns(:level), level
    experiment.destroy
  end

  test "should present experiment level if in the section experiment" do
    sign_in @student
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    experiment = create :single_section_experiment, section: @section
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        lesson: lesson,
        script: script,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false, 'experiments': [experiment.name]}}}
      )
    )
    assert_equal assigns(:level), level
    experiment.destroy
  end

  test "should present experiment level if in one of the experiments" do
    sign_in @student
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    experiment1 = create :single_user_experiment, min_user_id: @student.id + 1
    experiment2 = create :single_user_experiment, min_user_id: @student.id
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        lesson: lesson,
        script: script,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false, 'experiments': [experiment1.name, experiment2.name]}}}
      )
    )
    assert_equal assigns(:level), level
    experiment1.destroy
    experiment2.destroy
  end

  test "should not present experiment level if not in the experiment" do
    sign_in @student
    script = create(:script)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    experiment = create :single_user_experiment, min_user_id: @student.id + 1
    level = create :maze, name: 'maze 1'
    level2 = create :maze, name: 'maze 2'
    get_show_script_level_page(
      create(
        :script_level,
        lesson: lesson,
        script: script,
        levels: [level, level2],
        properties: {'variants': {'maze 1': {'active': false, 'experiments': [experiment.name]}}}
      )
    )
    assert_equal assigns(:level), level2
    experiment.destroy
  end

  test "hidden_lesson_ids for user not signed in" do
    response = get :hidden_lesson_ids, params: {script_id: @script.name}
    assert_response :success

    hidden = JSON.parse(response.body)
    assert_equal [], hidden
  end

  test "hidden_lesson_ids for student signed in" do
    SectionHiddenLesson.create(section_id: @section.id, stage_id: @custom_lesson_1.id)

    sign_in @student
    response = get :hidden_lesson_ids, params: {script_id: @script.name}
    assert_response :success

    hidden = JSON.parse(response.body)
    assert_equal [@custom_lesson_1.id], hidden
  end

  test "hidden_lesson_ids for teacher signed in" do
    SectionHiddenLesson.create(section_id: @section.id, stage_id: @custom_lesson_1.id)

    sign_in @teacher
    response = get :hidden_lesson_ids, params: {script_id: @script.name}
    assert_response :success

    hidden = JSON.parse(response.body)
    expected = {@section.id.to_s => [@custom_lesson_1.id]}
    assert_equal expected, hidden
  end

  def put_student_in_section(student, teacher, script)
    section = create :section, user_id: teacher.id, script_id: script.id
    Follower.create!(section_id: section.id, student_user_id: student.id, user: teacher)
    section
  end

  test "teacher can hide and unhide lessons in sections they own" do
    teacher = create :teacher
    student = create :student
    sign_in teacher

    section = put_student_in_section(student, teacher, @custom_script)
    lesson1 = @custom_script.lessons[0]
    assert @custom_script.hideable_lessons

    # start with no hidden lessons
    assert_equal 0, SectionHiddenLesson.where(section_id: section.id).length

    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      stage_id: lesson1.id,
      section_id: section.id,
      hidden: true
    }
    assert_response :success
    assert_equal 1, SectionHiddenLesson.where(section_id: section.id).length

    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      stage_id: lesson1.id,
      section_id: section.id,
      hidden: false
    }
    assert_equal 0, SectionHiddenLesson.where(section_id: section.id).length
  end

  test "teacher can hide and unhide scripts in sections they own" do
    teacher = create :teacher
    student = create :student
    sign_in teacher

    section = put_student_in_section(student, teacher, @custom_script)
    assert @custom_script.hideable_lessons

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

  test "teacher can't hide lessons if script has hideable_lessons false" do
    script = create(:script, hideable_lessons: false)
    lesson = create(:lesson, script: script)

    teacher = create :teacher
    student = create :student
    sign_in teacher

    section = put_student_in_section(student, teacher, script)
    refute script.hideable_lessons

    post :toggle_hidden, params: {
      script_id: script.id,
      stage_id: lesson.id,
      section_id: section.id,
      hidden: true
    }
    assert_response 403
    assert_equal 0, SectionHiddenLesson.where(section_id: section.id).length
  end

  test "teacher can't hide or unhide lessons in sections they don't own" do
    teacher = create :teacher
    other_teacher = create :teacher
    student = create :student
    sign_in teacher

    section = put_student_in_section(student, other_teacher, @custom_script)
    lesson1 = @custom_script.lessons[0]
    assert @custom_script.hideable_lessons

    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      stage_id: lesson1.id,
      section_id: section.id,
      hidden: "true"
    }
    assert_response 403

    # add a SectionHiddenLesson directly
    SectionHiddenLesson.create(stage_id: lesson1.id, section_id: section.id)

    # try to unhide
    post :toggle_hidden, params: {
      script_id: @custom_script.id,
      stage_id: lesson1.id,
      section_id: section.id,
      hidden: "false"
    }
    assert_response 403

    assert_equal 1, SectionHiddenLesson.where(section_id: section.id).length
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

    # add a SectionHiddenLesson directly
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
    lesson_group = create(:lesson_group, script: script)
    new_lesson_group = create(:lesson_group, script: new_script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    new_lesson = create(:lesson, script: new_script, lesson_group: new_lesson_group)
    create(:script_level, script: script, lesson: lesson)
    create(:script_level, script: script, lesson: lesson)
    create(:script_level, script: new_script, lesson: new_lesson)
    script.update(redirect_to: new_script.name)

    get :show, params: {script_id: script.name, lesson_position: '1', id: '2'}
    assert_redirected_to "/s/#{new_script.name}/lessons/1/levels/2"
  end

  test 'should redirect to 2017 version in script family' do
    cats1 = create :script, name: 'cats1', family_name: 'ui-test-versioned-script', version_year: '2017'

    assert_raises ActiveRecord::RecordNotFound do
      get :show, params: {script_id: 'ui-test-versioned-script', lesson_position: 1, id: 1}
    end

    cats1.update!(is_stable: true)
    get :show, params: {script_id: 'ui-test-versioned-script', lesson_position: 1, id: 1}
    assert_redirected_to "/s/cats1/lessons/1/levels/1"

    create :script, name: 'cats2', family_name: 'ui-test-versioned-script', version_year: '2018', is_stable: true
    get :show, params: {script_id: 'ui-test-versioned-script', lesson_position: 1, id: 1}
    assert_redirected_to "/s/cats2/lessons/1/levels/1"

    # next redirects to latest version in a script family
    get :next, params: {script_id: 'ui-test-versioned-script'}
    assert_redirected_to "/s/cats2/next"
  end

  test "should indicate challenge levels as challenge levels" do
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level = create :script_level, lesson: lesson, script: script,
      properties: {challenge: true}
    get :show, params: {
      script_id: script_level.script,
      lesson_position: 1,
      id: '1',
    }
    assert_response :success
    assert_not_nil assigns(:view_options)[:is_challenge_level]
  end

  test "should not indicate non-challenge levels as challenge levels" do
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level = create :script_level, lesson: lesson, script: script
    get :show, params: {
      script_id: script_level.script,
      lesson_position: 1,
      id: '1',
    }
    assert_response :success
    assert_nil assigns(:view_options)[:is_challenge_level]
  end

  test "specifying a bonus level name will direct to that level" do
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level = create :script_level, lesson: lesson, script: script
    script_level.bonus = true
    script_level.save!
    get :lesson_extras, params: {
      script_id: script,
      lesson_position: 1,
      level_name: script_level.level.name
    }
    assert_response :success
    assert_equal script_level.level.id, assigns(:view_options)[:server_level_id]
  end

  test "a bonus scriptlevel id takes precedence over level name" do
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level_by_id = create :script_level, lesson: lesson, script: script
    script_level_by_name = create :script_level, lesson: lesson, script: script
    script_level_by_id.bonus = true
    script_level_by_name.bonus = true
    script_level_by_id.save!
    script_level_by_name.save!
    get :lesson_extras, params: {
      script_id: script_level_by_id.script,
      lesson_position: 1,
      id: script_level_by_id.id,
      level_name: script_level_by_name.level.name
    }
    assert_response :success
    assert_equal script_level_by_id.level.id, assigns(:view_options)[:server_level_id]
  end

  test "a bad bonus level name shows extras page" do
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level_by_id = create :script_level, lesson: lesson, script: script
    script_level_by_name = create :script_level, lesson: lesson, script: script
    script_level_by_id.bonus = true
    script_level_by_name.bonus = true
    script_level_by_id.save!
    script_level_by_name.save!
    get :lesson_extras, params: {
      script_id: script_level_by_id.script,
      lesson_position: 1,
      id: script_level_by_id.id,
      level_name: script_level_by_name.level.name + "!!!"
    }
    assert_response :success
  end

  test "lesson extras shows progress for current user if no section and user id" do
    sign_in @student
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level = create :script_level, lesson: lesson, script: script
    script_level.bonus = true
    script_level.save!
    create :user_level, user: @student, script: script, level: script_level.level, best_result: 100
    get :lesson_extras, params: {
      script_id: script_level.script,
      lesson_position: 1
    }
    assert_response :success
    assert_select 'script[data-extras]', 1
    extras_data = JSON.parse(
      css_select('script[data-extras]').first.attribute('data-extras').to_s
    )
    assert extras_data['bonusLevels'][0]['levels'][0]['perfect']
  end

  test "lesson extras shows teacher no progress if no section and user id" do
    sign_in @teacher
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level = create :script_level, lesson: lesson, script: script
    script_level.bonus = true
    script_level.save!
    create :user_level, user: @student, script: script, level: script_level.level, best_result: 100
    get :lesson_extras, params: {
      script_id: script_level.script,
      lesson_position: 1
    }
    assert_response :success
    assert_select 'script[data-extras]', 1
    extras_data = JSON.parse(
      css_select('script[data-extras]').first.attribute('data-extras').to_s
    )
    refute extras_data['bonusLevels'][0]['levels'][0]['perfect']
  end

  test "lesson extras shows teacher progress for student if section and user id" do
    sign_in @teacher
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level = create :script_level, lesson: lesson, script: script
    script_level.bonus = true
    script_level.save!
    create :user_level, user: @student, script: script, level: script_level.level, best_result: 100
    get :lesson_extras, params: {
      script_id: script_level.script,
      lesson_position: 1,
      section_id: @section.id,
      user_id: @student.id
    }
    assert_response :success
    assert_select 'script[data-extras]', 1
    extras_data = JSON.parse(
      css_select('script[data-extras]').first.attribute('data-extras').to_s
    )
    assert extras_data['bonusLevels'][0]['levels'][0]['perfect']
  end

  test "lesson extras shows no progress if no current user" do
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script, lesson_group: lesson_group)
    script_level = create :script_level, lesson: lesson, script: script
    script_level.bonus = true
    script_level.save!
    create :user_level, user: @student, script: script, level: script_level.level, best_result: 100
    get :lesson_extras, params: {
      script_id: script_level.script,
      lesson_position: 1,
      section_id: @section.id,
      user_id: @student.id
    }
    assert_response :success
    assert_select 'script[data-extras]', 1
    extras_data = JSON.parse(
      css_select('script[data-extras]').first.attribute('data-extras').to_s
    )
    refute extras_data['bonusLevels'][0]['levels'][0]['perfect']
  end

  test_user_gets_response_for :show, response: :redirect, user: nil,
    params: -> {script_level_params(@pilot_script_level)},
    name: 'signed out user cannot view pilot script level'

  test_user_gets_response_for :show, response: :forbidden, user: :student,
    params: -> {script_level_params(@pilot_script_level)},
    name: 'student cannot view pilot script level'

  test_user_gets_response_for :show, response: :forbidden, user: :teacher,
    params: -> {script_level_params(@pilot_script_level)},
    name: 'teacher without pilot access cannot view pilot script level'

  test_user_gets_response_for :show, response: :success, user: -> {@pilot_teacher},
    params: -> {script_level_params(@pilot_script_level)},
    name: 'pilot teacher can view pilot script level'

  test_user_gets_response_for :show, response: :success, user: -> {@pilot_student},
    params: -> {script_level_params(@pilot_script_level)},
    name: 'pilot student can view pilot script level'

  test_user_gets_response_for :show, response: :success, user: :levelbuilder,
    params: -> {script_level_params(@pilot_script_level)},
    name: 'levelbuilder can view pilot script level'

  def create_visible_after_script_level
    level = create :maze, name: 'maze 1', level_num: 'custom'
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create :lesson, name: 'lesson 1', script: script, lesson_group: lesson_group, visible_after: '2020-04-01 08:00:00 -0700'
    script_level = create :script_level, levels: [level], lesson: lesson, script: script

    script_level
  end

  class ShowVisibleAfterScriptLevelTests < ActionController::TestCase
    setup do
      @student = create :student
      @teacher = create :teacher
      @levelbuilder = create :levelbuilder

      Timecop.freeze(Time.new(2020, 3, 27, 0, 0, 0, "-07:00"))

      level = create :maze, name: 'maze 1', level_num: 'custom'
      script_with_visible_after_lessons = create :script
      lesson_group = create :lesson_group, script: script_with_visible_after_lessons

      lesson_future_visible_after = create :lesson, name: 'lesson 1', script: script_with_visible_after_lessons, lesson_group: lesson_group, visible_after: '2020-04-01 08:00:00 -0700'
      @script_level_future_visible_after = create :script_level, levels: [level], lesson: lesson_future_visible_after, script: script_with_visible_after_lessons

      lesson_past_visible_after = create :lesson, name: 'lesson 2', script: script_with_visible_after_lessons, lesson_group: lesson_group, visible_after: '2020-03-01 08:00:00 -0700'
      @script_level_past_visible_after = create :script_level, levels: [level], lesson: lesson_past_visible_after, script: script_with_visible_after_lessons

      lesson_no_visible_after = create :lesson, name: 'lesson 3', script: script_with_visible_after_lessons, lesson_group: lesson_group
      @script_level_no_visible_after = create :script_level, levels: [level], lesson: lesson_no_visible_after, script: script_with_visible_after_lessons
    end

    teardown do
      Timecop.return
    end

    test 'levelbuilder can view level in lesson with future visible after date' do
      sign_in @levelbuilder

      get :show, params: {
        script_id: @script_level_future_visible_after.script,
        lesson_position: @script_level_future_visible_after.lesson.absolute_position,
        id: @script_level_future_visible_after.position
      }
      assert_response :success
    end

    test 'levelbuilder can view level in lesson with past visible after date' do
      sign_in @levelbuilder

      get :show, params: {
        script_id: @script_level_past_visible_after.script,
        lesson_position: @script_level_past_visible_after.lesson.absolute_position,
        id: @script_level_past_visible_after.position
      }
      assert_response :success
    end

    test 'teacher can not view level in lesson with future visible after date' do
      sign_in @teacher

      get :show, params: {
        script_id: @script_level_future_visible_after.script,
        lesson_position: @script_level_future_visible_after.lesson.absolute_position,
        id: @script_level_future_visible_after.position
      }
      assert_response :forbidden
    end

    test 'teacher can view level in lesson with past visible after date' do
      sign_in @teacher

      get :show, params: {
        script_id: @script_level_past_visible_after.script,
        lesson_position: @script_level_past_visible_after.lesson.absolute_position,
        id: @script_level_past_visible_after.position
      }
      assert_response :success
    end

    test 'student can not view level in lesson with future visible after date' do
      sign_in @teacher

      get :show, params: {
        script_id: @script_level_future_visible_after.script,
        lesson_position: @script_level_future_visible_after.lesson.absolute_position,
        id: @script_level_future_visible_after.position
      }
      assert_response :forbidden
    end

    test 'student can view level in lesson with past visible after date' do
      sign_in @teacher

      get :show, params: {
        script_id: @script_level_past_visible_after.script,
        lesson_position: @script_level_past_visible_after.lesson.absolute_position,
        id: @script_level_past_visible_after.position
      }
      assert_response :success
    end

    test 'unsigned in user can not view level in lesson with future visible after date' do
      sign_out :user

      get :show, params: {
        script_id: @script_level_future_visible_after.script,
        lesson_position: @script_level_future_visible_after.lesson.absolute_position,
        id: @script_level_future_visible_after.position
      }
      assert_response :forbidden
    end

    test 'unsigned in user can view level in lesson with past visible after date' do
      sign_out :user

      get :show, params: {
        script_id: @script_level_past_visible_after.script,
        lesson_position: @script_level_past_visible_after.lesson.absolute_position,
        id: @script_level_past_visible_after.position
      }
      assert_response :success
    end
  end
end
