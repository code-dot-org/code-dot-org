require 'test_helper'
require 'cdo/shared_constants'

class ScriptTest < ActiveSupport::TestCase
  include SharedConstants

  self.use_transactional_test_case = true

  setup_all do
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    @game = create(:game)
    @unit_file = File.join(self.class.fixture_path, "test-fixture.script")
    # Level names match those in 'test.script'
    @levels = (1..8).map {|n| create(:level, name: "Level #{n}", game: @game, level_num: 'custom')}

    @unit_group = create(:unit_group)
    @unit_in_unit_group = create(:script, published_state: SharedConstants::PUBLISHED_STATE.beta)
    create(:unit_group_unit, position: 1, unit_group: @unit_group, script: @unit_in_unit_group)

    @unit_2017 = create :script, name: 'script-2017', family_name: 'family-cache-test', version_year: '2017'
    @unit_2018 = create :script, name: 'script-2018', family_name: 'family-cache-test', version_year: '2018'

    @csf_unit = create :csf_script, name: 'csf1'
    @csd_unit = create :csd_script, name: 'csd1'
    @csp_unit = create :csp_script, name: 'csp1'
    @csa_unit = create :csa_script, name: 'csa1'

    @csf_unit_2019 = create :csf_script, name: 'csf-2019', version_year: '2019'

    # ensure that we have freshly generated caches with this unit_group/unit
    UnitGroup.clear_cache
    Script.clear_cache
  end

  def populate_cache_and_disconnect_db
    Script.stubs(:should_cache?).returns true
    # Only need to populate cache once per test-suite run
    @@script_cached ||= Script.unit_cache_to_cache
    Script.script_cache
    Script.unit_family_cache

    # Also populate course_cache, as it's used by course_link
    UnitGroup.stubs(:should_cache?).returns true
    @@course_cached ||= UnitGroup.course_cache_to_cache
    UnitGroup.course_cache

    # NOTE: ActiveRecord collection association still references an active DB connection,
    # even when the data is already eager loaded.
    # Best we can do is ensure that no queries are executed on the active connection.
    ActiveRecord::Base.connection.stubs(:execute).raises 'Database disconnected'
  end

  test 'login required setting in script file' do
    file = File.join(self.class.fixture_path, "login_required.script")

    unit_names, _ = Script.setup([file])
    unit = Script.find_by!(name: unit_names.first)

    assert unit.login_required?
    assert_equal 'Level 1', unit.levels[0].name

    assert_equal false, Script.find_by(name: 'Hour of Code').login_required?

    assert_equal false, create(:script).login_required?
  end

  test 'create unit from DSL' do
    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    assert_equal 'Level 1', unit.levels[0].name
    assert_equal 'Lesson Two', unit.script_levels[3].lesson.name

    assert_equal 'MyProgression', unit.script_levels[3].progression
    assert_equal 'MyProgression', unit.script_levels[4].progression
  end

  test 'should not change Script[Level] ID when reseeding' do
    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    unit_id = unit.script_levels[4].script_id
    script_level_id = unit.script_levels[4].id

    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    assert_equal unit_id, unit.script_levels[4].script_id
    assert_equal script_level_id, unit.script_levels[4].id
  end

  test 'should not change Script ID when changing script levels and options' do
    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    unit_id = unit.script_levels[4].script_id
    script_level_id = unit.script_levels[4].id

    parsed_unit = ScriptDSL.parse_file(@unit_file)[0][:lesson_groups]

    # Set different level name in tested unit
    parsed_unit[0][:lessons][1][:script_levels][1][:levels][0][:name] = "Level 1"

    options = {name: File.basename(@unit_file, ".script"), published_state: SharedConstants::PUBLISHED_STATE.preview}
    unit = Script.add_unit(options, parsed_unit)
    assert_equal unit_id, unit.script_levels[4].script_id
    assert_not_equal script_level_id, unit.script_levels[4].id
  end

  test 'cannot rename a unit without a new_name' do
    l = create :level
    dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    old_unit = Script.add_unit(
      {name: 'old unit name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )
    assert_equal 'old unit name', old_unit.name

    new_unit = Script.add_unit(
      {name: 'new unit name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )
    assert_equal 'new unit name', new_unit.name

    # a new unit was created
    refute_equal old_unit.id, new_unit.id
  end

  test 'can rename a unit between original name and new_name' do
    l = create :level
    dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    old_unit = Script.add_unit(
      {name: 'old unit name', new_name: 'new unit name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )
    assert_equal 'old unit name', old_unit.name

    new_unit = Script.add_unit(
      {name: 'new unit name', new_name: 'new unit name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )
    assert_equal 'new unit name', new_unit.name

    # the old unit was renamed
    assert_equal old_unit.id, new_unit.id

    old_unit = Script.add_unit(
      {name: 'old unit name', new_name: 'new unit name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )
    assert_equal 'old unit name', old_unit.name

    # the unit was renamed back to the old name
    assert_equal old_unit.id, new_unit.id
  end

  test 'should remove empty lessons' do
    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    assert_equal 2, unit.lessons.count

    # Reupload a unit of the same filename / name, but lacking the second lesson.
    lesson = unit.lessons.last
    unit_file_empty_lesson = File.join(self.class.fixture_path, "duplicate_scripts", "test-fixture.script")
    unit_names, _ = Script.setup([unit_file_empty_lesson])
    unit = Script.find_by!(name: unit_names.first)
    assert_equal 1, unit.lessons.count
    assert_not Lesson.exists?(lesson.id)
  end

  test 'should remove empty lessons, reordering lessons' do
    unit_file_3_lessons = File.join(self.class.fixture_path, "test-fixture-3-lessons.script")
    unit_file_middle_missing_reversed = File.join(self.class.fixture_path, "duplicate_scripts", "test-fixture-3-lessons.script")
    unit_names, _ = Script.setup([unit_file_3_lessons])
    unit = Script.find_by!(name: unit_names.first)
    assert_equal 3, unit.lessons.count
    first = unit.lessons[0]
    second = unit.lessons[1]
    third = unit.lessons[2]
    assert_equal 'lesson1', first.name
    assert_equal 'lesson2', second.name
    assert_equal 'lesson3', third.name
    assert_equal 1, first.absolute_position
    assert_equal 2, second.absolute_position
    assert_equal 3, third.absolute_position
    original_script_level_ids = unit.script_levels.map(&:id)

    # Reupload a unit of the same filename / name, but lacking the middle lesson.
    unit_names, _ = Script.setup([unit_file_middle_missing_reversed])
    unit = Script.find_by!(name: unit_names.first)
    assert_equal 2, unit.lessons.count
    assert_not Lesson.exists?(second.id)

    first = unit.lessons[0]
    second = unit.lessons[1]
    assert_equal 1, first.absolute_position
    assert_equal 2, second.absolute_position
    assert_equal 'lesson3', first.name
    assert_equal 'lesson1', second.name
    # One Lesson / ScriptLevel removed, the rest reordered
    expected_script_level_ids = [original_script_level_ids[3], original_script_level_ids[4],
                                 original_script_level_ids[0], original_script_level_ids[1]]
    assert_equal expected_script_level_ids, unit.script_levels.map(&:id)
  end

  test 'all fields can be set and then removed on reseed' do
    # First, seed using a .script file that sets something explicitly for all fields, i.e. everything that's not in
    # the properties hash.
    unit_file_all_fields = File.join(self.class.fixture_path, 'test-all-fields.script')
    unit_names, _ = Script.setup([unit_file_all_fields])
    unit = Script.find_by!(name: unit_names.first)

    # Not testing new_name since it causes a new unit to be created.
    assert_equal SharedConstants::PUBLISHED_STATE.preview, unit.published_state
    assert unit.login_required?
    assert_equal 'csd1', unit.family_name

    # Seed using an empty .script file with the same name. Verify that this sets all field values back to defaults.
    unit_file_no_fields = File.join(self.class.fixture_path, 'duplicate_scripts', 'test-all-fields.script')
    Script.setup([unit_file_no_fields])
    unit.reload

    assert_equal SharedConstants::PUBLISHED_STATE.beta, unit.published_state
    assert_equal false, unit.login_required?
    assert_nil unit.family_name
  end

  test 'all properties can be set and then removed on reseed' do
    # First, seed using a .script file that sets something explicitly for everything in the properties hash.
    unit_file_all_properties = File.join(self.class.fixture_path, 'test-all-properties.script')
    unit_names, _ = Script.setup([unit_file_all_properties])
    unit = Script.find_by!(name: unit_names.first)

    assert_equal 19, unit.properties.keys.length
    unit.properties.values.each {|v| assert v}

    # Seed using an empty .script file with the same name. Verify that this sets all properties values back to defaults.
    unit_file_no_properties = File.join(self.class.fixture_path, 'duplicate_scripts', 'test-all-properties.script')
    Script.setup([unit_file_no_properties])
    unit.reload

    # All properties should get reset to defaults.
    assert_empty unit.properties
  end

  test 'can setup new migrated unit' do
    Script.stubs(:unit_json_directory).returns(File.join(self.class.fixture_path, 'config', 'scripts_json'))

    # the contents of test-migrated-new.script and test-migrated-new.script_json
    # reflect that of a new unit which has been modified only by adding
    # `is_migrated true` to the .script file.
    unit_file = File.join(self.class.fixture_path, 'config', 'scripts', 'test-migrated-new.script')
    Script.setup([unit_file])

    unit = Script.find_by_name('test-migrated-new')
    assert unit.is_migrated
  end

  test 'can setup migrated unit with new models' do
    Script.stubs(:unit_json_directory).returns(File.join(self.class.fixture_path, 'config', 'scripts_json'))

    # test that LessonActivity, ActivitySection and Objective can be seeded
    # from .script_json when is_migrated is specified in the .script file.
    # use 'custom' level num to make level key match level name.
    create :maze, name: 'test_maze_level', level_num: 'custom'
    unit_file = File.join(self.class.fixture_path, 'config', 'scripts', 'test-migrated-models.script')
    Script.setup([unit_file])

    unit = Script.find_by_name('test-migrated-models')
    assert unit.is_migrated
    assert_equal 1, unit.lesson_groups.count
    assert_equal 1, unit.lessons.count
    lesson = unit.lessons.first
    assert_equal 1, lesson.lesson_activities.count
    activity = lesson.lesson_activities.first
    assert_equal 'My Activity', activity.name
    assert_equal 1, activity.activity_sections.count
    section = activity.activity_sections.first
    assert_equal 'My Activity Section', section.name
    assert_equal 1, section.script_levels.count
    script_level = section.script_levels.first
    assert_equal 1, script_level.levels.count
    assert_equal 'test_maze_level', script_level.levels.first.name
    assert_equal 1, unit.levels.count
    assert_equal 'test_maze_level', unit.levels.first.name
  end

  test 'script_json settings override take precedence for migrated unit' do
    Script.stubs(:unit_json_directory).returns(File.join(self.class.fixture_path, 'config', 'scripts_json'))

    unit_file = File.join(self.class.fixture_path, 'config', 'scripts', 'test-migrated-overrides.script')
    Script.setup([unit_file])

    # If settings differ between .script and .script_json for a migrated unit,
    # the .script_json settings must take preference. This is somewhat of an
    # implementation-agnostic test, because the implementation doesn't even look
    # at anything inside the .script file besides the is_migrated property for
    # migrated units.
    unit = Script.find_by_name('test-migrated-overrides')
    assert unit.is_migrated
    assert unit.tts
    assert_equal 'my-pilot-experiment', unit.pilot_experiment
    refute unit.editor_experiment
    refute unit.login_required
    refute unit.student_detail_progress_view
    assert_equal ['my lesson group'], unit.lesson_groups.map(&:key)
    assert_equal ['my lesson'], unit.lessons.map(&:key)
  end

  test 'should not create two units with same name' do
    create(:script, name: 'script')
    raise = assert_raises ActiveRecord::RecordInvalid do
      create(:script, name: 'Script', skip_name_format_validation: true)
    end
    assert_equal 'Validation failed: Name has already been taken', raise.message
  end

  test 'lessons are in order' do
    unit = create(:script, name: 's1')
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    create(:lesson, script: unit, lesson_group: lesson_group)
    last = create(:lesson, script: unit, lesson_group: lesson_group)
    create(:lesson, script: unit, lesson_group: lesson_group)

    last.move_to_bottom

    unit.lessons

    assert_equal [1, 2, 3], unit.lessons.collect(&:absolute_position)
  end

  test 'calling next_level on last script_level points to next lesson' do
    unit = create(:script, name: 'test2')
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    first_lesson = create(:lesson, script: unit, absolute_position: 1, lesson_group: lesson_group)

    first_lesson_last_level = create(:script_level, script: unit, lesson: first_lesson, position: 1)
    second_lesson = create(:lesson, script: unit, absolute_position: 2, lesson_group: lesson_group)
    second_lesson_first_level = create(:script_level, script: unit, lesson: second_lesson, position: 1)
    create(:script_level, script: unit, lesson: second_lesson, position: 2)

    assert_equal second_lesson_first_level, first_lesson_last_level.next_progression_level
  end

  test 'script_level positions should reset' do
    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    first = unit.lessons[0].script_levels[0]
    second = unit.lessons[0].script_levels[1]
    assert_equal 1, first.position
    assert_equal 2, second.position
    promoted_level = second.level
    unit_file_remove_level = File.join(self.class.fixture_path, "duplicate_scripts", "test-fixture.script")

    unit_names, _ = Script.setup([unit_file_remove_level])
    unit = Script.find_by!(name: unit_names.first)
    new_first_script_level = ScriptLevel.joins(:levels).where(script: unit, levels: {id: promoted_level}).first
    assert_equal 1, new_first_script_level.position
  end

  test 'unit import is idempotent w.r.t. positions and count' do
    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    original_count = ScriptLevel.count
    first = unit.lessons[0].script_levels[0]
    second = unit.lessons[0].script_levels[1]
    third = unit.lessons[0].script_levels[2]
    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal 3, third.position
    original_seed_keys = unit.script_levels.map(&:seed_key).compact
    assert_equal 5, original_seed_keys.length
    original_script_level_ids = unit.script_levels.map(&:id)

    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    first = unit.lessons[0].script_levels[0]
    second = unit.lessons[0].script_levels[1]
    third = unit.lessons[0].script_levels[2]
    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal 3, third.position
    assert_equal original_count, ScriptLevel.count
    assert_equal original_seed_keys, unit.script_levels.map(&:seed_key)
    assert_equal original_script_level_ids, unit.script_levels.map(&:id)
  end

  test 'unplugged in unit' do
    @unit_file = File.join(self.class.fixture_path, 'test-unplugged.script')
    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    assert_equal 'Unplugged', unit.script_levels[1].level['type']
  end

  test 'blockly level in custom unit' do
    unit_data, _ = ScriptDSL.parse(
      "lesson 'Lesson1', display_name: 'Lesson1'; level 'Level 1'; level 'blockly:Studio:100'", 'a filename'
   )

    unit = Script.add_unit({name: 'test script'}, unit_data[:lesson_groups])

    assert_equal 'Studio', unit.script_levels[1].level.game.name
    assert_equal '100', unit.script_levels[1].level.level_num
  end

  test 'allow applab and gamelab levels in unlaunched units' do
    Script.add_unit(
      {name: 'test script', published_state: SharedConstants::PUBLISHED_STATE.beta},
      [{
        key: "my_key",
        display_name: "Content",
        lessons: [{name: "Lesson1", key: 'lesson1', script_levels: [{levels: [{name: 'New App Lab Project'}]}]}]
      }] # From level.yml fixture# From level.yml fixture
    )
    Script.add_unit(
      {name: 'test script', published_state: SharedConstants::PUBLISHED_STATE.beta},
      [{
        key: "my_key",
        display_name: "Content",
        lessons: [{name: "Lesson1", key: 'lesson1', script_levels: [{levels: [{name: 'New Game Lab Project'}]}]}]
      }] # From level.yml fixture
    )
  end

  test 'allow applab and gamelab levels in login_required units' do
    Script.add_unit(
      {name: 'test script', published_state: SharedConstants::PUBLISHED_STATE.preview, login_required: true},
      [{
        key: "my_key",
        display_name: "Content",
        lessons: [{name: "Lesson1", key: 'lesson1', script_levels: [{levels: [{name: 'New App Lab Project'}]}]}]
      }] # From level.yml fixture# From level.yml fixture
    )
    Script.add_unit(
      {name: 'test script', published_state: SharedConstants::PUBLISHED_STATE.preview, login_required: true},
      [{
        key: "my_key",
        display_name: "Content",
        lessons: [{name: "Lesson1", key: 'lesson1', script_levels: [{levels: [{name: 'New Game Lab Project'}]}]}]
      }] # From level.yml fixture
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

  test 'get_from_cache raises if called with a family_name' do
    error = assert_raises do
      Script.get_from_cache('coursea')
    end
    assert_equal 'Do not call Script.get_from_cache with a family_name. Call Script.get_unit_family_redirect_for_user instead.  Family: coursea', error.message
  end

  test 'get_family_from_cache uses unit_family_cache' do
    family_scripts = Script.where(family_name: 'family-cache-test')
    assert_equal [@unit_2017.name, @unit_2018.name], family_scripts.map(&:name)

    populate_cache_and_disconnect_db

    cached_family_scripts = Script.get_family_from_cache('family-cache-test')
    assert_equal [@unit_2017.name, @unit_2018.name], cached_family_scripts.map(&:name).uniq
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

  test 'lesson hierarchy uses cache' do
    unit = Script.first
    lesson = unit.lessons.first
    expected_script_level = lesson.script_levels.first
    expected_level = lesson.script_levels.first.levels.first

    populate_cache_and_disconnect_db

    assert_equal expected_script_level,
      Script.get_from_cache(unit.id).lessons.first.script_levels.first
    assert_equal expected_level,
      Script.get_from_cache(unit.id).
        lessons.first.script_levels.first.levels.first
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

  test 'get_unit_family_redirect_for_user returns latest stable unit assigned or with progress if student' do
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018')

    # Assign student to csp1_2017.
    section = create :section, script: csp1_2017
    student = create :student
    section.students << student

    redirect_unit = Script.get_unit_family_redirect_for_user('csp', user: student)
    assert_equal csp1_2017.name, redirect_unit.redirect_to

    # Student makes progress in csp1_2018.
    create :user_level, user: student, script: csp1_2018
    student.reload

    redirect_unit = Script.get_unit_family_redirect_for_user('csp', user: student)
    assert_equal csp1_2018.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns latest stable unit in family if teacher' do
    teacher = create :teacher
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable)
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable)
    create(:script, name: 'csp1-2019', family_name: 'csp', version_year: '2019')
    create :section, user: teacher, script: csp1_2017

    redirect_unit = Script.get_unit_family_redirect_for_user('csp', user: teacher)
    assert_equal csp1_2018.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns nil if no units in family are stable' do
    create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.preview)
    assert_nil Script.get_unit_family_redirect_for_user('csp')
  end

  test 'get_unit_family_redirect_for_user returns latest version supported in locale if available' do
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable, supported_locales: ['es-MX'])
    create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable)

    redirect_unit = Script.get_unit_family_redirect_for_user('csp', locale: 'es-MX')
    assert_equal csp1_2017.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns latest stable version if no user or locale' do
    create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable)
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable)

    redirect_unit = Script.get_unit_family_redirect_for_user('csp')
    assert_equal csp1_2018.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns latest stable version if no versions supported in locale' do
    create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable, supported_locales: ['es-MX'])
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable)

    redirect_unit = Script.get_unit_family_redirect_for_user('csp', locale: 'it-IT')
    assert_equal csp1_2018.name, redirect_unit.redirect_to
  end

  test 'redirect_to_unit_url returns nil unless user can view unit version' do
    Script.any_instance.stubs(:can_view_version?).returns(false)
    student = create :student
    unit = create :script, name: 'my-script'

    assert_nil unit.redirect_to_unit_url(student)
  end

  test 'redirect_to_unit_url returns nil if user is assigned to unit' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    unit = create :script, name: 'my-script'
    section = create :section, script: unit
    section.students << student

    assert_nil unit.redirect_to_unit_url(student)
  end

  test 'redirect_to_unit_url returns nil if user is not assigned to any unit in family' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    unit = create :script, name: 'my-script'

    assert_nil unit.redirect_to_unit_url(student)
  end

  test 'returns nil if latest assigned unit is an older version than the current unit' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018')
    section = create :section, script: csp1_2017
    section.students << student

    assert_nil csp1_2018.redirect_to_unit_url(student)
  end

  test 'redirect_to_unit_url returns unit url of latest assigned unit version in family for unit belonging to course family' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp')
    create :unit_group_unit, unit_group: csp_2017, script: csp1_2017, position: 1
    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp')
    create :unit_group_unit, unit_group: csp_2018, script: csp1_2018, position: 1
    section = create :section, unit_group: csp_2018
    section.students << student

    assert_equal csp1_2018.link, csp1_2017.redirect_to_unit_url(student)
  end

  test 'redirect_to_unit_url returns unit url of latest assigned unit version in family for unit not belonging to course family' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    courseg_2017 = create(:script, name: 'courseg-2017', family_name: 'courseg', version_year: '2017')
    courseg_2018 = create(:script, name: 'courseg-2018', family_name: 'courseg', version_year: '2018')
    section = create :section, script: courseg_2018
    section.students << student

    assert_equal courseg_2018.link, courseg_2017.redirect_to_unit_url(student)
  end

  test 'can_view_version? is true for teachers' do
    unit = create :script, name: 'my-script'
    teacher = create :teacher
    assert unit.can_view_version?(teacher)
  end

  test 'can_view_version? is true if unit is latest stable version in student locale or in English' do
    latest_in_english = create :script, name: 'english-only-script', family_name: 'courseg', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable, supported_locales: []
    latest_in_locale = create :script, name: 'localized-script', family_name: 'courseg', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable, supported_locales: ['it-it']
    student = create :student

    assert latest_in_english.can_view_version?(student, locale: 'it-it')
    assert latest_in_english.can_view_version?(nil)
    assert latest_in_locale.can_view_version?(student, locale: 'it-it')
    assert latest_in_locale.can_view_version?(nil, locale: 'it-it')
  end

  test 'can_view_version? is false if unit is unstable and has no progress and is not assigned' do
    unstable = create :script, name: 'new-unstable', family_name: 'courseg', version_year: '2018'
    student = create :student

    refute unstable.can_view_version?(student, locale: 'it-it')
  end

  test 'can_view_version? is true if student is assigned to unit' do
    unit = create :script, name: 'my-script', family_name: 'script-fam'
    student = create :student
    student.expects(:assigned_script?).returns(true)

    assert unit.can_view_version?(student)
  end

  test 'can_view_version? is true if student has progress in unit' do
    unit = create :script, name: 'my-script', family_name: 'script-fam', published_state: SharedConstants::PUBLISHED_STATE.stable
    student = create :student
    student.scripts << unit

    assert unit.can_view_version?(student)
  end

  test 'can_view_version? is true if student has progress in unit group unit belongs to' do
    unit_group = create :unit_group, family_name: 'unit-fam'
    unit1 = create :script, name: 'unit1', family_name: 'unit-fam'
    create :unit_group_unit, unit_group: unit_group, script: unit1, position: 1
    unit2 = create :script, name: 'unit2', family_name: 'unit-fam'
    create :unit_group_unit, unit_group: unit_group, script: unit2, position: 2
    student = create :student
    student.scripts << unit1

    assert unit2.can_view_version?(student)
  end

  test 'self.latest_stable_version is nil if no unit versions in family are stable in locale' do
    create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable, supported_locales: ["it-it"]
    create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable, supported_locales: ["it-it"]

    assert_nil Script.latest_stable_version('fake-family', locale: 'es-mx')
  end

  test 'self.latest_stable_version returns latest stable version for user locale' do
    create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable, supported_locales: ["it-it"]
    unit_2018 = create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable, supported_locales: ["it-it"]

    assert_equal unit_2018, Script.latest_stable_version('fake-family', locale: 'it-it')
  end

  test 'self.latest_stable_version returns latest stable version for English locales' do
    create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable
    unit_2018 = create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable

    assert_equal unit_2018, Script.latest_stable_version('fake-family')
    assert_equal unit_2018, Script.latest_stable_version('fake-family', locale: 'en-ca')
  end

  test 'self.latest_stable_version returns correct unit version in family if version_year is supplied' do
    unit_2017 = create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.stable
    create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.stable

    assert_equal unit_2017, Script.latest_stable_version('fake-family', version_year: '2017')
  end

  test 'self.latest_assigned_version returns nil if no units in family are assigned to user' do
    unit1 = create :script, name: 's-1', family_name: 'family-1'
    student = create :student
    student.scripts << unit1

    assert_nil Script.latest_assigned_version('family-2', student)
  end

  test 'self.latest_assigned_version returns latest assigned unit in family if unit is in course family' do
    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp')
    create :unit_group_unit, unit_group: csp_2017, script: csp1_2017, position: 1
    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp')
    create :unit_group_unit, unit_group: csp_2018, script: csp1_2018, position: 1

    student = create :student
    section = create :section, unit_group: csp_2017
    section.students << student

    assert_equal csp1_2017, Script.latest_assigned_version('csp', student)
  end

  test 'self.latest_assigned_version returns latest assigned unit in family if unit is not in course family' do
    student = create :student
    courseg_2017 = create(:script, name: 'courseg-2017', family_name: 'courseg', version_year: '2017')
    create(:script, name: 'courseg-2018', family_name: 'courseg', version_year: '2018')
    section = create :section, script: courseg_2017
    section.students << student

    assert_equal courseg_2017, Script.latest_assigned_version('courseg', student)
  end

  test 'banner image' do
    assert_nil Script.find_by_name('flappy').banner_image
    assert_equal 'banner_course1.jpg', Script.find_by_name('course1').banner_image
    assert_equal 'banner_course2.jpg', Script.find_by_name('course2').banner_image
    assert_nil Script.find_by_name('csf1').banner_image
  end

  test 'professional_learning_course?' do
    refute Script.find_by_name('flappy').professional_learning_course?
    assert Script.find_by_name('ECSPD').professional_learning_course?
  end

  test 'should summarize unit' do
    unit = create(:script, name: 'single-lesson-script')
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    lesson = create(:lesson, script: unit, name: 'lesson 1', lesson_group: lesson_group)
    create(:script_level, script: unit, lesson: lesson)
    unit.teacher_resources = [['curriculum', '/link/to/curriculum']]

    summary = unit.summarize

    assert_equal 1, summary[:lessons].count
    assert_nil summary[:peerReviewLessonInfo]
    assert_equal 0, summary[:peerReviewsRequired]
    assert_equal [['curriculum', '/link/to/curriculum']], summary[:teacher_resources]
  end

  test 'should summarize unit with peer reviews' do
    unit = create(:script, name: 'script-with-peer-review', peer_reviews_to_complete: 1)
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    lesson = create(:lesson, script: unit, name: 'lesson 1', lesson_group: lesson_group)
    create(:script_level, script: unit, lesson: lesson)
    lesson = create(:lesson, script: unit, name: 'lesson 2', lesson_group: lesson_group)
    create(:script_level, script: unit, lesson: lesson)

    summary = unit.summarize

    expected_peer_review_lesson = {
      name: "You must complete 1 reviews for this unit",
      lesson_group_display_name: "Peer Review",
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

    assert_equal 2, summary[:lessons].count
    assert_equal expected_peer_review_lesson, summary[:peerReviewLessonInfo]
    assert_equal 1, summary[:peerReviewsRequired]
  end

  test 'does not include peer reviews in unit that only requires instructor review' do
    # Our unit editing UI prevents creating a unit with a number of peer reviews
    # to complete that is not 0 when only instructor review is required.
    # That said, this test confirms that we would not display a peer review lesson even if this
    # did occur.
    unit = create(:script,
      name: 'script-with-peer-review',
      peer_reviews_to_complete: 1,
      only_instructor_review_required: true
    )
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    lesson = create(:lesson, script: unit, name: 'lesson 1', lesson_group: lesson_group)
    create(:script_level, script: unit, lesson: lesson)

    summary = unit.summarize

    assert_nil summary[:peerReviewLessonInfo]
  end

  test 'can summarize unit for lesson plan' do
    unit = create :script, name: 'my-script'
    lesson_group = create :lesson_group, key: 'lg-1', script: unit
    lesson_group2 = create :lesson_group, key: 'lg-2', script: unit
    lesson_group3 = create :lesson_group, key: 'lg-3', script: unit
    create(
      :lesson,
      lesson_group: lesson_group,
      script: unit,
      name: 'Lesson 1',
      key: 'lesson-1',
      has_lesson_plan: true,
      lockable: false,
      relative_position: 1,
      absolute_position: 1
    )
    create(
      :lesson,
      lesson_group: lesson_group,
      script: unit,
      name: 'Lesson 2',
      key: 'lesson-2',
      has_lesson_plan: false,
      lockable: false,
      relative_position: 2,
      absolute_position: 2
    )

    create(
      :lesson,
      lesson_group: lesson_group2,
      script: unit,
      name: 'Lesson 3',
      key: 'lesson-3',
      has_lesson_plan: true,
      lockable: false,
      relative_position: 3,
      absolute_position: 3
    )

    create(
      :lesson,
      lesson_group: lesson_group3,
      script: unit,
      name: 'Lesson 4',
      key: 'lesson-4',
      has_lesson_plan: false,
      lockable: false,
      relative_position: 4,
      absolute_position: 4
    )

    summary = unit.summarize_for_lesson_show
    assert_equal '/s/my-script', summary[:link]
    # only includes lesson groups with lessons with lesson plans
    assert_equal 2, summary[:lessonGroups].count
    # only includes lessons with lesson plans
    assert_equal 1, summary[:lessonGroups][0][:lessons].count
    assert_equal 'lesson-1', summary[:lessonGroups][0][:lessons][0][:key]
    assert_equal '/s/my-script/lessons/1', summary[:lessonGroups][0][:lessons][0][:link]
  end

  test 'can summarize unit for student lesson plan' do
    unit = create :script, name: 'my-script'
    lesson_group = create :lesson_group, script: unit
    lesson_group2 = create :lesson_group, key: 'lg-2', script: unit
    lesson_group3 = create :lesson_group, key: 'lg-3', script: unit
    create(
      :lesson,
      lesson_group: lesson_group,
      script: unit,
      name: 'Lesson 1',
      key: 'lesson-1',
      has_lesson_plan: true,
      lockable: false,
      relative_position: 1,
      absolute_position: 1
    )
    create(
      :lesson,
      lesson_group: lesson_group,
      script: unit,
      name: 'Lesson 2',
      key: 'lesson-2',
      has_lesson_plan: false,
      lockable: false,
      relative_position: 2,
      absolute_position: 2
    )

    create(
      :lesson,
      lesson_group: lesson_group2,
      script: unit,
      name: 'Lesson 3',
      key: 'lesson-3',
      has_lesson_plan: true,
      lockable: false,
      relative_position: 3,
      absolute_position: 3
    )

    create(
      :lesson,
      lesson_group: lesson_group3,
      script: unit,
      name: 'Lesson 4',
      key: 'lesson-4',
      has_lesson_plan: false,
      lockable: false,
      relative_position: 4,
      absolute_position: 4
    )

    summary = unit.summarize_for_lesson_show(true)
    assert_equal '/s/my-script', summary[:link]
    # only includes lesson groups with lessons with lesson plans
    assert_equal 2, summary[:lessonGroups].count
    # only includes lessons with lesson plans
    assert_equal 1, summary[:lessonGroups][0][:lessons].count
    assert_equal 'lesson-1', summary[:lessonGroups][0][:lessons][0][:key]
    # lesson links end with /student
    assert_equal '/s/my-script/lessons/1/student', summary[:lessonGroups][0][:lessons][0][:link]
  end

  class SummarizeVisibleAfterScriptTests < ActiveSupport::TestCase
    setup do
      @student = create :student
      @teacher = create :teacher
      @levelbuilder = create :levelbuilder

      Timecop.freeze(Time.new(2020, 3, 27, 0, 0, 0, "-07:00"))

      @unit = create(:script, name: 'script-with-visible-after')
      @lesson_group = create(:lesson_group, key: 'key1', script: @unit)
      lesson_no_visible_after = create(:lesson, script: @unit, name: 'Lesson 1', lesson_group: @lesson_group)
      create(:script_level, script: @unit, lesson: lesson_no_visible_after)
      lesson_future_visible_after = create(:lesson, script: @unit, name: 'Lesson 2', visible_after: '2020-04-01 08:00:00 -0700', lesson_group: @lesson_group)
      create(:script_level, script: @unit, lesson: lesson_future_visible_after)
      lesson_past_visible_after = create(:lesson, script: @unit, name: 'Lesson 3', visible_after: '2020-03-01 08:00:00 -0700', lesson_group: @lesson_group)
      create(:script_level, script: @unit, lesson: lesson_past_visible_after)
    end

    teardown do
      Timecop.return
    end

    test 'should summarize unit with visible after dates for unsigned in user' do
      summary = @unit.summarize(true, nil, false)
      assert_equal 2, summary[:lessons].count
    end

    test 'should summarize unit with visible after dates for teacher' do
      summary = @unit.summarize(true, @teacher, false)
      assert_equal 2, summary[:lessons].count
    end

    test 'should summarize unit with visible after dates for student' do
      summary = @unit.summarize(true, @student, false)
      assert_equal 2, summary[:lessons].count
    end

    test 'should summarize unit with visible after dates for levelbuilder' do
      summary = @unit.summarize(true, @levelbuilder, false)
      assert_equal 3, summary[:lessons].count
    end
  end

  test 'should generate a shorter summary for header' do
    unit = create(:script, name: 'single-lesson-script')
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    lesson = create(:lesson, script: unit, name: 'lesson 1', lesson_group: lesson_group)
    create(:script_level, script: unit, lesson: lesson)

    expected = {
      name: 'single-lesson-script',
      disablePostMilestone: false,
      isHocScript: false,
      student_detail_progress_view: false,
      age_13_required: false,
      is_csf: false,
    }
    assert_equal expected, unit.summarize_header
  end

  test 'should exclude lessons if include_lessons is false' do
    unit = create(:script, name: 'single-lesson-script')
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    lesson = create(:lesson, script: unit, name: 'lesson 1', lesson_group: lesson_group)
    create(:script_level, script: unit, lesson: lesson)

    assert_nil unit.summarize(false)[:lessons]
  end

  test 'summarize includes show_calendar' do
    unit = create(:script, name: 'calendar-script')

    unit.is_migrated = true
    unit.show_calendar = true
    assert unit.show_calendar
    summary = unit.summarize
    assert summary[:showCalendar]

    unit.is_migrated = true
    unit.show_calendar = false
    refute unit.show_calendar
    summary = unit.summarize
    refute summary[:showCalendar]

    unit.is_migrated = false
    unit.show_calendar = true
    summary = unit.summarize
    refute summary[:showCalendar]
  end

  test 'summarize includes has_verified_resources' do
    unit = create(:script, name: 'resources-script')

    unit.has_verified_resources = true
    assert unit.has_verified_resources
    summary = unit.summarize
    assert summary[:has_verified_resources]

    unit.has_verified_resources = false
    refute unit.has_verified_resources
    summary = unit.summarize
    refute summary[:has_verified_resources]
  end

  test 'summarize includes show_course_unit_version_warning' do
    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017')
    create(:unit_group_unit, unit_group: csp_2017, script: csp1_2017, position: 1)

    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018')
    create(:unit_group_unit, unit_group: csp_2018, script: csp1_2018, position: 1)

    refute csp1_2017.summarize[:show_course_unit_version_warning]

    user = create(:student)
    refute csp1_2017.summarize(true, user)[:show_course_unit_version_warning]
    refute csp1_2018.summarize(true, user)[:show_course_unit_version_warning]

    create(:user_script, user: user, script: csp1_2017)
    refute csp1_2017.summarize(true, user)[:show_course_unit_version_warning]
    assert csp1_2018.summarize(true, user)[:show_course_unit_version_warning]

    create(:user_script, user: user, script: csp1_2018)
    refute csp1_2017.summarize(true, user)[:show_course_unit_version_warning]
    assert csp1_2018.summarize(true, user)[:show_course_unit_version_warning]
  end

  test 'summarize includes show_script_version_warning' do
    foo17 = create(:script, name: 'foo-2017', family_name: 'foo', version_year: '2017')
    foo18 = create(:script, name: 'foo-2018', family_name: 'foo', version_year: '2018')
    user = create(:student)

    refute foo17.summarize[:show_script_version_warning]

    refute foo17.summarize(true, user)[:show_script_version_warning]
    refute foo18.summarize(true, user)[:show_script_version_warning]

    create(:user_script, user: user, script: foo17)
    refute foo17.summarize(true, user)[:show_script_version_warning]
    assert foo18.summarize(true, user)[:show_script_version_warning]

    user_unit_18 = create(:user_script, user: user, script: foo18)
    refute foo17.summarize(true, user)[:show_script_version_warning]
    assert foo18.summarize(true, user)[:show_script_version_warning]

    # version warning can be dismissed
    user_unit_18.version_warning_dismissed = true
    user_unit_18.save!
    refute foo18.summarize(true, user)[:show_script_version_warning]
  end

  test 'summarize only shows one version warning' do
    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp1', version_year: '2017')
    create(:unit_group_unit, unit_group: csp_2017, script: csp1_2017, position: 1)

    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp1', version_year: '2018')
    create(:unit_group_unit, unit_group: csp_2018, script: csp1_2018, position: 1)

    user = create(:student)
    create(:user_script, user: user, script: csp1_2017)
    assert csp1_2018.summarize(true, user)[:show_course_unit_version_warning]
    refute csp1_2018.summarize(true, user)[:show_script_version_warning]
  end

  test 'summarize includes versions' do
    foo17 = create(:script, name: 'foo-2017', family_name: 'foo', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.preview)
    create(:script, name: 'foo-2018', family_name: 'foo', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.preview)

    versions = foo17.summarize[:versions]
    assert_equal 2, versions.length
    assert_equal 'foo-2018', versions[0][:name]
    assert_equal '2018', versions[0][:version_year]
    assert_equal '2018', versions[0][:version_title]
    assert_equal 'foo-2017', versions[1][:name]
    assert_equal '2017', versions[1][:version_year]
    assert_equal '2017', versions[1][:version_title]
  end

  test 'summarize excludes unlaunched versions' do
    foo17 = create(:script, name: 'foo-2017', family_name: 'foo', version_year: '2017', published_state: SharedConstants::PUBLISHED_STATE.preview)
    create(:script, name: 'foo-2018', family_name: 'foo', version_year: '2018', published_state: SharedConstants::PUBLISHED_STATE.preview)
    create(:script, name: 'foo-2019', family_name: 'foo', version_year: '2019', published_state: SharedConstants::PUBLISHED_STATE.beta)

    versions = foo17.summarize[:versions]
    assert_equal 2, versions.length
    assert_equal 'foo-2018', versions[0][:name]
    assert_equal 'foo-2017', versions[1][:name]

    versions = foo17.summarize(true, create(:teacher))[:versions]
    assert_equal 2, versions.length
    assert_equal 'foo-2018', versions[0][:name]
    assert_equal 'foo-2017', versions[1][:name]

    teacher = create(:teacher)
    teacher.update(permission: UserPermission::HIDDEN_SCRIPT_ACCESS)
    versions = foo17.summarize(true, teacher)[:versions]
    assert_equal 3, versions.length
    assert_equal 'foo-2019', versions[0][:name]
    assert_equal 'foo-2018', versions[1][:name]
    assert_equal 'foo-2017', versions[2][:name]
  end

  test 'summarize includes show assign button' do
    unit = create(:script, name: 'script', published_state: SharedConstants::PUBLISHED_STATE.preview)

    # No user, show_assign_button set to nil
    assert_nil unit.summarize[:show_assign_button]

    # Teacher should be able to assign a launched unit.
    assert_equal SharedConstants::PUBLISHED_STATE.preview, unit.summarize[:publishedState]
    assert_equal true, unit.summarize(true, create(:teacher))[:show_assign_button]

    # Teacher should not be able to assign a unlaunched script.
    hidden_unit = create(:script, name: 'unassignable-hidden', published_state: SharedConstants::PUBLISHED_STATE.beta)
    assert_equal SharedConstants::PUBLISHED_STATE.beta, hidden_unit.summarize[:publishedState]
    assert_equal false, hidden_unit.summarize(true, create(:teacher))[:show_assign_button]

    # Student should not be able to assign a unit,
    # regardless of visibility.
    assert_equal SharedConstants::PUBLISHED_STATE.preview, unit.summarize[:publishedState]
    assert_nil unit.summarize(true, create(:student))[:show_assign_button]
  end

  test 'summarize includes bonus levels for lessons if include_bonus_levels and include_lessons are true' do
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    level = create :level
    create :script_level, lesson: lesson, levels: [level], bonus: true

    response = unit.summarize(true, nil, true)
    assert_equal 1, response[:lessons].length
    assert_equal 1, response[:lessons].first[:levels].length
    assert_equal [level.id.to_s], response[:lessons].first[:levels].first[:ids]
  end

  test 'summarize preprocesses markdown' do
    course_offering = create :course_offering, key: 'offering'
    course_version = create :course_version, course_offering: course_offering
    resource = create :resource, key: 'resource', course_version: course_version
    vocab = create :vocabulary, key: 'vocab', course_version: course_version

    source = "We support [r #{Services::GloballyUniqueIdentifiers.build_resource_key(resource)}] resource links and [v #{Services::GloballyUniqueIdentifiers.build_vocab_key(vocab)}] vocabulary definitions"
    expected = "We support [fake name](fake.url) resource links and <span class=\"vocab\" title=\"definition\">word</span> vocabulary definitions"
    unit = create :script
    unit.stubs(:localized_description).returns(source)
    unit.stubs(:localized_student_description).returns(source)
    summary = unit.summarize

    assert_equal(expected, summary[:description])
    assert_equal(expected, summary[:studentDescription])
  end

  test 'should generate PLC objects' do
    unit_file = File.join(self.class.fixture_path, 'test-plc.script')
    unit_names, custom_i18n = Script.setup([unit_file])
    unit = Script.find_by!(name: unit_names.first)
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

    unit.save! # Need to trigger an update because i18n strings weren't loaded
    assert unit.professional_learning_course?
    assert_equal 'Test plc course', unit.professional_learning_course
    assert_equal 42, unit.peer_reviews_to_complete

    course_unit = unit.plc_course_unit
    assert_equal 'PLC Test', course_unit.unit_name
    assert_equal 'PLC test fixture script', course_unit.unit_description

    lm = unit.lessons.first.plc_learning_module
    assert_equal 'Sample Module', lm.name
    assert_equal 1, course_unit.plc_learning_modules.count
    assert_equal lm, course_unit.plc_learning_modules.first
    assert_equal Plc::LearningModule::CONTENT_MODULE, lm.module_type
  end

  test 'expect error on bad module types' do
    unit_file = File.join(self.class.fixture_path, 'test-bad-plc-module.script')
    assert_raises ActiveRecord::RecordInvalid do
      Script.setup([unit_file])
    end
  end

  test 'unit name format validation' do
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

  test 'can edit existing unit with invalid name' do
    unit = create :script, name: 'Invalid Name', skip_name_format_validation: true
    unit.update!(login_required: true)
  end

  test 'names lessons appropriately when unit has lockable lessons' do
    create :level, name: 'LockableAssessment1'
    create :level, name: 'NonLockableAssessment1'
    create :level, name: 'NonLockableAssessment2'
    create :level, name: 'NonLockableAssessment3'

    input_dsl = <<-DSL.gsub(/^\s+/, '')
      lesson 'NonLockable1', display_name: 'NonLockable1'
      assessment 'NonLockableAssessment1';
      lesson 'NonLockable2', display_name: 'NonLockable2'
      assessment 'NonLockableAssessment2';
      lesson 'NonLockable3', display_name: 'NonLockable3'
      assessment 'NonLockableAssessment3';
    DSL
    unit_data, _ = ScriptDSL.parse(input_dsl, 'a filename')
    unit = Script.add_unit({name: 'test_script'}, unit_data[:lesson_groups])

    # Everything has Lesson <number> when nothing is lockable
    assert (/^Lesson 1:/.match(unit.lessons[0].localized_title))
    assert (/^Lesson 2:/.match(unit.lessons[1].localized_title))
    assert (/^Lesson 3:/.match(unit.lessons[2].localized_title))

    input_dsl = <<-DSL.gsub(/^\s+/, '')
      lesson 'Lockable1', display_name: 'Lockable1', lockable: true
      assessment 'LockableAssessment1';
      lesson 'NonLockable1', display_name: 'NonLockable1'
      assessment 'NonLockableAssessment1';
      lesson 'NonLockable2', display_name: 'NonLockable2'
      assessment 'NonLockableAssessment2';
    DSL
    unit_data, _ = ScriptDSL.parse(input_dsl, 'a filename')
    unit = Script.add_unit({name: 'test_script'}, unit_data[:lesson_groups])

    # When first lesson is lockable, it has no lesson number, and the next lesson starts at 1
    assert (/^Lesson/.match(unit.lessons[0].localized_title).nil?)
    assert (/^Lesson 1:/.match(unit.lessons[1].localized_title))
    assert (/^Lesson 2:/.match(unit.lessons[2].localized_title))

    input_dsl = <<-DSL.gsub(/^\s+/, '')
      lesson 'NonLockable1', display_name: 'NonLockable1'
      assessment 'NonLockableAssessment1';
      lesson 'Lockable1', display_name: 'Lockable1', lockable: true
      assessment 'LockableAssessment1';
      lesson 'NonLockable2', display_name: 'NonLockable2'
      assessment 'NonLockableAssessment2';
    DSL
    unit_data, _ = ScriptDSL.parse(input_dsl, 'a filename')
    unit = Script.add_unit({name: 'test_script'}, unit_data[:lesson_groups])

    # When only second lesson is lockable, we count non-lockable lessons appropriately
    assert (/^Lesson 1:/.match(unit.lessons[0].localized_title))
    assert (/^Lesson/.match(unit.lessons[1].localized_title).nil?)
    assert (/^Lesson 2:/.match(unit.lessons[2].localized_title))
  end

  test 'Script DSL fails when creating invalid lockable lessons' do
    create :level, name: 'Level1'
    create :level, name: 'LockableAssessment1'
    input_dsl = <<-DSL.gsub(/^\s+/, '')
      lesson 'Lockable1', display_name: 'Lockable1', lockable: true
      assessment 'LockableAssessment1';
      level 'Level1';
    DSL
    unit_data, _ = ScriptDSL.parse(input_dsl, 'a filename')
    assert_raises do
      Script.add_unit({name: 'test_script'}, unit_data[:lesson_groups])
    end
  end

  test "update_i18n without metdata" do
    # This simulates us doing a seed after adding new lessons to multiple of
    # our unit files. Doing so should update our object with the new lesson
    # names (which we would then persist to sripts.en.yml)
    original_yml = YAML.load_file(Rails.root.join('test', 'en.yml'))

    course3_yml = {'lessons' => {'course3' => {'name' => 'course3'}}}
    course4_yml = {'lessons' => {'course4' => {'name' => 'course4'}}}

    lessons_i18n = {
      'course3' => course3_yml,
      'course4' => course4_yml
    }

    # updated represents what will get written to scripts.en.yml
    updated = Script.update_i18n(original_yml, lessons_i18n)

    assert_equal course3_yml, updated['en']['data']['script']['name']['course3']
    assert_equal course4_yml, updated['en']['data']['script']['name']['course4']
  end

  test "update_i18n with metadata" do
    # In this case, we're modifying a lesson description without changing any
    # lesson names
    original_yml = YAML.load_file(Rails.root.join('test', 'en.yml'))

    # No updates to lesson names
    lessons_i18n = {'en' => {'data' => {'name' => {}}}}

    unit_name = 'Report Script'

    metadata = {
      'title' => 'Report Script Name',
      'description' => 'This is what Report Script is all about',
      stage_descriptions: [{
        'name' => 'Report Lesson 1',
        'descriptionStudent' => 'lesson 1 is pretty neat',
        'descriptionTeacher' => 'This is what you should know as a teacher'
      }].to_json
    }

    updated = Script.update_i18n(original_yml, lessons_i18n, unit_name, metadata)

    updated_report_unit = updated['en']['data']['script']['name']['Report Script']

    assert_equal 'Report Script Name', updated_report_unit['title']
    assert_equal 'This is what Report Script is all about', updated_report_unit['description']
    assert_equal 'report-lesson-1', updated_report_unit['lessons']['Report Lesson 1']['name']
    assert_equal 'lesson 1 is pretty neat', updated_report_unit['lessons']['Report Lesson 1']['description_student']
    assert_equal 'This is what you should know as a teacher', updated_report_unit['lessons']['Report Lesson 1']['description_teacher']
  end

  test "update_i18n with new lesson display name" do
    # This simulates us doing a seed after adding new lessons to multiple of
    # our unit files. Doing so should update our object with the new lesson
    # names (which we would then persist to sripts.en.yml)
    original_yml = YAML.load_file(Rails.root.join('test', 'en.yml'))

    course3_yml = {'lessons' => {'course3' => {'name' => 'course3'}}}

    lessons_i18n = {
      'course3' => course3_yml,
    }

    # updated represents what will get written to scripts.en.yml
    updated = Script.update_i18n(original_yml, lessons_i18n)

    assert_equal course3_yml, updated['en']['data']['script']['name']['course3']

    course3_yml = {'lessons' => {'course3' => {'name' => 'course3-changed'}}}

    lessons_i18n = {
      'course3' => course3_yml,
    }

    # updated represents what will get written to scripts.en.yml
    updated = Script.update_i18n(original_yml, lessons_i18n)

    assert_equal course3_yml, updated['en']['data']['script']['name']['course3']
  end

  test '!text_to_speech_enabled? by default' do
    refute create(:script).text_to_speech_enabled?
  end

  test 'text_to_speech_enabled? if tts true' do
    unit = create :script, tts: true
    assert unit.text_to_speech_enabled?
  end

  test 'FreeResponse level is listed in text_response_levels' do
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    level = create :free_response
    create :script_level, script: unit, lesson: lesson, levels: [level]

    assert_equal level, unit.text_response_levels.first[:levels].first
  end

  test 'Multi level is not listed in text_response_levels' do
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    level = create :multi
    create :script_level, script: unit, lesson: lesson, levels: [level]

    assert_empty unit.text_response_levels
  end

  test 'contained FreeResponse level is listed in text_response_levels' do
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    contained_level = create :free_response, name: 'Contained Free Response'
    level = create :maze, properties: {contained_level_names: [contained_level.name]}
    create :script_level, script: unit, lesson: lesson, levels: [level]

    assert_equal contained_level, unit.text_response_levels.first[:levels].first
  end

  test 'contained Multi level is not listed in text_response_levels' do
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    contained_level = create :multi, name: 'Contained Multi'
    level = create :maze, properties: {contained_level_names: [contained_level.name]}
    create :script_level, script: unit, lesson: lesson, levels: [level]

    assert_empty unit.text_response_levels
  end

  test "course_link retuns nil if unit is in no courses" do
    unit = create :script
    create :unit_group, name: 'csp'

    assert_nil unit.course_link
  end

  test "course_link returns nil if unit is in two courses" do
    unit = create :script
    unit_group = create :unit_group, name: 'csp'
    other_unit_group = create :unit_group, name: 'othercsp'
    create :unit_group_unit, position: 1, unit_group: unit_group, script: unit
    create :unit_group_unit, position: 1, unit_group: other_unit_group, script: unit

    assert_nil unit.course_link
  end

  test "course_link returns course_path if unit is in one course" do
    unit = create :script
    unit_group = create :unit_group, name: 'csp'
    create :unit_group_unit, position: 1, unit_group: unit_group, script: unit

    assert_equal '/courses/csp', unit.course_link
  end

  test 'course_link uses cache' do
    populate_cache_and_disconnect_db
    Script.stubs(:should_cache?).returns true
    UnitGroup.stubs(:should_cache?).returns true
    unit = Script.get_from_cache(@unit_in_unit_group.name)
    assert_equal "/courses/#{@unit_group.name}", unit.course_link
  end

  test "logged_out_age_13_required?" do
    unit = create :script, login_required: false
    lesson_group = create :lesson_group, script: unit
    level = create :applab
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    create :script_level, script: unit, lesson: lesson, levels: [level]

    # return true when we have an applab level
    assert_equal true, unit.logged_out_age_13_required?

    # returns false is login_required is true
    unit.login_required = true
    assert_equal false, unit.logged_out_age_13_required?

    # returns false if we don't have any applab/gamelab/weblab levels
    unit = create :script, login_required: false
    lesson_group = create :lesson_group, script: unit
    level = create :maze
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    create :script_level, script: unit, lesson: lesson, levels: [level]
    assert_equal false, unit.logged_out_age_13_required?
  end

  test "get_bonus_script_levels" do
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson1 = create :lesson, script: unit, lesson_group: lesson_group
    create :lesson, script: unit, lesson_group: lesson_group
    lesson3 = create :lesson, script: unit, lesson_group: lesson_group
    create :script_level, script: unit, lesson: lesson1, bonus: true
    create :script_level, script: unit, lesson: lesson1, bonus: true
    create :script_level, script: unit, lesson: lesson3, bonus: true
    create :script_level, script: unit, lesson: lesson3, bonus: true

    bonus_levels1 = unit.get_bonus_script_levels(lesson1)
    bonus_levels3 = unit.get_bonus_script_levels(lesson3)

    assert_equal 1, bonus_levels1.length
    assert_equal 1, bonus_levels1[0][:lessonNumber]
    assert_equal 2, bonus_levels1[0][:levels].length

    assert_equal 2, bonus_levels3.length
    assert_equal 1, bonus_levels3[0][:lessonNumber]
    assert_equal 3, bonus_levels3[1][:lessonNumber]
    assert_equal 2, bonus_levels3[0][:levels].length
    assert_equal 2, bonus_levels3[1][:levels].length
  end

  test 'can make a challenge level not a challenge level' do
    l = create :level
    old_dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}', challenge: true
    UNIT
    new_dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    unit = Script.add_unit(
      {name: 'challengeTestScript'},
      ScriptDSL.parse(old_dsl, 'a filename')[0][:lesson_groups]
    )
    assert unit.script_levels.first.challenge
    original_script_level_id = unit.script_levels.first.id

    unit = Script.add_unit(
      {name: 'challengeTestScript'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
    )

    refute unit.script_levels.first.challenge
    assert_equal original_script_level_id, unit.script_levels.first.id
  end

  test 'can make a bonus level not a bonus level' do
    l = create :level
    old_dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}', bonus: true
    UNIT
    new_dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    unit = Script.add_unit(
      {name: 'challengeTestScript'},
      ScriptDSL.parse(old_dsl, 'a filename')[0][:lesson_groups]
    )
    assert unit.script_levels.first.bonus
    original_script_level_id = unit.script_levels.first.id

    unit = Script.add_unit(
      {name: 'challengeTestScript'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
    )

    refute unit.script_levels.first.bonus
    assert_equal original_script_level_id, unit.script_levels.first.id
  end

  test 'can unset the project_widget_visible attribute' do
    l = create :level
    old_dsl = <<-UNIT
      project_widget_visible true
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    new_dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    unit_data, _ = ScriptDSL.parse(old_dsl, 'a filename')
    unit = Script.add_unit(
      {
        name: 'challengeTestScript',
        properties: Script.build_property_hash(unit_data)
      },
      unit_data[:lesson_groups]
    )
    assert unit.project_widget_visible

    unit_data, _ = ScriptDSL.parse(new_dsl, 'a filename')
    unit = Script.add_unit(
      {
        name: 'challengeTestScript',
        properties: Script.build_property_hash(unit_data)
      },
      unit_data[:lesson_groups]
    )

    refute unit.project_widget_visible
  end

  test 'can unset the announcements attribute' do
    l = create :level
    old_dsl = <<-UNIT
      announcements [{"notice"=>"notice1", "details"=>"details1", "link"=>"link1", "type"=>"information"}]
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    new_dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    unit_data, _ = ScriptDSL.parse(old_dsl, 'a filename')
    unit = Script.add_unit(
      {
        name: 'challengeTestScript',
        properties: Script.build_property_hash(unit_data)
      },
      unit_data[:lesson_groups]
    )
    assert unit.announcements

    unit_data, _ = ScriptDSL.parse(new_dsl, 'a filename')
    unit = Script.add_unit(
      {
        name: 'challengeTestScript',
        properties: Script.build_property_hash(unit_data)
      },
      unit_data[:lesson_groups]
    )

    refute unit.announcements
  end

  test 'can set custom curriculum path' do
    l = create :level
    dsl = <<-UNIT
      curriculum_path '//example.com/{LOCALE}/foo/{LESSON}'
      lesson 'Lesson1', display_name: 'Lesson1', has_lesson_plan: true
      level '#{l.name}'
      lesson 'Lesson2', display_name: 'Lesson2', has_lesson_plan: true
      level '#{l.name}'
    UNIT
    unit_data, _ = ScriptDSL.parse(dsl, 'a filename')
    unit = Script.add_unit(
      {
        name: 'curriculumTestScript',
        properties: Script.build_property_hash(unit_data),
      },
      unit_data[:lesson_groups]
    )
    assert_equal CDO.curriculum_url('en-us', 'foo/1'), unit.lessons.first.lesson_plan_html_url
    with_locale(:'it-IT') do
      assert_equal CDO.curriculum_url('it-IT', 'foo/2'), unit.lessons.last.lesson_plan_html_url
    end

    unit.curriculum_path = '//example.com/foo/{LESSON}'
    unit.save!
    assert_equal '//example.com/foo/1', unit.lessons.first.lesson_plan_html_url
    assert_equal '//example.com/foo/2', unit.lessons.last.lesson_plan_html_url

    unit.curriculum_path = nil
    unit.save!
    assert_equal '//test.code.org/curriculum/curriculumTestScript/1/Teacher', unit.lessons.first.lesson_plan_html_url
  end

  test 'clone unit with suffix' do
    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    assert_equal 1, unit.announcements.count

    Script.stubs(:unit_directory).returns(self.class.fixture_path)
    unit_copy = unit.clone_with_suffix('copy')
    assert_equal 'test-fixture-copy', unit_copy.name
    assert_nil unit_copy.family_name
    assert_nil unit_copy.version_year
    assert_equal false, unit_copy.stable?
    assert_nil unit_copy.announcements

    # Validate levels.
    assert_equal 5, unit_copy.levels.count
    unit_copy.levels.each_with_index do |level, i|
      level_num = i + 1
      assert_equal "Level #{level_num}_copy", level.name
      old_level = Level.find_by_name("Level #{level_num}")
      assert_equal old_level.level_num, level.level_num
      assert_equal old_level.id, level.parent_level_id
      assert_equal '_copy', level.name_suffix
    end

    # Validate lessons. We've already done some validation of level contents, so
    # this time just validate their names.
    assert_equal 2, unit_copy.lessons.count

    lesson1 = unit_copy.lessons.first
    assert_equal 'lesson1', lesson1.key
    assert_equal 'Lesson One', lesson1.name
    assert_equal(
      'Level 1_copy,Level 2_copy,Level 3_copy',
      lesson1.script_levels.map(&:levels).flatten.map(&:name).join(',')
    )

    lesson2 = unit_copy.lessons.last
    assert_equal 'lesson2', lesson2.key
    assert_equal 'Lesson Two', lesson2.name
    assert_equal(
      'Level 4_copy,Level 5_copy',
      lesson2.script_levels.map(&:levels).flatten.map(&:name).join(',')
    )
  end

  # This test case doesn't cover version year (only
  # updated under certain conditions). These are covered in other test cases.
  test 'clone with suffix clears certain properties' do
    unit_file = File.join(self.class.fixture_path, "test-all-properties.script")
    unit_names, _ = Script.setup([unit_file])
    unit = Script.find_by!(name: unit_names.first)

    # all properties that should change
    assert unit.tts
    assert_equal SharedConstants::PUBLISHED_STATE.pilot, unit.published_state
    assert unit.announcements
    assert unit.is_course

    # some properties that should not change
    assert unit.curriculum_path

    Script.stubs(:unit_directory).returns(self.class.fixture_path)
    unit_copy = unit.clone_with_suffix('copy')
    assert_equal 'test-all-properties-copy', unit_copy.name

    # all properties that should change
    refute unit_copy.tts
    assert_equal SharedConstants::PUBLISHED_STATE.beta, unit_copy.published_state
    refute unit_copy.announcements
    refute unit_copy.is_course

    # some properties that should not change
    assert unit_copy.curriculum_path
  end

  test 'clone versioned unit with suffix' do
    unit_file = File.join(self.class.fixture_path, "test-fixture-versioned-1801.script")
    unit_names, _ = Script.setup([unit_file])
    unit = Script.find_by!(name: unit_names.first)

    Script.stubs(:unit_directory).returns(self.class.fixture_path)
    unit_copy = unit.clone_with_suffix('1802')

    # make sure the old suffix is removed before the new one is added.
    assert_equal 'test-fixture-versioned-1802', unit_copy.name
    assert_equal 'versioned', unit_copy.family_name
    assert_equal '1802', unit_copy.version_year
    assert_equal false, unit_copy.stable?
  end

  test 'clone unit with variants' do
    unit_file = File.join(self.class.fixture_path, "test-fixture-experiments.script")
    unit_names, _ = Script.setup([unit_file])
    unit = Script.find_by!(name: unit_names.first)

    Script.stubs(:unit_directory).returns(self.class.fixture_path)
    unit_copy = unit.clone_with_suffix('copy')
    assert_equal 'test-fixture-experiments-copy', unit_copy.name

    assert_equal 4, unit_copy.script_levels.count
    unit_copy.script_levels.each do |sl|
      assert_equal 1, sl.levels.count
      assert sl.active?(sl.levels.first)
      refute sl.variants?
    end
    expected_level_names = ['Level 1_copy', 'Level 4_copy', 'Level 5_copy', 'Level 8_copy']
    actual_level_names = unit_copy.script_levels.map(&:levels).map(&:first).map(&:name)
    assert_equal expected_level_names, actual_level_names

    new_dsl = <<~UNIT
      published_state 'beta'

      lesson 'lesson1', display_name: 'lesson1', has_lesson_plan: false
      level 'Level 1_copy'
      level 'Level 4_copy'
      level 'Level 5_copy'
      level 'Level 8_copy'

    UNIT

    assert_equal new_dsl, ScriptDSL.serialize_to_string(unit_copy)
  end

  test 'clone with suffix and add editor experiment' do
    unit_names, _ = Script.setup([@unit_file])
    unit = Script.find_by!(name: unit_names.first)
    assert_equal 1, unit.announcements.count

    Script.stubs(:unit_directory).returns(self.class.fixture_path)
    unit_copy = unit.clone_with_suffix('copy', editor_experiment: 'script-editors')
    assert_equal 'test-fixture-copy', unit_copy.name
    assert_equal 'script-editors', unit_copy.editor_experiment

    # Validate levels.
    assert_equal 5, unit_copy.levels.count
    unit_copy.levels.each_with_index do |level, i|
      level_num = i + 1
      assert_equal "Level #{level_num}_copy", level.name
      assert_equal 'script-editors', level.editor_experiment
    end
  end

  test "assignable_info: returns assignable info for a unit" do
    unit = create(:script, name: 'fake-script', published_state: 'beta', lesson_extras_available: true)
    assignable_info = unit.assignable_info

    assert_equal("fake-script *", assignable_info[:name])
    assert_equal("fake-script", assignable_info[:script_name])
    assert_equal("Other", assignable_info[:category])
    assert(assignable_info[:lesson_extras_available])
  end

  test "assignable_info: correctly translates unit info" do
    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      'data' => {
        'script' => {
          'category' => {
            'csp17_category_name' => 'CSP Test'
          },
          'name' => {
            'csp1-2017' => {
              'title' => 'CSP Unit 1 Test'
            }
          }
        }
      }
    }
    I18n.backend.store_translations test_locale, custom_i18n

    unit = build(:script, name: 'csp1-2017', published_state: SharedConstants::PUBLISHED_STATE.preview)
    assignable_info = unit.assignable_info

    assert_equal('CSP Unit 1 Test', assignable_info[:name])
    assert_equal('CSP Test', assignable_info[:category])
  end

  # This test checks that all categories that may show up in the UI have
  # translation strings.
  test 'all visible categories have translations' do
    I18n.locale = 'en-US'

    # A course can belong to more than one category and only the first
    # category is shown in the UI (and thus needs a translation).

    # To determine the set of categories that must be translated, we first
    # collect the list of all units that are mapped to categories in
    # ScriptConstants::CATEGORIES.
    all_units = ScriptConstants::CATEGORIES.reduce(Set.new) do |scripts, (_, scripts_in_category)|
      scripts | scripts_in_category
    end

    # Add a unit that is not in any category so that the 'other' category
    # will be tested.
    all_units |= ['uncategorized-script']

    untranslated_categories = Set.new
    all_units.each do |unit|
      category = ScriptConstants.categories(unit)[0] || ScriptConstants::OTHER_CATEGORY_NAME
      translation = I18n.t("data.script.category.#{category}_category_name", default: nil)
      untranslated_categories.add(category) if translation.nil?
    end

    assert untranslated_categories.empty?,
      "The following categories are missing translations in scripts.en.yml '#{untranslated_categories}'"
  end

  test "self.valid_scripts: does not return unlaunched units when user is a student" do
    student = create(:student)

    units = Script.valid_scripts(student)
    refute has_unlaunched_unit?(units)
  end

  test "self.valid_scripts: does not return unlaunched units when user is a teacher" do
    teacher = create(:teacher)

    units = Script.valid_scripts(teacher)
    refute has_unlaunched_unit?(units)
  end

  test "self.valid_scripts: returns unlaunched units when user is an admin" do
    admin = create(:admin)

    units = Script.valid_scripts(admin)
    assert has_unlaunched_unit?(units)
  end

  test "self.valid_scripts: returns unlaunched units when user has hidden script access" do
    teacher = create(:teacher)
    teacher.update(permission: UserPermission::HIDDEN_SCRIPT_ACCESS)

    units = Script.valid_scripts(teacher)
    assert has_unlaunched_unit?(units)
  end

  test "self.valid_scripts: returns alternate unit if user has a course experiment with an alternate unit" do
    user = create(:user)
    unit = create(:script)
    alternate_unit = build(:script)

    UnitGroup.stubs(:has_any_course_experiments?).returns(true)
    Rails.cache.stubs(:fetch).returns([unit])
    unit.stubs(:alternate_script).returns(alternate_unit)

    units = Script.valid_scripts(user)
    assert_equal [alternate_unit], units
  end

  test "self.valid_scripts: returns original unit if user has a course experiment with no alternate unit" do
    user = create(:user)
    unit = create(:script)

    UnitGroup.stubs(:has_any_course_experiments?).returns(true)
    Rails.cache.stubs(:fetch).returns([unit])
    unit.stubs(:alternate_script).returns(nil)

    units = Script.valid_scripts(user)
    assert_equal [unit], units
  end

  test "self.valid_scripts: omits in-development units" do
    student = create :student
    teacher = create :teacher
    levelbuilder = create :levelbuilder
    create :script, published_state: SharedConstants::PUBLISHED_STATE.in_development
    assert Script.any?(&:in_development?)

    refute Script.valid_scripts(student).any?(&:in_development?)
    refute Script.valid_scripts(teacher).any?(&:in_development?)
    assert Script.valid_scripts(levelbuilder).any?(&:in_development?)
  end

  test "self.valid_scripts: omits pilot units" do
    student = create :student
    teacher = create :teacher
    levelbuilder = create :levelbuilder
    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    create :script, pilot_experiment: 'my-experiment', published_state: SharedConstants::PUBLISHED_STATE.pilot
    assert Script.any?(&:pilot?)

    refute Script.valid_scripts(student).any?(&:pilot?)
    refute Script.valid_scripts(teacher).any?(&:pilot?)
    assert Script.valid_scripts(pilot_teacher).any?(&:pilot?)
    assert Script.valid_scripts(levelbuilder).any?(&:pilot?)
  end

  test "self.valid_scripts: pilot experiment results not cached" do
    # This test is a regression test for LP-1578 where Script.valid_scripts
    # accidentally added pilot courses to the cached results which were then
    # returned to non-pilot teachers.

    # Start with an empty scripts table and empty cache
    Plc::CourseUnit.delete_all  # Delete rows that reference script table
    Script.delete_all
    Script.clear_cache

    teacher = create :teacher
    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    coursea_2019 = create :script, name: 'coursea-2019', published_state: 'preview'
    coursea_2020 = create :script, name: 'coursea-2020', published_state: 'pilot', pilot_experiment: 'my-experiment'

    assert_equal [coursea_2019], Script.valid_scripts(teacher)
    assert_equal [coursea_2019, coursea_2020], Script.valid_scripts(pilot_teacher)

    # This call to valid_scripts will hit the cache; verify that the call to
    # Script.valid_scripts(pilot_teacher) did not alter the cache.
    assert_equal [coursea_2019], Script.valid_scripts(teacher)
  end

  test "get_assessment_script_levels returns an empty list if no level groups" do
    unit = create(:script, name: 'test-no-levels')
    level_group_script_level = unit.get_assessment_script_levels
    assert_equal level_group_script_level, []
  end

  test "get_assessment_script_levels returns a list of script levels" do
    unit = create(:script, name: 'test-level-group')
    lesson_group = create(:lesson_group, script: unit)
    lesson = create(:lesson, lesson_group: lesson_group, script: unit)
    level_group = create(:level_group, name: 'assessment 1')
    script_level = create(:script_level, lesson: lesson, levels: [level_group], assessment: true, script: unit)

    assessment_script_levels = unit.get_assessment_script_levels
    assert_equal assessment_script_levels[0], script_level
  end

  test "self.modern_elementary_courses_available?" do
    course1_modern = create(:script, name: 'course1-modern', supported_locales: ["en-us", "it-it"])
    course2_modern = create(:script, name: 'course2-modern', supported_locales: ["fr-fr", "en-us"])

    Script.stubs(:modern_elementary_courses).returns([course1_modern, course2_modern])

    assert Script.modern_elementary_courses_available?("en-us")
    assert_not Script.modern_elementary_courses_available?("ch-ch")
    assert_not Script.modern_elementary_courses_available?("it-it")
    assert_not Script.modern_elementary_courses_available?("fr-fr")
  end

  test 'supported_locale_names' do
    unit = create :script
    assert_equal ['English'], unit.supported_locale_names

    unit.supported_locales = ['en-US']
    assert_equal ['English'], unit.supported_locale_names

    unit.supported_locales = ['fr-FR']
    assert_equal ['English', 'Français'], unit.supported_locale_names

    unit.supported_locales = ['fr-FR', 'ar-SA']
    assert_equal ['العربية', 'English', 'Français',], unit.supported_locale_names

    unit.supported_locales = ['en-US', 'fr-FR', 'ar-SA']
    assert_equal ['العربية', 'English', 'Français'], unit.supported_locale_names

    unit.supported_locales = ['fr-fr']
    assert_equal ['English', 'fr-fr'], unit.supported_locale_names
  end

  test 'section_hidden_unit_info' do
    teacher = create :teacher
    section1 = create :section, user: teacher
    assert_equal({}, @unit_in_unit_group.section_hidden_unit_info(teacher))

    create :section_hidden_script, section: section1, script: @unit_in_unit_group
    assert_equal({section1.id => [@unit_in_unit_group.id]}, @unit_in_unit_group.section_hidden_unit_info(teacher))

    # other unit has no effect
    other_unit = create :script
    create :section_hidden_script, section: section1, script: other_unit
    assert_equal({section1.id => [@unit_in_unit_group.id]}, @unit_in_unit_group.section_hidden_unit_info(teacher))

    # other teacher's sections have no effect
    other_teacher = create :teacher
    other_teacher_section = create :section, user: other_teacher
    create :section_hidden_script, section: other_teacher_section, script: @unit_in_unit_group
    assert_equal({section1.id => [@unit_in_unit_group.id]}, @unit_in_unit_group.section_hidden_unit_info(teacher))

    # other section for same teacher hidden for same unit appears in list
    section2 = create :section, user: teacher
    assert_equal({section1.id => [@unit_in_unit_group.id]}, @unit_in_unit_group.section_hidden_unit_info(teacher))
    create :section_hidden_script, section: section2, script: @unit_in_unit_group
    assert_equal(
      {
        section1.id => [@unit_in_unit_group.id],
        section2.id => [@unit_in_unit_group.id]
      },
      @unit_in_unit_group.section_hidden_unit_info(teacher)
    )
  end

  test 'pilot units are always hidden during seed' do
    l = create :level
    dsl = <<-UNIT
      published_state 'pilot'
      pilot_experiment 'pilot-experiment'

      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT

    File.stubs(:read).returns(dsl)
    unit_names, _ = Script.setup(['pilot-script.script'])
    unit = Script.find_by!(name: unit_names.first)

    assert_equal 'pilot-script', unit.name
    assert_equal 'pilot-experiment', unit.pilot_experiment
    assert_equal 'pilot', unit.published_state
  end

  test 'has pilot access' do
    unit = create :script
    pilot_unit = create :script, pilot_experiment: 'my-experiment'

    student = create :student
    teacher = create :teacher

    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'

    # student in a pilot teacher's section which is not assigned to any unit
    section = create :section, user: pilot_teacher
    unassigned_student = create(:follower, section: section).student_user

    # student in a pilot teacher's section which is assigned to a pilot unit
    pilot_section = create :section, user: pilot_teacher, script: pilot_unit
    pilot_student = create(:follower, section: pilot_section).student_user

    # teacher in a pilot teacher's section
    teacher_in_section = create :teacher
    create(:follower, section: pilot_section, student_user: teacher_in_section)

    # student in a section which was previously assigned to a pilot unit
    other_pilot_section = create :section, user: pilot_teacher, script: pilot_unit
    previous_student = create(:follower, section: other_pilot_section).student_user
    other_pilot_section.script = nil
    other_pilot_section.save!

    # student of pilot teacher, student never assigned to pilot unit
    non_pilot_section = create :section, user: pilot_teacher
    student_of_pilot_teacher = create(:follower, section: non_pilot_section).student_user

    levelbuilder = create :levelbuilder

    refute unit.pilot?
    refute unit.has_pilot_access?
    refute unit.has_pilot_access?(student)
    refute unit.has_pilot_access?(teacher)
    refute unit.has_pilot_access?(pilot_teacher)
    refute unit.has_pilot_access?(unassigned_student)
    refute unit.has_pilot_access?(pilot_student)
    refute unit.has_pilot_access?(teacher_in_section)
    refute unit.has_pilot_access?(previous_student)
    refute unit.has_pilot_access?(student_of_pilot_teacher)
    refute unit.has_pilot_access?(levelbuilder)

    assert pilot_unit.pilot?
    refute pilot_unit.has_pilot_access?
    refute pilot_unit.has_pilot_access?(student)
    refute pilot_unit.has_pilot_access?(teacher)
    assert pilot_unit.has_pilot_access?(pilot_teacher)
    refute pilot_unit.has_pilot_access?(unassigned_student)
    assert pilot_unit.has_pilot_access?(pilot_student)
    assert pilot_unit.has_pilot_access?(teacher_in_section)
    assert pilot_unit.has_pilot_access?(previous_student)
    refute unit.has_pilot_access?(student_of_pilot_teacher)
    assert pilot_unit.has_pilot_access?(levelbuilder)
  end

  test 'has any pilot access' do
    student = create :student
    teacher = create :teacher
    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    create :script, pilot_experiment: 'my-experiment'
    levelbuilder = create :levelbuilder

    refute Script.has_any_pilot_access?
    refute Script.has_any_pilot_access?(student)
    refute Script.has_any_pilot_access?(teacher)
    assert Script.has_any_pilot_access?(pilot_teacher)
    assert Script.has_any_pilot_access?(levelbuilder)
  end

  test 'platformization partner has pilot access' do
    unit = create :script
    partner_pilot_unit = create :script, pilot_experiment: 'my-experiment', editor_experiment: 'ed-experiment'

    student = create :student
    teacher = create :teacher
    partner = create :teacher, editor_experiment: 'ed-experiment'

    refute unit.has_pilot_access?
    refute unit.has_pilot_access?(student)
    refute unit.has_pilot_access?(teacher)
    refute unit.has_pilot_access?(partner)

    refute partner_pilot_unit.has_pilot_access?
    refute partner_pilot_unit.has_pilot_access?(student)
    refute partner_pilot_unit.has_pilot_access?(teacher)
    assert partner_pilot_unit.has_pilot_access?(partner)
  end

  test 'platformization partner has editor experiment' do
    unit = create :script
    partner_unit = create :script, editor_experiment: 'ed-experiment'

    student = create :student
    teacher = create :teacher
    partner = create :teacher, editor_experiment: 'ed-experiment'

    refute unit.has_editor_experiment?(student)
    refute unit.has_editor_experiment?(teacher)
    refute unit.has_editor_experiment?(partner)

    refute partner_unit.has_editor_experiment?(student)
    refute partner_unit.has_editor_experiment?(teacher)
    assert partner_unit.has_editor_experiment?(partner)
  end

  test "unit_names_by_curriculum_umbrella returns the correct unit names" do
    assert_equal(
      ["20-hour", "course1", "course2", "course3", "course4", "coursea-2017", "courseb-2017", "coursec-2017", "coursed-2017", "coursee-2017", "coursef-2017", "express-2017", "pre-express-2017", @csf_unit.name, @csf_unit_2019.name],
      Script.unit_names_by_curriculum_umbrella('CSF')
    )
    assert_equal(
      [@csd_unit.name],
      Script.unit_names_by_curriculum_umbrella('CSD')
    )
    assert_equal(
      [@csp_unit.name],
      Script.unit_names_by_curriculum_umbrella('CSP')
    )
    assert_equal(
      [@csa_unit.name],
      Script.unit_names_by_curriculum_umbrella('CSA')
    )
  end

  test "under_curriculum_umbrella and helpers" do
    assert @csf_unit.under_curriculum_umbrella?('CSF')
    assert @csf_unit.csf?
    assert @csd_unit.under_curriculum_umbrella?('CSD')
    assert @csd_unit.csd?
    assert @csp_unit.under_curriculum_umbrella?('CSP')
    assert @csp_unit.csp?
    assert @csa_unit.under_curriculum_umbrella?('CSA')
    assert @csa_unit.csa?
  end

  test "units_with_standards" do
    assert_equal(
      [
        [
          @csf_unit_2019.localized_title, @csf_unit_2019.name
        ]
      ],
      Script.units_with_standards
    )
  end

  test "has_standards_associations?" do
    assert @csf_unit_2019.has_standards_associations?
    refute @csp_unit.has_standards_associations?
  end

  test 'every lesson has a lesson group even if non specified' do
    l1 = create :level
    dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'
    UNIT

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )
    assert_equal unit.lesson_groups.count, 1
    assert_equal unit.lessons[0].lesson_group.user_facing, false
    assert_equal unit.lessons[0].lesson_group.key, ''
  end

  test 'raises error if a lesson group key is in the reserved plc keys and the display name does not match' do
    l1 = create :level
    dsl = <<-UNIT
      lesson_group 'content', display_name: 'Not Content'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'

    UNIT

    raise = assert_raises do
      Script.add_unit(
        {name: 'lesson-group-test-script'},
        ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert_equal "The key content is a reserved key. It must have the display name: Content.", raise.message
  end

  test 'raises error if a lesson group key is empty' do
    l1 = create :level
    dsl = <<-UNIT
      lesson_group '', display_name: 'Display Name'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'

    UNIT

    raise = assert_raises do
      Script.add_unit(
        {name: 'lesson-group-test-script'},
        ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert_equal 'Validation failed: Key Expect all levelbuilder created lesson groups to have key.', raise.message
  end

  test 'raises error if a lesson group key is given without a display_name' do
    l1 = create :level
    dsl = <<-UNIT
      lesson_group 'content1'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'

    UNIT

    raise = assert_raises do
      Script.add_unit(
        {name: 'lesson-group-test-script'},
        ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert_equal 'Expect all lesson groups to have display names. The following lesson group does not have a display name: content1', raise.message
  end

  test 'raises error if a lesson key is given without a display_name' do
    l1 = create :level
    dsl = <<-UNIT
      lesson_group 'content1', display_name: 'Lesson Group 1'
      lesson 'Lesson1'
      level '#{l1.name}'

    UNIT

    raise = assert_raises do
      Script.add_unit(
        {name: 'lesson-group-test-script'},
        ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert_equal 'Expect all lessons to have display names. The following lesson does not have a display name: Lesson1', raise.message
  end

  test 'raises error if some lessons have lesson groups and some do not' do
    l1 = create :level
    l2 = create :level
    dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'

      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson2', display_name: 'Lesson2'
      level '#{l2.name}'
    UNIT

    raise = assert_raises do
      Script.add_unit(
        {name: 'lesson-group-test-script'},
        ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert_equal 'Expect if one lesson has a lesson group all lessons have lesson groups.', raise.message
  end

  test 'raises error if two non-consecutive lessons have the same lesson group' do
    l1 = create :level
    l2 = create :level
    l3 = create :level
    dsl = <<-UNIT
      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'
      lesson_group 'content2', display_name: 'Content'
      lesson 'Lesson2', display_name: 'Lesson2'
      level '#{l2.name}'
      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson3', display_name: 'Lesson3'
      level '#{l3.name}'
    UNIT

    raise = assert_raises do
      Script.add_unit(
        {name: 'lesson-group-test-script'},
        ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert_equal 'Duplicate Lesson Group. Lesson Group: content is used twice in Script: lesson-group-test-script.', raise.message
  end

  test 'lessons with the same lesson group name are associated with the same lesson group' do
    l1 = create :level
    l2 = create :level
    l3 = create :level
    dsl = <<-UNIT
      lesson_group 'required', display_name: 'Overview'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'

      lesson 'Lesson2', display_name: 'Lesson2'
      level '#{l2.name}'

      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson3', display_name: 'Lesson3'
      level '#{l3.name}'
    UNIT

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal unit.lesson_groups[0].key, 'required'
    assert_equal unit.lesson_groups[0].position, 1
    assert_equal unit.lesson_groups[1].key, 'content'
    assert_equal unit.lesson_groups[1].position, 2

    assert_equal unit.lessons[0].lesson_group.id, unit.lessons[1].lesson_group.id
    refute_equal unit.lessons[0].lesson_group.id, unit.lessons[2].lesson_group.id
  end

  test 'can move lesson to later lesson group in unit' do
    unit = create :script, name: 'lesson-group-test-script'
    lesson_group1 = create :lesson_group, key: 'lg-1', script: unit
    lesson1 = create :lesson, key: 'l-1', name: 'Lesson 1', lesson_group: lesson_group1
    lesson2 = create :lesson, key: 'l-2', name: 'Lesson 2', lesson_group: lesson_group1
    activity = create :lesson_activity, lesson: lesson2
    activity_section = create :activity_section, lesson_activity: activity
    level1 = create :level
    script_level = create :script_level, script: unit, lesson: lesson2, levels: [level1], activity_section: activity_section, activity_section_position: 1
    lesson_group2 = create :lesson_group, key: 'lg-2', script: unit
    lesson3 = create :lesson, key: 'l-3', name: 'Lesson 3', lesson_group: lesson_group2

    new_dsl = <<-UNIT
      lesson_group '#{lesson_group1.key}', display_name: 'Lesson Group 1'
      lesson '#{lesson1.key}', display_name: '#{lesson1.name}'

      lesson_group '#{lesson_group2.key}', display_name: 'Lesson Group 2'
      lesson '#{lesson2.key}', display_name: '#{lesson2.name}'
      level '#{level1.name}'

      lesson '#{lesson3.key}', display_name: '#{lesson3.name}'
    UNIT

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal unit.lessons[1].lesson_group_id, lesson_group2.id
    assert_equal unit.lessons[1].id, lesson2.id
    assert_equal unit.script_levels[0].id, script_level.id
    assert_equal unit.script_levels[0].activity_section_id, activity_section.id
  end

  test 'can move last lesson group up' do
    unit = create :script, name: 'lesson-group-test-script'
    lesson_group1 = create :lesson_group, key: 'lg-1', script: unit
    lesson1 = create :lesson, key: 'l-1', name: 'Lesson 1', lesson_group: lesson_group1
    lesson2 = create :lesson, key: 'l-2', name: 'Lesson 2', lesson_group: lesson_group1
    activity = create :lesson_activity, lesson: lesson2
    activity_section = create :activity_section, lesson_activity: activity
    level1 = create :level
    script_level = create :script_level, script: unit, lesson: lesson2, levels: [level1], activity_section: activity_section, activity_section_position: 1
    lesson_group2 = create :lesson_group, key: 'lg-2', script: unit
    lesson3 = create :lesson, key: 'l-3', name: 'Lesson 3', lesson_group: lesson_group2

    new_dsl = <<-UNIT
      lesson_group '#{lesson_group2.key}', display_name: 'Lesson Group 2'
      lesson '#{lesson3.key}', display_name: '#{lesson3.name}'

      lesson_group '#{lesson_group1.key}', display_name: 'Lesson Group 1'
      lesson '#{lesson1.key}', display_name: '#{lesson1.name}'

      lesson '#{lesson2.key}', display_name: '#{lesson2.name}'
      level '#{level1.name}'
    UNIT

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal unit.lessons[2].lesson_group_id, lesson_group1.id
    assert_equal unit.lessons[2].id, lesson2.id
    assert_equal unit.script_levels[0].id, script_level.id
    assert_equal unit.script_levels[0].activity_section_id, activity_section.id
  end

  test 'can add the lesson group for a lesson' do
    l = create :level
    old_dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    new_dsl = <<-UNIT
      lesson_group 'required', display_name: 'Overview'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(old_dsl, 'a filename')[0][:lesson_groups]
    )
    assert_equal '', unit.lessons[0].lesson_group.key

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal 'required', unit.lessons[0].lesson_group.key
  end

  test 'can add description and big questions for lesson group' do
    l = create :level
    dsl = <<-UNIT
      lesson_group 'lg-1', display_name: 'Lesson Group'
      lesson_group_description 'This is a description'
      lesson_group_big_questions 'What is the first question? What is the second question?'
      lesson 'Lesson1', display_name: 'Lesson 1'
      level '#{l.name}'

      lesson_group 'lg-2', display_name: 'Lesson Group 2'
      lesson_group_description 'Second Description'
      lesson_group_big_questions  'Hi? Hello?'
      lesson 'Lesson2', display_name: 'Lesson 2'
      level '#{l.name}'
    UNIT
    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )
    assert_equal 'This is a description', unit.lesson_groups[0].description
    assert_equal 'What is the first question? What is the second question?', unit.lesson_groups[0].big_questions
    assert_equal 'Second Description', unit.lesson_groups[1].description
    assert_equal 'Hi? Hello?', unit.lesson_groups[1].big_questions
  end

  test 'can change the lesson group for a lesson' do
    l = create :level
    old_dsl = <<-UNIT
      lesson_group 'required', display_name: 'Overview'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    new_dsl = <<-UNIT
      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(old_dsl, 'a filename')[0][:lesson_groups]
    )
    assert_equal 'required', unit.lessons[0].lesson_group.key

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal 'content', unit.lessons[0].lesson_group.key
  end

  test 'can remove the lesson group for a lesson' do
    l = create :level
    old_dsl = <<-UNIT
      lesson_group 'required', display_name: 'Overview'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    new_dsl = <<-UNIT
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l.name}'
    UNIT
    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(old_dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal 'required', unit.lessons[0].lesson_group.key

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal '', unit.lessons[0].lesson_group.key
    assert_equal 1, unit.lesson_groups.count
  end

  test 'can change the order of lesson groups in a unit' do
    l1 = create :level
    l2 = create :level
    old_dsl = <<-UNIT
      lesson_group 'content2', display_name: 'Content'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'

      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson2', display_name: 'Lesson2'
      level '#{l2.name}'
    UNIT
    new_dsl = <<-UNIT
      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'

      lesson_group 'content2', display_name: 'Content'
      lesson 'Lesson2', display_name: 'Lesson2'
      level '#{l2.name}'
    UNIT
    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(old_dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal 'content2', unit.lesson_groups[0].key
    assert_equal 1, unit.lesson_groups[0].position
    assert_equal 'content', unit.lesson_groups[1].key
    assert_equal 2, unit.lesson_groups[1].position

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal 'content', unit.lesson_groups[0].key
    assert_equal 1, unit.lesson_groups[0].position
    assert_equal 'content2', unit.lesson_groups[1].key
    assert_equal 2, unit.lesson_groups[1].position
  end

  test 'script levels have the correct chapter and position value' do
    l1 = create :level
    l2 = create :level
    l3 = create :level
    l4 = create :level
    l5 = create :level
    dsl = <<-UNIT
      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'
      level '#{l2.name}'

      lesson 'Lesson2', display_name: 'Lesson2'
      level '#{l3.name}'

      lesson_group 'content2', display_name: 'Content'
      lesson 'Lesson3', display_name: 'Lesson3'
      level '#{l4.name}'
      level '#{l5.name}'
    UNIT

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal 1, unit.script_levels[0].chapter
    assert_equal 1, unit.script_levels[0].position
    assert_equal 2, unit.script_levels[1].chapter
    assert_equal 2, unit.script_levels[1].position
    assert_equal 3, unit.script_levels[2].chapter
    assert_equal 1, unit.script_levels[2].position
    assert_equal 4, unit.script_levels[3].chapter
    assert_equal 1, unit.script_levels[3].position
    assert_equal 5, unit.script_levels[4].chapter
    assert_equal 2, unit.script_levels[4].position
  end

  test 'can add lesson with no levels' do
    dsl = <<-UNIT
      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson1', display_name: 'Lesson1'

    UNIT

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )
    lesson = unit.lessons.first
    assert_equal 'Lesson1', lesson.key
    assert_equal 0, lesson.script_levels.count
  end

  test 'raise error if try to change key of lesson in stable and i18n unit' do
    ScriptConstants.stubs(:i18n?).with('coursea-2017').returns(true)

    new_dsl = <<-UNIT
      published_state 'stable'

      lesson 'Debugging: Unspotted Bugs 1', display_name: 'Debugging: Unspotted Bugs'
      level 'courseB_video_Unspotted'
    UNIT

    raise = assert_raises do
      Script.add_unit(
        {name: 'coursea-2017'},
        ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert_equal 'Adding new keys or update existing keys for lessons in units that are marked as stable and included in the i18n sync is not allowed. Offending Lesson Key: Debugging: Unspotted Bugs 1', raise.message
  end

  test 'raise error if try to add lesson in stable and i18n unit' do
    ScriptConstants.stubs(:i18n?).with('coursea-2017').returns(true)

    l1 = create :level

    new_dsl = <<-UNIT
      published_state 'stable'

      lesson 'new-lesson', display_name: 'New Lesson'
      level '#{l1.name}'

      lesson 'Debugging: Unspotted Bugs 1', display_name: 'Debugging: Unspotted Bugs'
      level 'courseB_video_Unspotted'
    UNIT

    raise = assert_raises do
      Script.add_unit(
        {name: 'coursea-2017'},
        ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert_equal 'Adding new keys or update existing keys for lessons in units that are marked as stable and included in the i18n sync is not allowed. Offending Lesson Key: new-lesson', raise.message
  end

  test 'raise error if try to add new lesson group in stable and i18n unit' do
    ScriptConstants.stubs(:i18n?).with('coursea-2017').returns(true)

    new_dsl = <<-UNIT
      published_state 'stable'

      lesson_group 'lg', display_name: 'Lesson Group'
      lesson 'Debugging: Unspotted Bugs 1', display_name: 'Debugging: Unspotted Bugs'
      level 'courseB_video_Unspotted'
    UNIT

    raise = assert_raises do
      Script.add_unit(
        {name: 'coursea-2017'},
        ScriptDSL.parse(new_dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert_equal 'Adding new keys or update existing keys for lesson groups in scripts that are marked as stable and included in the i18n sync is not allowed. Offending Lesson Group Key: lg', raise.message
  end

  test 'all_descendant_levels returns nested levels of all types' do
    # simple level
    level1 = create :level, name: 'level1'

    # level swapping
    swap1 = create :level, name: 'swap1'
    swap2 = create :level, name: 'swap2'

    # lesson extras
    extra1 = create :level, name: 'extra1'
    extra2 = create :level, name: 'extra2'

    # contained levels
    containee = create :multi, name: 'containee'
    container = create :applab, name: 'container', contained_level_names: [containee.name]

    # project template levels
    template_level = create :applab, name: 'template'
    template_backed_level = create :applab, name: 'template_backed', project_template_level_name: template_level.name

    # level groups
    level_group = create :level_group, :with_sublevels, name: 'level group'
    assert_equal 2, level_group.pages.length
    level_group_sublevels = level_group.pages.map(&:levels).flatten
    assert_equal 3, level_group_sublevels.length

    # buble choice levels
    bubble_choice = create :bubble_choice_level, :with_sublevels, name: 'bubble choice'
    bubble_choice_sublevels = bubble_choice.sublevels
    assert_equal 3, bubble_choice_sublevels.length

    dsl = <<~UNIT
      lesson 'lesson1', display_name: 'lesson1'
      level '#{level1.name}'
      variants
        level '#{swap1.name}', active: false
        level '#{swap2.name}'
      endvariants
      level '#{container.name}'
      level '#{template_backed_level.name}'
      level '#{level_group.name}'
      level '#{bubble_choice.name}'
      bonus '#{extra1.name}'
      bonus '#{extra2.name}'
    UNIT
    unit_data = ScriptDSL.parse(dsl, 'a filename')[0]
    unit = Script.add_unit(
      {name: 'all-levels-script'},
      unit_data[:lesson_groups]
    )

    levels = [level1, swap1, swap2, container,  template_backed_level, level_group, bubble_choice, extra1, extra2]
    nested_levels = [containee, template_level, level_group_sublevels, bubble_choice_sublevels].flatten

    assert_equal levels, unit.levels
    expected_levels = levels + nested_levels
    actual_levels = unit.all_descendant_levels
    assert_equal expected_levels.compact.map(&:name), actual_levels.compact.map(&:name)
    assert_equal expected_levels, actual_levels
  end

  test 'accessing lessons through lesson groups is same as directly from unit' do
    l1 = create :level
    l2 = create :level
    l3 = create :level
    l4 = create :level
    dsl = <<-UNIT
      lesson_group 'content', display_name: 'Content'
      lesson 'Lesson1', display_name: 'Lesson1'
      level '#{l1.name}'
      lesson 'Lesson2', display_name: 'Lesson2'
      level '#{l2.name}'
      level '#{l3.name}'
      lesson_group 'content2', display_name: 'Content'
      lesson 'Lesson3', display_name: 'Lesson3'
      level '#{l4.name}'
    UNIT

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal unit.lesson_groups[0].lessons[0], unit.lessons[0]
    assert_equal unit.lesson_groups[0].lessons[0].absolute_position, 1
    assert_equal unit.lesson_groups[0].lessons[1], unit.lessons[1]
    assert_equal unit.lesson_groups[0].lessons[1].absolute_position, 2
    assert_equal unit.lesson_groups[1].lessons[0], unit.lessons[2]
    assert_equal unit.lesson_groups[1].lessons[0].absolute_position, 3
  end

  test 'level can only be added once to a lesson' do
    level = create :level
    dsl = <<~UNIT
      lesson 'lesson1', display_name: 'lesson1'
      level '#{level.name}'
      level '#{level.name}'
    UNIT

    error = assert_raises do
      Script.add_unit(
        {name: 'level-included-multiple-times'},
        ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
      )
    end
    assert error.message.include? 'Duplicate entry'
    assert error.message.include? "for key 'index_script_levels_on_seed_key'"
  end

  test 'can add unplugged for lesson' do
    dsl = <<-UNIT
      lesson_group 'lg-1', display_name: 'Lesson Group'
      lesson 'Lesson1', display_name: 'Lesson 1', unplugged: true
    UNIT

    unit = Script.add_unit(
      {name: 'lesson-group-test-script'},
      ScriptDSL.parse(dsl, 'a filename')[0][:lesson_groups]
    )

    assert_equal true, unit.lessons[0].unplugged
  end

  test 'seeding_key' do
    unit = create :script

    # seeding_key should not make queries
    assert_queries(0) do
      expected = {'script.name' => unit.name}
      assert_equal expected, unit.seeding_key(Services::ScriptSeed::SeedContext.new)
    end
  end

  test 'fix script level positions' do
    unit = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: unit

    lesson_1 = create :lesson, script: unit, lesson_group: lesson_group

    activity_1 = create :lesson_activity, lesson: lesson_1
    section_1 = create :activity_section, lesson_activity: activity_1
    script_level_1_a = create :script_level, activity_section: section_1, activity_section_position: 1, lesson: lesson_1, chapter: 1, position: 1
    script_level_1_b = create :script_level, activity_section: section_1, activity_section_position: 2, lesson: lesson_1, chapter: 2, position: 2

    lesson_2 = create :lesson, script: unit, lesson_group: lesson_group

    activity_2_1 = create :lesson_activity, lesson: lesson_2
    section_2_1 = create :activity_section, lesson_activity: activity_2_1
    script_level_2_1_a = create :script_level, activity_section: section_2_1, activity_section_position: 1, lesson: lesson_2, chapter: 3, position: 1
    script_level_2_1_b = create :script_level, activity_section: section_2_1, activity_section_position: 2, lesson: lesson_2, chapter: 4, position: 2

    activity_2_2 = create :lesson_activity, lesson: lesson_2
    section_2_2 = create :activity_section, lesson_activity: activity_2_2
    script_level_2_2_a = create :script_level, activity_section: section_2_2, activity_section_position: 1, lesson: lesson_2, chapter: 5, position: 3
    script_level_2_2_b = create :script_level, activity_section: section_2_2, activity_section_position: 2, lesson: lesson_2, chapter: 6, position: 4

    expected_script_levels = [
      script_level_1_a,
      script_level_1_b,
      script_level_2_1_a,
      script_level_2_1_b,
      script_level_2_2_a,
      script_level_2_2_b
    ]

    assert_equal [1, 2, 1, 2, 1, 2], expected_script_levels.map(&:activity_section_position)
    assert_equal [1, 2, 1, 2, 3, 4], expected_script_levels.map(&:position)
    assert_equal [1, 2, 3, 4, 5, 6], expected_script_levels.map(&:chapter)
    assert_equal expected_script_levels.map(&:id), unit.script_levels.map(&:id)

    script_level_2_1_b.destroy
    unit.fix_script_level_positions

    expected_script_levels = [
      script_level_1_a,
      script_level_1_b,
      script_level_2_1_a,
      script_level_2_2_a,
      script_level_2_2_b
    ]

    expected_script_levels.each(&:reload)
    unit.reload
    assert_equal [1, 2, 1, 1, 2], expected_script_levels.map(&:activity_section_position)
    assert_equal [1, 2, 1, 2, 3], expected_script_levels.map(&:position)
    assert_equal [1, 2, 3, 4, 5], expected_script_levels.map(&:chapter)
    assert_equal expected_script_levels, unit.script_levels
  end

  test 'cannot fix position of legacy script levels' do
    unit = create :script, is_migrated: true
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group

    # this is a legacy script level because it does not have an activity section
    create :script_level, lesson: lesson, chapter: 1, position: 1

    error = assert_raises do
      unit.fix_script_level_positions
    end
    assert_includes error.message, 'Legacy script levels are not allowed in migrated units.'
  end

  test 'localized_title defaults to name' do
    unit = create :script, name: "test-localized-title-default"
    assert_equal "test-localized-title-default", unit.localized_title
  end

  class MigratedScriptCopyTests < ActiveSupport::TestCase
    setup do
      Script.any_instance.stubs(:write_script_json)
      Script.stubs(:merge_and_write_i18n)

      @standalone_unit = create :script, is_migrated: true, is_course: true, version_year: '2021', family_name: 'csf', name: 'standalone-2021'
      create :course_version, content_root: @standalone_unit

      @unit_group = create :unit_group
      create :course_version, content_root: @unit_group
      @unit_in_course = create :script, is_migrated: true, name: 'coursename1-2021'
      create :unit_group_unit, unit_group: @unit_group, script: @unit_in_course, position: 1
    end

    test 'can copy a standalone unit as another standalone unit' do
      cloned_unit = @standalone_unit.clone_migrated_unit('standalone-2022', version_year: '2022', family_name: 'csf')
      assert_equal 'standalone-2022', cloned_unit.name
      assert_equal '2022', cloned_unit.version_year
    end

    test 'can copy a standalone unit into a unit group' do
      cloned_unit = @standalone_unit.clone_migrated_unit('coursename2-2021', destination_unit_group_name: @unit_group.name)
      assert_equal 2, @unit_group.default_scripts.count
      assert_equal 'coursename2-2021', @unit_group.default_scripts[1].name
      assert_equal cloned_unit.unit_group, @unit_group
    end

    test 'can copy a unit in a unit group to a standalone unit' do
      cloned_unit = @unit_in_course.clone_migrated_unit('standalone-coursename-2021', version_year: '2021', family_name: 'csf')
      assert_nil cloned_unit.unit_group
      assert_equal 'standalone-coursename-2021', cloned_unit.name
    end

    test 'can copy unit with lessons without copying levels' do
      lesson_group = create :lesson_group, script: @standalone_unit
      lesson = create :lesson, lesson_group: lesson_group, script: @standalone_unit
      lesson_activity = create :lesson_activity, lesson: lesson
      activity_section = create :activity_section, lesson_activity: lesson_activity

      level1 = create :level
      level2 = create :level
      create :script_level, levels: [level1], script: @standalone_unit, lesson: lesson, activity_section: activity_section, activity_section_position: 1
      create :script_level, levels: [level2], script: @standalone_unit, lesson: lesson, activity_section: activity_section, activity_section_position: 2

      cloned_unit = @standalone_unit.clone_migrated_unit('standalone-2022', version_year: '2022', family_name: 'csf')
      assert_equal [level1, level2], cloned_unit.levels
    end

    test 'can copy unit with lessons and copy levels' do
      lesson_group = create :lesson_group, script: @standalone_unit
      lesson = create :lesson, lesson_group: lesson_group, script: @standalone_unit
      lesson_activity = create :lesson_activity, lesson: lesson
      activity_section = create :activity_section, lesson_activity: lesson_activity

      level1 = create :level, name: 'level1-2021', level_num: 'custom'
      level2 = create :level, name: 'level2-2021', level_num: 'custom'
      create :script_level, levels: [level1], script: @standalone_unit, lesson: lesson, activity_section: activity_section, activity_section_position: 1
      create :script_level, levels: [level2], script: @standalone_unit, lesson: lesson, activity_section: activity_section, activity_section_position: 2

      cloned_unit = @standalone_unit.clone_migrated_unit('standalone-2022', new_level_suffix: '2022', version_year: '2022', family_name: 'csf')
      refute_equal [level1, level2], cloned_unit.levels
    end

    test 'can copy teacher and student resources' do
      @standalone_unit.resources = [create(:resource)]
      @standalone_unit.student_resources = [create(:resource)]

      cloned_unit = @standalone_unit.clone_migrated_unit('standalone-2022', version_year: '2022', family_name: 'csf')
      assert_equal 1, cloned_unit.resources.count
      assert_equal 1, cloned_unit.student_resources.count
      refute_equal @standalone_unit.resources[0], cloned_unit.resources[0]
      refute_equal @standalone_unit.student_resources[0], cloned_unit.student_resources[0]
    end

    test 'can deduplicate teacher and student resources' do
      @standalone_unit.resources = [create(:resource, name: 'Teacher Resource', url: 'teacher.resource', course_version_id: @standalone_unit.course_version.id)]
      @standalone_unit.student_resources = [create(:resource, name: 'Student Resource', url: 'student.resource', course_version_id: @standalone_unit.course_version.id)]
      @unit_in_course.resources = [create(:resource, name: 'Teacher Resource', url: 'teacher.resource', course_version_id: @unit_in_course.get_course_version.id)]
      @unit_in_course.student_resources = [create(:resource, name: 'Student Resource', url: 'student.resource', course_version_id: @unit_in_course.get_course_version.id)]

      cloned_unit = @standalone_unit.clone_migrated_unit('coursename2-2021', destination_unit_group_name: @unit_group.name)
      assert_equal 1, cloned_unit.resources.count
      assert_equal 1, cloned_unit.student_resources.count
      refute_equal @standalone_unit.resources[0], cloned_unit.resources[0]
      refute_equal @standalone_unit.student_resources[0], cloned_unit.student_resources[0]
      assert_equal @unit_in_course.resources[0], cloned_unit.resources[0]
      assert_equal @unit_in_course.student_resources[0], cloned_unit.student_resources[0]
    end
  end

  private

  def has_unlaunched_unit?(units)
    units.any? {|u| !u.launched?}
  end
end
