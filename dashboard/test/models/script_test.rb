require 'test_helper'
require 'cdo/shared_constants'

class ScriptTest < ActiveSupport::TestCase
  include SharedConstants

  self.use_transactional_test_case = true

  setup_all do
    @game = create(:game)
    @script_file = File.join(self.class.fixture_path, "test-fixture.script")
    # Level names match those in 'test.script'
    @levels = (1..5).map {|n| create(:level, name: "Level #{n}", game: @game)}

    Rails.application.config.stubs(:levelbuilder_mode).returns false
  end

  def populate_cache_and_disconnect_db
    Script.stubs(:should_cache?).returns true
    # Only need to populate cache once per test-suite run
    @@script_cached ||= Script.script_cache_to_cache
    Script.script_cache_from_cache

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

    parsed_script = ScriptDSL.parse_file(@script_file)[0][:stages].map {|stage| stage[:scriptlevels]}.flatten

    # Set different level name in tested script
    parsed_script[4][:levels][0]['name'] = "Level 1"

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

    script = Script.add_script(
      {name: 'test script'},
      script_data[:stages].map {|stage| stage[:scriptlevels]}.flatten
    )

    assert_equal 'Studio', script.script_levels[1].level.game.name
    assert_equal '100', script.script_levels[1].level.level_num
  end

  test 'forbid applab and gamelab levels in public scripts' do
    assert_raises_matching /Applab and Gamelab levels can only be added to scripts that are hidden or require login/ do
      Script.add_script(
        {name: 'test script', hidden: false},
        [{levels: [{name: 'New App Lab Project'}]}] # From level.yml fixture
      )
    end

    assert_raises_matching /Applab and Gamelab levels can only be added to scripts that are hidden or require login/ do
      Script.add_script(
        {name: 'test script', hidden: false},
        [{levels: [{name: 'New Game Lab Project'}]}] # From level.yml fixture
      )
    end
  end

  test 'allow applab and gamelab levels in hidden scripts' do
    Script.add_script(
      {name: 'test script', hidden: true},
      [{levels: [{name: 'New App Lab Project'}]}] # From level.yml fixture
    )
    Script.add_script(
      {name: 'test script', hidden: true},
      [{levels: [{name: 'New Game Lab Project'}]}] # From level.yml fixture
    )
  end

  test 'allow applab and gamelab levels in login_required scripts' do
    Script.add_script(
      {name: 'test script', hidden: false, login_required: true},
      [{levels: [{name: 'New App Lab Project'}]}] # From level.yml fixture
    )
    Script.add_script(
      {name: 'test script', hidden: false, login_required: true},
      [{levels: [{name: 'New Game Lab Project'}]}] # From level.yml fixture
    )
  end

  test 'scripts are hidden or not' do
    visible_scripts = %w{
      20-hour flappy playlab infinity artist course1 course2 course3 course4
      frozen hourofcode algebra cspunit1 cspunit2 cspunit3 cspunit4 cspunit5
      cspunit6 starwarsblocks
    }.map {|s| Script.find_by_name(s)}

    visible_scripts.each do |s|
      refute s.hidden?, "#{s.name} is hidden when it should not be"
    end

    # all other scripts are hidden
    hidden_scripts = Script.all - visible_scripts
    hidden_scripts.each do |s|
      assert s.hidden?, "#{s.name} is not hidden when it should be"
    end
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

  test 'logo image' do
    # this is configured in scripts.en.yml
    assert_nil Script.find_by_name('flappy').logo_image
    assert_nil Script.find_by_name('ECSPD').logo_image
    assert_equal 'nextech_logo.png', Script.find_by_name('ECSPD-NexTech').logo_image
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

    summary = script.summarize

    assert_equal 1, summary[:stages].count
    assert_nil summary[:peerReviewStage]
    assert_equal 0, summary[:peerReviewsRequired]
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

  test 'should generate a short summary' do
    script = create(:script, name: 'single-stage-script')
    stage = create(:stage, script: script, name: 'Stage 1')
    create(:script_level, script: script, stage: stage)

    expected = {
      name: 'single-stage-script',
      disablePostMilestone: false,
      isHocScript: false,
      student_detail_progress_view: false
    }
    assert_equal expected, script.summarize_short
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
    script = Script.add_script(
      {name: 'test_script'},
      script_data[:stages].map {|stage| stage[:scriptlevels]}.flatten
    )

    # Everything has Stage <number> when nothing is lockable
    assert /^Stage 1:/.match(script.stages[0].localized_title)
    assert /^Stage 2:/.match(script.stages[1].localized_title)
    assert /^Stage 3:/.match(script.stages[2].localized_title)

    input_dsl = <<-DSL.gsub(/^\s+/, '')
      stage 'Lockable1', lockable: true
      assessment 'LockableAssessment1';
      stage 'NonLockable1'
      assessment 'NonLockableAssessment1';
      stage 'NonLockable2'
      assessment 'NonLockableAssessment2';
    DSL
    script_data, _ = ScriptDSL.parse(input_dsl, 'a filename')
    script = Script.add_script(
      {name: 'test_script'},
      script_data[:stages].map {|stage| stage[:scriptlevels]}.flatten
    )

    # When first stage is lockable, it has no stage number, and the next stage starts at 1
    assert /^Stage/.match(script.stages[0].localized_title).nil?
    assert /^Stage 1:/.match(script.stages[1].localized_title)
    assert /^Stage 2:/.match(script.stages[2].localized_title)

    input_dsl = <<-DSL.gsub(/^\s+/, '')
      stage 'NonLockable1'
      assessment 'NonLockableAssessment1';
      stage 'Lockable1', lockable: true
      assessment 'LockableAssessment1';
      stage 'NonLockable2'
      assessment 'NonLockableAssessment2';
    DSL
    script_data, _ = ScriptDSL.parse(input_dsl, 'a filename')
    script = Script.add_script(
      {name: 'test_script'},
      script_data[:stages].map {|stage| stage[:scriptlevels]}.flatten
    )

    # When only second stage is lockable, we count non-lockable stages appropriately
    assert /^Stage 1:/.match(script.stages[0].localized_title)
    assert /^Stage/.match(script.stages[1].localized_title).nil?
    assert /^Stage 2:/.match(script.stages[2].localized_title)
  end

  test 'Script DSL fails when creating invalid lockable stages' do
    create :level, name: 'Level1'
    create :level, name: 'LockableAssessment1'
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      stage 'Lockable1', lockable: true
      level 'Level1';
      assessment 'LockableAssessment1';
    DSL
    script_data, _ = ScriptDSL.parse(input_dsl, 'a filename')

    assert_raises do
      Script.add_script({name: 'test_script'}, script_data[:stages].map {|stage| stage[:scriptlevels]}.flatten)
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
end
