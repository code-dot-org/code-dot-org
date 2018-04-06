require 'test_helper'
require 'cdo/shared_constants'

class ScriptTest < ActiveSupport::TestCase
  include SharedConstants

  self.use_transactional_test_case = true

  setup_all do
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    @game = create(:game)
    @script_file = File.join(self.class.fixture_path, "test-fixture.script")
    # Level names match those in 'test.script'
    @levels = (1..5).map {|n| create(:level, name: "Level #{n}", game: @game)}

    @course = create(:course)
    @script_in_course = create(:script, hidden: true)
    create(:course_script, position: 1, course: @course, script: @script_in_course)

    # ensure that we have freshly generated caches with this course/script
    Course.clear_cache
    Script.clear_cache
  end

  def populate_cache_and_disconnect_db
    Script.stubs(:should_cache?).returns true
    # Only need to populate cache once per test-suite run
    @@script_cached ||= Script.script_cache_to_cache
    Script.script_cache

    # Also populate course_cache, as it's used by course_link
    Course.stubs(:should_cache?).returns true
    @@course_cached ||= Course.course_cache_to_cache
    Course.course_cache

    # NOTE: ActiveRecord collection association still references an active DB connection,
    # even when the data is already eager loaded.
    # Best we can do is ensure that no queries are executed on the active connection.
    ActiveRecord::Base.connection.stubs(:execute).raises 'Database disconnected'
  end

  test 'login required setting in script file' do
    file = File.join(self.class.fixture_path, "login_required.script")

    scripts, _ = Script.setup([file])

    script = scripts[0]
    assert script.login_required?
    assert_equal 'Level 1', script.levels[0].name

    assert_equal false, Script.find(2).login_required?

    assert_equal false, create(:script).login_required?
  end

  test 'create script from DSL' do
    scripts, _ = Script.setup([@script_file])
    script = scripts[0]
    assert_equal 'Level 1', script.levels[0].name
    assert_equal 'Stage2', script.script_levels[3].stage.name

    assert_equal 'MyProgression', script.script_levels[3].progression
    assert_equal 'MyProgression', script.script_levels[4].progression
  end

  test 'should not change Script[Level] ID when reseeding' do
    scripts, _ = Script.setup([@script_file])
    script = scripts[0]
    script_id = script.script_levels[4].script_id
    script_level_id = script.script_levels[4].id

    scripts, _ = Script.setup([@script_file])
    assert_equal script_id, scripts[0].script_levels[4].script_id
    assert_equal script_level_id, scripts[0].script_levels[4].id
  end

  test 'should not change Script ID when changing script levels and options' do
    scripts, _ = Script.setup([@script_file])
    script_id = scripts[0].script_levels[4].script_id
    script_level_id = scripts[0].script_levels[4].id

    parsed_script = ScriptDSL.parse_file(@script_file)[0][:stages]

    # Set different level name in tested script
    parsed_script.map {|stage| stage[:scriptlevels]}.flatten[4][:levels][0]['name'] = "Level 1"

    # Set different 'hidden' option from defaults in Script.setup
    options = {name: File.basename(@script_file, ".script"), hidden: false}
    script = Script.add_script(options, parsed_script)
    assert_equal script_id, script.script_levels[4].script_id
    assert_not_equal script_level_id, script.script_levels[4].id
  end

  test 'should remove empty stages' do
    scripts, _ = Script.setup([@script_file])
    assert_equal 2, scripts[0].stages.count

    # Reupload a script of the same filename / name, but lacking the second stage.
    stage = scripts[0].stages.last
    script_file_empty_stage = File.join(self.class.fixture_path, "duplicate_scripts", "test-fixture.script")
    scripts, _ = Script.setup([script_file_empty_stage])
    assert_equal 1, scripts[0].stages.count
    assert_not Stage.exists?(stage.id)
  end

  test 'should remove empty stages, reordering stages' do
    script_file_3_stages = File.join(self.class.fixture_path, "test-fixture-3-stages.script")
    script_file_middle_missing_reversed = File.join(self.class.fixture_path, "duplicate_scripts", "test-fixture-3-stages.script")
    scripts, _ = Script.setup([script_file_3_stages])
    assert_equal 3, scripts[0].stages.count
    first = scripts[0].stages[0]
    second = scripts[0].stages[1]
    third = scripts[0].stages[2]
    assert_equal 'Stage1', first.name
    assert_equal 'Stage2', second.name
    assert_equal 'Stage3', third.name
    assert_equal 1, first.absolute_position
    assert_equal 2, second.absolute_position
    assert_equal 3, third.absolute_position

    # Reupload a script of the same filename / name, but lacking the middle stage.
    scripts, _ = Script.setup([script_file_middle_missing_reversed])
    assert_equal 2, scripts[0].stages.count
    assert_not Stage.exists?(second.id)

    first = scripts[0].stages[0]
    second = scripts[0].stages[1]
    assert_equal 1, first.absolute_position
    assert_equal 2, second.absolute_position
    assert_equal 'Stage3', first.name
    assert_equal 'Stage1', second.name
  end

  test 'should not create two scripts with same name' do
    create(:script, name: 'script')
    raise = assert_raises ActiveRecord::RecordInvalid do
      create(:script, name: 'Script', skip_name_format_validation: true)
    end
    assert_equal 'Validation failed: Name has already been taken', raise.message
  end

  test 'stages are in order' do
    script = create(:script, name: 's1')
    create(:stage, script: script)
    last = create(:stage, script: script)
    create(:stage, script: script)

    last.move_to_bottom

    script.stages

    assert_equal [1, 2, 3], script.stages.collect(&:absolute_position)
  end

  test 'calling next_level on last script_level points to next stage' do
    script = create(:script, name: 'test2')
    first_stage = create(:stage, script: script, absolute_position: 1)

    first_stage_last_level = create(:script_level, script: script, stage: first_stage, position: 1)
    second_stage = create(:stage, script: script, absolute_position: 2)
    second_stage_first_level = create(:script_level, script: script, stage: second_stage, position: 1)
    create(:script_level, script: script, stage: second_stage, position: 2)

    assert_equal second_stage_first_level, first_stage_last_level.next_progression_level
  end

  test 'script_level positions should reset' do
    scripts, _ = Script.setup([@script_file])
    first = scripts[0].stages[0].script_levels[0]
    second = scripts[0].stages[0].script_levels[1]
    assert_equal 1, first.position
    assert_equal 2, second.position
    promoted_level = second.level
    script_file_remove_level = File.join(self.class.fixture_path, "duplicate_scripts", "test-fixture.script")

    scripts, _ = Script.setup([script_file_remove_level])
    new_first_script_level = ScriptLevel.joins(:levels).where(script: scripts[0], levels: {id: promoted_level}).first
    assert_equal 1, new_first_script_level.position
  end

  test 'script import is idempotent w.r.t. positions and count' do
    scripts, _ = Script.setup([@script_file])
    original_count = ScriptLevel.count
    first = scripts[0].stages[0].script_levels[0]
    second = scripts[0].stages[0].script_levels[1]
    third = scripts[0].stages[0].script_levels[2]
    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal 3, third.position
    scripts, _ = Script.setup([@script_file])
    first = scripts[0].stages[0].script_levels[0]
    second = scripts[0].stages[0].script_levels[1]
    third = scripts[0].stages[0].script_levels[2]
    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal 3, third.position
    assert_equal original_count, ScriptLevel.count
  end

  test 'unplugged in script' do
    @script_file = File.join(self.class.fixture_path, 'test-unplugged.script')
    scripts, _ = Script.setup([@script_file])
    assert_equal 'Unplugged', scripts[0].script_levels[1].level['type']
  end

  test 'blockly level in custom script' do
    script_data, _ = ScriptDSL.parse(
      "stage 'Stage1'; level 'Level 1'; level 'blockly:Studio:100'", 'a filename'
   )

    script = Script.add_script({name: 'test script'}, script_data[:stages])

    assert_equal 'Studio', script.script_levels[1].level.game.name
    assert_equal '100', script.script_levels[1].level.level_num
  end

  test 'allow applab and gamelab levels in hidden scripts' do
    Script.add_script(
      {name: 'test script', hidden: true},
      [{scriptlevels: [{levels: [{name: 'New App Lab Project'}]}]}] # From level.yml fixture
    )
    Script.add_script(
      {name: 'test script', hidden: true},
      [{scriptlevels: [{levels: [{name: 'New Game Lab Project'}]}]}] # From level.yml fixture
    )
  end

  test 'allow applab and gamelab levels in login_required scripts' do
    Script.add_script(
      {name: 'test script', hidden: false, login_required: true},
      [{scriptlevels: [{levels: [{name: 'New App Lab Project'}]}]}] # From level.yml fixture
    )
    Script.add_script(
      {name: 'test script', hidden: false, login_required: true},
      [{scriptlevels: [{levels: [{name: 'New Game Lab Project'}]}]}] # From level.yml fixture
    )
  end

  test 'get_script_level_by_relative_position_and_puzzle_position returns nil when not found' do
    artist = Script.find_by_name('artist')
    assert artist.get_script_level_by_relative_position_and_puzzle_position(11, 1, false).nil?
  end

  test 'get_from_cache uses cache' do
    # We test the cache using name lookups...
    flappy = Script.find_by_name('flappy')
    frozen = Script.find_by_name('frozen')
    # ...and ID lookups.
    flappy_id = flappy.id
    frozen_id = frozen.id

    populate_cache_and_disconnect_db

    assert_equal flappy, Script.get_from_cache('flappy')
    assert_equal flappy, Script.get_from_cache(flappy_id)
    assert_equal frozen, Script.get_from_cache('frozen')
    assert_equal frozen, Script.get_from_cache(frozen_id)
  end

  test 'cache_find_script_level uses cache' do
    script_level = Script.first.script_levels.first

    populate_cache_and_disconnect_db

    assert_equal script_level, Script.cache_find_script_level(script_level.id)
  end

  test 'cache_find_level uses cache with ID lookup' do
    level = Script.first.script_levels.first.level

    populate_cache_and_disconnect_db

    assert_equal level, Script.cache_find_level(level.id)
  end

  test 'cache_find_level uses cache with name lookup' do
    level = Script.first.script_levels.first.level

    populate_cache_and_disconnect_db

    assert_equal level, Script.cache_find_level(level.name)
  end

  test 'cache_find_level raises exception on bad ID and bad name' do
    bad_id = Level.last.id + 1

    assert_raises(ActiveRecord::RecordNotFound) do
      Script.cache_find_level(bad_id)
    end
    assert_raises(ActiveRecord::RecordNotFound) do
      Script.cache_find_level('not a level name')
    end
  end

  test 'level uses cache' do
    script_level = Script.first.script_levels.first
    expected_level = script_level.level

    populate_cache_and_disconnect_db

    assert_equal expected_level,
      Script.cache_find_script_level(script_level.id).level
  end

  test 'stage hierarchy uses cache' do
    script = Script.first
    stage = script.stages.first
    expected_script_level = stage.script_levels.first
    expected_level = stage.script_levels.first.levels.first

    populate_cache_and_disconnect_db

    assert_equal expected_script_level,
      Script.get_from_cache(script.id).stages.first.script_levels.first
    assert_equal expected_level,
      Script.get_from_cache(script.id).
        stages.first.script_levels.first.levels.first
  end

  test 'level_concept_difficulty uses preloading' do
    level = Script.find_by_name('course4').script_levels.second.level
    expected = level.level_concept_difficulty
    assert_not_nil expected

    populate_cache_and_disconnect_db

    assert_equal expected, Script.get_from_cache('course4').script_levels.second.level.level_concept_difficulty
  end

  test 'get_without_cache raises exception for bad id' do
    bad_id = Script.last.id + 1

    assert_raises(ActiveRecord::RecordNotFound) do
      Script.get_from_cache(bad_id)
    end
  end

  test 'banner image' do
    assert_nil Script.find_by_name('flappy').banner_image
    assert_equal 'banner_course1.jpg', Script.find_by_name('course1').banner_image
    assert_equal 'banner_course2.jpg', Script.find_by_name('course2').banner_image
  end

  test 'professional_learning_course?' do
    refute Script.find_by_name('flappy').professional_learning_course?
    assert Script.find_by_name('ECSPD').professional_learning_course?
  end

  test 'hoc?' do
    assert Script.find_by_name('flappy').hoc?
    assert Script.find_by_name('mc').hoc?
    assert Script.find_by_name('hourofcode').hoc?
    assert Script.find_by_name('Hour of Code').hoc?
    assert Script.find_by_name('frozen').hoc?
    assert Script.find_by_name('playlab').hoc?
    assert_not Script.find_by_name('20-hour').hoc?
    assert_not Script.find_by_name('course1').hoc?
    assert_not Script.find_by_name('course2').hoc?
    assert_not Script.find_by_name('course3').hoc?
    assert_not Script.find_by_name('course4').hoc?
  end

  test 'minecraft?' do
    assert_not Script.find_by_name('flappy').minecraft?
    assert Script.find_by_name('mc').minecraft?
  end

  test 'twenty_hour?' do
    assert Script.find_by_name('20-hour').twenty_hour?
    assert_not Script.find_by_name('mc').twenty_hour?
  end

  test 'should summarize script' do
    script = create(:script, name: 'single-stage-script')
    stage = create(:stage, script: script, name: 'Stage 1')
    create(:script_level, script: script, stage: stage)
    script.teacher_resources = [['curriculum', '/link/to/curriculum']]

    summary = script.summarize

    assert_equal 1, summary[:stages].count
    assert_nil summary[:peerReviewStage]
    assert_equal 0, summary[:peerReviewsRequired]
    assert_equal [['curriculum', '/link/to/curriculum']], summary[:teacher_resources]
  end

  test 'should summarize script with peer reviews' do
    script = create(:script, name: 'script-with-peer-review', peer_reviews_to_complete: 1)
    stage = create(:stage, script: script, name: 'Stage 1')
    create(:script_level, script: script, stage: stage)
    stage = create(:stage, script: script, name: 'Stage 2')
    create(:script_level, script: script, stage: stage)

    summary = script.summarize

    expected_peer_review_stage = {
      name: "You must complete 1 reviews for this unit",
      flex_category: "Peer Review",
      levels: [{
        ids: [0],
        kind: LEVEL_KIND.peer_review,
        title: "",
        url: "",
        name: "Reviews unavailable at this time",
        icon: "fa-lock",
        locked: true
      }],
      lockable: false
    }

    assert_equal 2, summary[:stages].count
    assert_equal expected_peer_review_stage, summary[:peerReviewStage]
    assert_equal 1, summary[:peerReviewsRequired]
  end

  test 'should generate a shorter summary for header' do
    script = create(:script, name: 'single-stage-script')
    stage = create(:stage, script: script, name: 'Stage 1')
    create(:script_level, script: script, stage: stage)

    expected = {
      name: 'single-stage-script',
      disablePostMilestone: false,
      isHocScript: false,
      student_detail_progress_view: false,
      age_13_required: false,
    }
    assert_equal expected, script.summarize_header
  end

  test 'should exclude stages if include_stages is false' do
    script = create(:script, name: 'single-stage-script')
    stage = create(:stage, script: script, name: 'Stage 1')
    create(:script_level, script: script, stage: stage)

    assert_nil script.summarize(false)[:stages]
  end

  test 'summarize includes has_verified_resources' do
    script = create(:script, name: 'resources-script')

    script.has_verified_resources = true
    assert script.has_verified_resources
    summary = script.summarize
    assert summary[:has_verified_resources]

    script.has_verified_resources = false
    refute script.has_verified_resources
    summary = script.summarize
    refute summary[:has_verified_resources]
  end

  test 'summarize includes has_lesson_plan' do
    script = create(:script, name: 'resources-script')

    script.has_lesson_plan = true
    assert script.has_lesson_plan
    summary = script.summarize
    assert summary[:has_lesson_plan]

    script.has_lesson_plan = false
    refute script.has_lesson_plan
    summary = script.summarize
    refute summary[:has_lesson_plan]
  end

  test 'should generate PLC objects' do
    script_file = File.join(self.class.fixture_path, 'test-plc.script')
    scripts, custom_i18n = Script.setup([script_file])
    custom_i18n.deep_merge!(
      {
        'en' => {
          'data' => {
            'script' => {
              'name' => {
                'test-plc' => {
                  'title' => 'PLC Test',
                  'description' => 'PLC test fixture script'
                }
              }
            }
          }
        }
      }
    )
    I18n.backend.store_translations I18n.locale, custom_i18n['en']

    script = scripts.first
    script.save! # Need to trigger an update because i18n strings weren't loaded
    assert script.professional_learning_course?
    assert_equal 'Test plc course', script.professional_learning_course
    assert_equal 42, script.peer_reviews_to_complete

    unit = script.plc_course_unit
    assert_equal 'PLC Test', unit.unit_name
    assert_equal 'PLC test fixture script', unit.unit_description

    lm = script.stages.first.plc_learning_module
    assert_equal 'Sample Module', lm.name
    assert_equal 1, unit.plc_learning_modules.count
    assert_equal lm, unit.plc_learning_modules.first
    assert_equal Plc::LearningModule::CONTENT_MODULE, lm.module_type

    task = script.script_levels.first.plc_task
    assert_equal 'Level 1', task.name
    assert_equal 1, lm.plc_tasks.count
    assert_equal task, lm.plc_tasks.first
  end

  test 'expect error on bad module types' do
    script_file = File.join(self.class.fixture_path, 'test-bad-plc-module.script')
    assert_raises ActiveRecord::RecordInvalid do
      Script.setup([script_file])
    end
  end

  test 'script name format validation' do
    assert_raises ActiveRecord::RecordInvalid do
      create :script, name: 'abc 123'
    end

    assert_raises ActiveRecord::RecordInvalid do
      create :script, name: 'TestScript1'
    end

    assert_raises ActiveRecord::RecordInvalid do
      create :script, name: 'a_b_c'
    end

    assert_raise ActiveRecord::RecordInvalid do
      create :script, name: '~', skip_name_format_validation: true
    end

    assert_raises ActiveRecord::RecordInvalid do
      create :script, name: '..', skip_name_format_validation: true
    end

    assert_raises ActiveRecord::RecordInvalid do
      create :script, name: 'evil/directory/traversal',
        skip_name_format_validation: true
    end
  end

  test 'can edit existing script with invalid name' do
    script = create :script, name: 'Invalid Name', skip_name_format_validation: true
    script.update!(login_required: true)
  end

  test 'names stages appropriately when script has lockable stages' do
    create :level, name: 'LockableAssessment1'
    create :level, name: 'NonLockableAssessment1'
    create :level, name: 'NonLockableAssessment2'
    create :level, name: 'NonLockableAssessment3'

    input_dsl = <<-DSL.gsub(/^\s+/, '')
      stage 'NonLockable1'
      assessment 'NonLockableAssessment1';
      stage 'NonLockable2'
      assessment 'NonLockableAssessment2';
      stage 'NonLockable3'
      assessment 'NonLockableAssessment3';
    DSL
    script_data, _ = ScriptDSL.parse(input_dsl, 'a filename')
    script = Script.add_script({name: 'test_script'}, script_data[:stages])

    # Everything has Stage <number> when nothing is lockable
    assert /^Lesson 1:/.match(script.stages[0].localized_title)
    assert /^Lesson 2:/.match(script.stages[1].localized_title)
    assert /^Lesson 3:/.match(script.stages[2].localized_title)

    input_dsl = <<-DSL.gsub(/^\s+/, '')
      stage 'Lockable1', lockable: true
      assessment 'LockableAssessment1';
      stage 'NonLockable1'
      assessment 'NonLockableAssessment1';
      stage 'NonLockable2'
      assessment 'NonLockableAssessment2';
    DSL
    script_data, _ = ScriptDSL.parse(input_dsl, 'a filename')
    script = Script.add_script({name: 'test_script'}, script_data[:stages])

    # When first stage is lockable, it has no stage number, and the next stage starts at 1
    assert /^Lesson/.match(script.stages[0].localized_title).nil?
    assert /^Lesson 1:/.match(script.stages[1].localized_title)
    assert /^Lesson 2:/.match(script.stages[2].localized_title)

    input_dsl = <<-DSL.gsub(/^\s+/, '')
      stage 'NonLockable1'
      assessment 'NonLockableAssessment1';
      stage 'Lockable1', lockable: true
      assessment 'LockableAssessment1';
      stage 'NonLockable2'
      assessment 'NonLockableAssessment2';
    DSL
    script_data, _ = ScriptDSL.parse(input_dsl, 'a filename')
    script = Script.add_script({name: 'test_script'}, script_data[:stages])

    # When only second stage is lockable, we count non-lockable stages appropriately
    assert /^Lesson 1:/.match(script.stages[0].localized_title)
    assert /^Lesson/.match(script.stages[1].localized_title).nil?
    assert /^Lesson 2:/.match(script.stages[2].localized_title)
  end

  test 'Script DSL fails when creating invalid lockable stages' do
    create :level, name: 'Level1'
    create :level, name: 'LockableAssessment1'
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      stage 'Lockable1', lockable: true
      assessment 'LockableAssessment1';
      level 'Level1';
    DSL
    script_data, _ = ScriptDSL.parse(input_dsl, 'a filename')

    assert_raises do
      Script.add_script({name: 'test_script'}, script_data[:stages])
    end
  end

  test "update_i18n without metdata" do
    # This simulates us doing a seed after adding new stages to multiple of
    # our script files. Doing so should update our object with the new stage
    # names (which we would then persist to sripts.en.yml)
    original_yml = YAML.load_file(Rails.root.join('test', 'en.yml'))

    course3_yml = {'stages' => {'course3' => {'name' => 'course3'}}}
    course4_yml = {'stages' => {'course4' => {'name' => 'course4'}}}

    stages_i18n = {'en' => {'data' => {'script' => {'name' => {
      'course3' => course3_yml,
      'course4' => course4_yml
    }}}}}

    # updated represents what will get written to scripts.en.yml
    updated = Script.update_i18n(original_yml, stages_i18n)

    assert_equal course3_yml, updated['en']['data']['script']['name']['course3']
    assert_equal course4_yml, updated['en']['data']['script']['name']['course4']
  end

  test "update_i18n with metadata" do
    # In this case, we're modifying a stage description without changing any
    # stage names
    original_yml = YAML.load_file(Rails.root.join('test', 'en.yml'))

    # No updates to stage names
    stages_i18n = {'en' => {'data' => {'name' => {}}}}

    script_name = 'Report Script'

    metadata = {
      'title' => 'Report Script Name',
      'description' => 'This is what Report Script is all about',
      stage_descriptions: [{
        'name' => 'Report Stage 1',
        'descriptionStudent' => 'Stage 1 is pretty neat',
        'descriptionTeacher' => 'This is what you should know as a teacher'
      }].to_json
    }

    updated = Script.update_i18n(original_yml, stages_i18n, script_name, metadata)

    updated_report_script = updated['en']['data']['script']['name']['Report Script']

    assert_equal 'Report Script Name', updated_report_script['title']
    assert_equal 'This is what Report Script is all about', updated_report_script['description']
    assert_equal 'report-stage-1', updated_report_script['stages']['Report Stage 1']['name']
    assert_equal 'Stage 1 is pretty neat', updated_report_script['stages']['Report Stage 1']['description_student']
    assert_equal 'This is what you should know as a teacher', updated_report_script['stages']['Report Stage 1']['description_teacher']
  end

  test 'text_to_speech_enabled? when script k1? is true' do
    assert Script.find_by_name('course1').text_to_speech_enabled?
  end

  test '!text_to_speech_enabled? by default' do
    refute create(:script).text_to_speech_enabled?
  end

  test 'FreeResponse level is listed in text_response_levels' do
    script = create :script
    stage = create :stage, script: script
    level = create :free_response
    create :script_level, script: script, stage: stage, levels: [level]

    assert_equal level, script.text_response_levels.first[:levels].first
  end

  test 'Multi level is not listed in text_response_levels' do
    script = create :script
    stage = create :stage, script: script
    level = create :multi
    create :script_level, script: script, stage: stage, levels: [level]

    assert_empty script.text_response_levels
  end

  test 'contained FreeResponse level is listed in text_response_levels' do
    script = create :script
    stage = create :stage, script: script
    contained_level = create :free_response, name: 'Contained Free Response'
    level = create :maze, properties: {contained_level_names: [contained_level.name]}
    create :script_level, script: script, stage: stage, levels: [level]

    assert_equal contained_level, script.text_response_levels.first[:levels].first
  end

  test 'contained Multi level is not listed in text_response_levels' do
    script = create :script
    stage = create :stage, script: script
    contained_level = create :multi, name: 'Contained Multi'
    level = create :maze, properties: {contained_level_names: [contained_level.name]}
    create :script_level, script: script, stage: stage, levels: [level]

    assert_empty script.text_response_levels
  end

  test "course_link retuns nil if script is in no courses" do
    script = create :script
    create :course, name: 'csp'

    assert_nil script.course_link
  end

  test "course_link returns nil if script is in two courses" do
    script = create :script
    course = create :course, name: 'csp'
    other_course = create :course, name: 'othercsp'
    create :course_script, position: 1, course: course, script: script
    create :course_script, position: 1, course: other_course, script: script

    assert_nil script.course_link
  end

  test "course_link returns course_path if script is in one course" do
    script = create :script
    course = create :course, name: 'csp'
    create :course_script, position: 1, course: course, script: script

    assert_equal '/courses/csp', script.course_link
  end

  test 'course_link uses cache' do
    populate_cache_and_disconnect_db
    Script.stubs(:should_cache?).returns true
    Course.stubs(:should_cache?).returns true
    script = Script.get_from_cache(@script_in_course.name)
    assert_equal "/courses/#{@course.name}", script.course_link
  end

  test "logged_out_age_13_required?" do
    script = create :script, login_required: false
    level = create :applab
    stage = create :stage, script: script
    create :script_level, script: script, stage: stage, levels: [level]

    # return true when we have an applab level
    assert_equal true, script.logged_out_age_13_required?

    # returns false is login_required is true
    script.login_required = true
    assert_equal false, script.logged_out_age_13_required?

    # returns false if we don't have any applab/gamelab/weblab levels
    script = create :script, login_required: false
    level = create :maze
    stage = create :stage, script: script
    create :script_level, script: script, stage: stage, levels: [level]
    assert_equal false, script.logged_out_age_13_required?
  end

  test "get_bonus_script_levels" do
    script = create :script
    stage1 = create :stage, script: script
    create :stage, script: script
    stage3 = create :stage, script: script
    create :script_level, script: script, stage: stage1, bonus: true
    create :script_level, script: script, stage: stage1, bonus: true
    create :script_level, script: script, stage: stage3, bonus: true
    create :script_level, script: script, stage: stage3, bonus: true

    bonus_levels1 = script.get_bonus_script_levels(stage1)
    bonus_levels3 = script.get_bonus_script_levels(stage3)

    assert_equal 1, bonus_levels1.length
    assert_equal 1, bonus_levels1[0][:stageNumber]
    assert_equal 2, bonus_levels1[0][:levels].length

    assert_equal 2, bonus_levels3.length
    assert_equal 1, bonus_levels3[0][:stageNumber]
    assert_equal 3, bonus_levels3[1][:stageNumber]
    assert_equal 2, bonus_levels3[0][:levels].length
    assert_equal 2, bonus_levels3[1][:levels].length
  end

  test 'can make a challenge level not a challenge level' do
    l = create :level
    old_dsl = <<-SCRIPT
      stage 'Stage1'
      level '#{l.name}', challenge: true
    SCRIPT
    new_dsl = <<-SCRIPT
      stage 'Stage1'
      level '#{l.name}'
    SCRIPT
    script = Script.add_script(
      {name: 'challengeTestScript'},
      ScriptDSL.parse(old_dsl, 'a filename')[0][:stages]
    )
    assert script.script_levels.first.challenge

    script = Script.add_script(
      {name: 'challengeTestScript'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:stages]
    )

    refute script.script_levels.first.challenge
  end

  test 'can make a bonus level not a bonus level' do
    l = create :level
    old_dsl = <<-SCRIPT
      stage 'Stage1'
      level '#{l.name}', bonus: true
    SCRIPT
    new_dsl = <<-SCRIPT
      stage 'Stage1'
      level '#{l.name}'
    SCRIPT
    script = Script.add_script(
      {name: 'challengeTestScript'},
      ScriptDSL.parse(old_dsl, 'a filename')[0][:stages]
    )
    assert script.script_levels.first.bonus

    script = Script.add_script(
      {name: 'challengeTestScript'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:stages]
    )

    refute script.script_levels.first.bonus
  end

  test 'can unset the project_widget_visible attribute' do
    l = create :level
    old_dsl = <<-SCRIPT
      project_widget_visible true
      stage 'Stage1'
      level '#{l.name}'
    SCRIPT
    new_dsl = <<-SCRIPT
      stage 'Stage1'
      level '#{l.name}'
    SCRIPT
    script_data, _ = ScriptDSL.parse(old_dsl, 'a filename')
    script = Script.add_script(
      {
        name: 'challengeTestScript',
        properties: Script.build_property_hash(script_data)
      },
      script_data[:stages]
    )
    assert script.project_widget_visible

    script_data, _ = ScriptDSL.parse(new_dsl, 'a filename')
    script = Script.add_script(
      {
        name: 'challengeTestScript',
        properties: Script.build_property_hash(script_data)
      },
      script_data[:stages]
    )

    refute script.project_widget_visible
  end

  test 'clone script with suffix' do
    scripts, _ = Script.setup([@script_file])
    script = scripts[0]

    Script.stubs(:script_directory).returns(self.class.fixture_path)
    script_copy = script.clone_with_suffix('copy')
    assert_equal 'test-fixture-copy', script_copy.name

    # Validate levels.
    assert_equal 5, script_copy.levels.count
    script_copy.levels.each_with_index do |level, i|
      level_num = i + 1
      assert_equal "Level #{level_num}_copy", level.name
      old_level = Level.find_by_name("Level #{level_num}")
      assert_equal old_level.level_num, level.level_num
      assert_equal old_level.id, level.parent_level_id
      assert_equal '_copy', level.name_suffix
    end

    # Validate stages. We've already done some validation of level contents, so
    # this time just validate their names.
    assert_equal 2, script_copy.stages.count
    stage1 = script_copy.stages.first
    stage2 = script_copy.stages.last
    assert_equal(
      'Level 1_copy,Level 2_copy,Level 3_copy',
      stage1.script_levels.map(&:levels).flatten.map(&:name).join(',')
    )
    assert_equal(
      'Level 4_copy,Level 5_copy',
      stage2.script_levels.map(&:levels).flatten.map(&:name).join(',')
    )
  end

  test 'clone script with inactive variant' do
    script_file = File.join(self.class.fixture_path, "test-fixture-variants.script")
    scripts, _ = Script.setup([script_file])
    script = scripts[0]

    Script.stubs(:script_directory).returns(self.class.fixture_path)
    script_copy = script.clone_with_suffix('copy')
    assert_equal 'test-fixture-variants-copy', script_copy.name

    assert_equal 1, script_copy.script_levels.count
    sl = script_copy.script_levels.first

    assert_equal 'Level 1_copy', sl.levels.first.name
    assert sl.active?(sl.levels.first)

    assert_equal 'Level 2_copy', sl.levels.last.name
    refute sl.active?(sl.levels.last)

    # Ignore level names, since we are just testing whether the
    # variants / active / endvariants structure is correct.
    new_dsl_regex = <<-SCRIPT
stage 'Stage1'
variants
  level '[^']+'
  level '[^']+', active: false
endvariants
    SCRIPT

    assert_match Regexp.new(new_dsl_regex), ScriptDSL.serialize_to_string(script_copy)
  end
end
