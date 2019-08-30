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

    @script_2017 = create :script, name: 'script-2017', family_name: 'family-cache-test', version_year: '2017'
    @script_2018 = create :script, name: 'script-2018', family_name: 'family-cache-test', version_year: '2018'

    @csf_script = create :csf_script, name: 'csf1'
    @csd_script = create :csd_script, name: 'csd1'
    @csp_script = create :csp_script, name: 'csp1'

    # ensure that we have freshly generated caches with this course/script
    Course.clear_cache
    Script.clear_cache
  end

  def populate_cache_and_disconnect_db
    Script.stubs(:should_cache?).returns true
    # Only need to populate cache once per test-suite run
    @@script_cached ||= Script.script_cache_to_cache
    Script.script_cache
    Script.script_family_cache

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

  test 'cannot rename a script without a new_name' do
    l = create :level
    dsl = <<-SCRIPT
      stage 'Stage1'
      level '#{l.name}'
    SCRIPT
    old_script = Script.add_script(
      {name: 'old script name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:stages]
    )
    assert_equal 'old script name', old_script.name

    new_script = Script.add_script(
      {name: 'new script name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:stages]
    )
    assert_equal 'new script name', new_script.name

    # a new script was created
    refute_equal old_script.id, new_script.id
  end

  test 'can rename a script between original name and new_name' do
    l = create :level
    dsl = <<-SCRIPT
      stage 'Stage1'
      level '#{l.name}'
    SCRIPT
    old_script = Script.add_script(
      {name: 'old script name', new_name: 'new script name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:stages]
    )
    assert_equal 'old script name', old_script.name

    new_script = Script.add_script(
      {name: 'new script name', new_name: 'new script name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:stages]
    )
    assert_equal 'new script name', new_script.name

    # the old script was renamed
    assert_equal old_script.id, new_script.id

    old_script = Script.add_script(
      {name: 'old script name', new_name: 'new script name'},
      ScriptDSL.parse(dsl, 'a filename')[0][:stages]
    )
    assert_equal 'old script name', old_script.name

    # the script was renamed back to the old name
    assert_equal old_script.id, new_script.id
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

  test 'get_from_cache raises if called with a family_name' do
    error = assert_raises do
      Script.get_from_cache('coursea')
    end
    assert_equal 'Do not call Script.get_from_cache with a family_name. Call Script.get_script_family_redirect_for_user instead.  Family: coursea', error.message
  end

  test 'get_family_from_cache uses script_family_cache' do
    family_scripts = Script.where(family_name: 'family-cache-test')
    assert_equal [@script_2017.name, @script_2018.name], family_scripts.map(&:name)

    populate_cache_and_disconnect_db

    cached_family_scripts = Script.get_family_from_cache('family-cache-test')
    assert_equal [@script_2017.name, @script_2018.name], cached_family_scripts.map(&:name).uniq
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

  test 'get_script_family_redirect_for_user returns latest stable script assigned or with progress if student' do
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018')

    # Assign student to csp1_2017.
    section = create :section, script: csp1_2017
    student = create :student
    section.students << student

    redirect_script = Script.get_script_family_redirect_for_user('csp', user: student)
    assert_equal csp1_2017.name, redirect_script.redirect_to

    # Student makes progress in csp1_2018.
    create :user_level, user: student, script: csp1_2018
    student.reload

    redirect_script = Script.get_script_family_redirect_for_user('csp', user: student)
    assert_equal csp1_2018.name, redirect_script.redirect_to
  end

  test 'get_script_family_redirect_for_user returns latest stable script in family if teacher' do
    teacher = create :teacher
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', is_stable: true)
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', is_stable: true)
    create(:script, name: 'csp1-2019', family_name: 'csp', version_year: '2019')
    create :section, user: teacher, script: csp1_2017

    redirect_script = Script.get_script_family_redirect_for_user('csp', user: teacher)
    assert_equal csp1_2018.name, redirect_script.redirect_to
  end

  test 'get_script_family_redirect_for_user returns nil if no scripts in family are stable' do
    create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', is_stable: false)
    assert_nil Script.get_script_family_redirect_for_user('csp')
  end

  test 'get_script_family_redirect_for_user returns latest version supported in locale if available' do
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', is_stable: true, supported_locales: ['es-MX'])
    create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', is_stable: true)

    redirect_script = Script.get_script_family_redirect_for_user('csp', locale: 'es-MX')
    assert_equal csp1_2017.name, redirect_script.redirect_to
  end

  test 'get_script_family_redirect_for_user returns latest stable version if no user or locale' do
    create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', is_stable: true)
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', is_stable: true)

    redirect_script = Script.get_script_family_redirect_for_user('csp')
    assert_equal csp1_2018.name, redirect_script.redirect_to
  end

  test 'get_script_family_redirect_for_user returns latest stable version if no versions supported in locale' do
    create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', is_stable: true, supported_locales: ['es-MX'])
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', is_stable: true)

    redirect_script = Script.get_script_family_redirect_for_user('csp', locale: 'it-IT')
    assert_equal csp1_2018.name, redirect_script.redirect_to
  end

  test 'redirect_to_script_url returns nil unless user can view script version' do
    Script.any_instance.stubs(:can_view_version?).returns(false)
    student = create :student
    script = create :script, name: 'my-script'

    assert_nil script.redirect_to_script_url(student)
  end

  test 'redirect_to_script_url returns nil if user is assigned to script' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    script = create :script, name: 'my-script'
    section = create :section, script: script
    section.students << student

    assert_nil script.redirect_to_script_url(student)
  end

  test 'redirect_to_script_url returns nil if user is not assigned to any script in family' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    script = create :script, name: 'my-script'

    assert_nil script.redirect_to_script_url(student)
  end

  test 'returns nil if latest assigned script is an older version than the current script' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018')
    section = create :section, script: csp1_2017
    section.students << student

    assert_nil csp1_2018.redirect_to_script_url(student)
  end

  test 'redirect_to_script_url returns script url of latest assigned script version in family for script belonging to course family' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    csp_2017 = create(:course, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp')
    create :course_script, course: csp_2017, script: csp1_2017, position: 1
    csp_2018 = create(:course, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp')
    create :course_script, course: csp_2018, script: csp1_2018, position: 1
    section = create :section, course: csp_2018
    section.students << student

    assert_equal csp1_2018.link, csp1_2017.redirect_to_script_url(student)
  end

  test 'redirect_to_script_url returns script url of latest assigned script version in family for script not belonging to course family' do
    Script.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    courseg_2017 = create(:script, name: 'courseg-2017', family_name: 'courseg', version_year: '2017')
    courseg_2018 = create(:script, name: 'courseg-2018', family_name: 'courseg', version_year: '2018')
    section = create :section, script: courseg_2018
    section.students << student

    assert_equal courseg_2018.link, courseg_2017.redirect_to_script_url(student)
  end

  test 'can_view_version? is true for teachers' do
    script = create :script, name: 'my-script'
    teacher = create :teacher
    assert script.can_view_version?(teacher)
  end

  test 'can_view_version? is true if script is latest stable version in student locale or in English' do
    latest_in_english = create :script, name: 'english-only-script', family_name: 'courseg', version_year: '2018', is_stable: true, supported_locales: []
    latest_in_locale = create :script, name: 'localized-script', family_name: 'courseg', version_year: '2017', is_stable: true, supported_locales: ['it-it']
    student = create :student

    assert latest_in_english.can_view_version?(student, locale: 'it-it')
    assert latest_in_locale.can_view_version?(student, locale: 'it-it')
  end

  test 'can_view_version? is true if student is assigned to script' do
    script = create :script, name: 'my-script', family_name: 'script-fam'
    student = create :student
    student.expects(:assigned_script?).returns(true)

    assert script.can_view_version?(student)
  end

  test 'can_view_version? is true if student has progress in script' do
    script = create :script, name: 'my-script', family_name: 'script-fam'
    student = create :student
    student.scripts << script

    assert script.can_view_version?(student)
  end

  test 'can_view_version? is true if student has progress in course script belongs to' do
    course = create :course, family_name: 'script-fam'
    script1 = create :script, name: 'script1', family_name: 'script-fam'
    create :course_script, course: course, script: script1, position: 1
    script2 = create :script, name: 'script2', family_name: 'script-fam'
    create :course_script, course: course, script: script2, position: 2
    student = create :student
    student.scripts << script1

    assert script2.can_view_version?(student)
  end

  test 'self.latest_stable_version is nil if no script versions in family are stable in locale' do
    create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', is_stable: true, supported_locales: ["it-it"]
    create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', is_stable: true, supported_locales: ["it-it"]

    assert_nil Script.latest_stable_version('fake-family', locale: 'es-mx')
  end

  test 'self.latest_stable_version returns latest stable version for user locale' do
    create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', is_stable: true, supported_locales: ["it-it"]
    script_2018 = create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', is_stable: true, supported_locales: ["it-it"]

    assert_equal script_2018, Script.latest_stable_version('fake-family', locale: 'it-it')
  end

  test 'self.latest_stable_version returns latest stable version for English locales' do
    create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', is_stable: true
    script_2018 = create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', is_stable: true

    assert_equal script_2018, Script.latest_stable_version('fake-family')
    assert_equal script_2018, Script.latest_stable_version('fake-family', locale: 'en-ca')
  end

  test 'self.latest_stable_version returns correct script version in family if version_year is supplied' do
    script_2017 = create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', is_stable: true
    create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', is_stable: true

    assert_equal script_2017, Script.latest_stable_version('fake-family', version_year: '2017')
  end

  test 'self.latest_assigned_version returns nil if no scripts in family are assigned to user' do
    script1 = create :script, name: 's-1', family_name: 'family-1'
    student = create :student
    student.scripts << script1

    assert_nil Script.latest_assigned_version('family-2', student)
  end

  test 'self.latest_assigned_version returns latest assigned script in family if script is in course family' do
    csp_2017 = create(:course, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp')
    create :course_script, course: csp_2017, script: csp1_2017, position: 1
    csp_2018 = create(:course, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp')
    create :course_script, course: csp_2018, script: csp1_2018, position: 1

    student = create :student
    section = create :section, course: csp_2017
    section.students << student

    assert_equal csp1_2017, Script.latest_assigned_version('csp', student)
  end

  test 'self.latest_assigned_version returns latest assigned script in family if script is not in course family' do
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

  test 'hoc?' do
    assert Script.find_by_name('dance').hoc?
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

  test 'summarize includes show_course_unit_version_warning' do
    csp_2017 = create(:course, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017')
    create(:course_script, course: csp_2017, script: csp1_2017, position: 1)

    csp_2018 = create(:course, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018')
    create(:course_script, course: csp_2018, script: csp1_2018, position: 1)

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

    user_script_18 = create(:user_script, user: user, script: foo18)
    refute foo17.summarize(true, user)[:show_script_version_warning]
    assert foo18.summarize(true, user)[:show_script_version_warning]

    # version warning can be dismissed
    user_script_18.version_warning_dismissed = true
    user_script_18.save!
    refute foo18.summarize(true, user)[:show_script_version_warning]
  end

  test 'summarize only shows one version warning' do
    csp_2017 = create(:course, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp1', version_year: '2017')
    create(:course_script, course: csp_2017, script: csp1_2017, position: 1)

    csp_2018 = create(:course, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp1', version_year: '2018')
    create(:course_script, course: csp_2018, script: csp1_2018, position: 1)

    user = create(:student)
    create(:user_script, user: user, script: csp1_2017)
    assert csp1_2018.summarize(true, user)[:show_course_unit_version_warning]
    refute csp1_2018.summarize(true, user)[:show_script_version_warning]
  end

  test 'summarize includes versions' do
    foo17 = create(:script, name: 'foo-2017', family_name: 'foo', version_year: '2017')
    create(:script, name: 'foo-2018', family_name: 'foo', version_year: '2018')

    versions = foo17.summarize[:versions]
    assert_equal 2, versions.length
    assert_equal 'foo-2018', versions[0][:name]
    assert_equal '2018', versions[0][:version_year]
    assert_equal '2018', versions[0][:version_title]
    assert_equal 'foo-2017', versions[1][:name]
    assert_equal '2017', versions[1][:version_year]
    assert_equal '2017', versions[1][:version_title]
  end

  test 'summarize excludes hidden versions' do
    foo17 = create(:script, name: 'foo-2017', family_name: 'foo', version_year: '2017')
    create(:script, name: 'foo-2018', family_name: 'foo', version_year: '2018')
    create(:script, name: 'foo-2019', family_name: 'foo', version_year: '2019', hidden: true)

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
    script = create(:script, name: 'script')

    # No user, show_assign_button set to nil
    assert_nil script.summarize[:show_assign_button]

    # Teacher should be able to assign a visible script.
    assert_equal false, script.summarize[:hidden]
    assert_equal true, script.summarize(true, create(:teacher))[:show_assign_button]

    # Teacher should not be able to assign a hidden script.
    hidden_script = create(:script, name: 'unassignable-hidden', hidden: true)
    assert_equal true, hidden_script.summarize[:hidden]
    assert_equal false, hidden_script.summarize(true, create(:teacher))[:show_assign_button]

    # Student should not be able to assign a script,
    # regardless of visibility.
    assert_equal false, script.summarize[:hidden]
    assert_nil script.summarize(true, create(:student))[:show_assign_button]
  end

  test 'summarize includes bonus levels for stages if include_bonus_levels and include_stages are true' do
    script = create :script
    stage = create :stage, script: script
    level = create :level
    create :script_level, stage: stage, levels: [level], bonus: true

    response = script.summarize(true, nil, true)
    assert_equal 1, response[:stages].length
    assert_equal 1, response[:stages].first[:levels].length
    assert_equal [level.id], response[:stages].first[:levels].first[:ids]
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

    stages_i18n = {
      'course3' => course3_yml,
      'course4' => course4_yml
    }

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

  test 'text_to_speech_enabled? for k5_course' do
    assert Script.find_by_name('csf1').text_to_speech_enabled?
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

  test 'can unset the script_announcements attribute' do
    l = create :level
    old_dsl = <<-SCRIPT
      script_announcements [{"notice"=>"notice1", "details"=>"details1", "link"=>"link1", "type"=>"information"}]
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
    assert script.script_announcements

    script_data, _ = ScriptDSL.parse(new_dsl, 'a filename')
    script = Script.add_script(
      {
        name: 'challengeTestScript',
        properties: Script.build_property_hash(script_data)
      },
      script_data[:stages]
    )

    refute script.script_announcements
  end

  test 'can set custom curriculum path' do
    l = create :level
    dsl = <<-SCRIPT
      has_lesson_plan true
      curriculum_path '//example.com/{LOCALE}/foo/{LESSON}'
      stage 'Stage1'
      level '#{l.name}'
      stage 'Stage2'
      level '#{l.name}'
    SCRIPT
    script_data, _ = ScriptDSL.parse(dsl, 'a filename')
    script = Script.add_script(
      {
        name: 'curriculumTestScript',
        properties: Script.build_property_hash(script_data),
      },
      script_data[:stages],
    )
    assert_equal CDO.curriculum_url('en-us', 'foo/1'), script.stages.first.lesson_plan_html_url
    with_locale(:'it-IT') do
      assert_equal CDO.curriculum_url('it-IT', 'foo/2'), script.stages.last.lesson_plan_html_url
    end

    script.curriculum_path = '//example.com/foo/{LESSON}'
    assert_equal '//example.com/foo/1', script.stages.first.lesson_plan_html_url
    assert_equal '//example.com/foo/2', script.stages.last.lesson_plan_html_url

    script.curriculum_path = nil
    assert_equal '//test.code.org/curriculum/curriculumTestScript/1/Teacher', script.stages.first.lesson_plan_html_url
  end

  test 'clone script with suffix' do
    scripts, _ = Script.setup([@script_file])
    script = scripts[0]
    assert_equal 1, script.script_announcements.count

    Script.stubs(:script_directory).returns(self.class.fixture_path)
    script_copy = script.clone_with_suffix('copy')
    assert_equal 'test-fixture-copy', script_copy.name
    assert_nil script_copy.family_name
    assert_nil script_copy.version_year
    assert_equal false, !!script_copy.is_stable
    assert_equal true, script_copy.hidden
    assert_nil script_copy.script_announcements

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

  test 'clone versioned script with suffix' do
    script_file = File.join(self.class.fixture_path, "test-fixture-versioned-1801.script")
    scripts, _ = Script.setup([script_file])
    script = scripts[0]

    Script.stubs(:script_directory).returns(self.class.fixture_path)
    script_copy = script.clone_with_suffix('1802')

    # make sure the old suffix is removed before the new one is added.
    assert_equal 'test-fixture-versioned-1802', script_copy.name
    assert_equal 'versioned', script_copy.family_name
    assert_equal '1802', script_copy.version_year
    assert_equal false, !!script_copy.is_stable
    assert_equal true, script_copy.hidden
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

  test 'clone with suffix and add editor experiment' do
    scripts, _ = Script.setup([@script_file])
    script = scripts[0]
    assert_equal 1, script.script_announcements.count

    Script.stubs(:script_directory).returns(self.class.fixture_path)
    script_copy = script.clone_with_suffix('copy', editor_experiment: 'script-editors')
    assert_equal 'test-fixture-copy', script_copy.name
    assert_equal 'script-editors', script_copy.editor_experiment

    # Validate levels.
    assert_equal 5, script_copy.levels.count
    script_copy.levels.each_with_index do |level, i|
      level_num = i + 1
      assert_equal "Level #{level_num}_copy", level.name
      assert_equal 'script-editors', level.editor_experiment
    end
  end

  test "assignable_info: returns assignable info for a script" do
    script = create(:script, name: 'fake-script', hidden: true, stage_extras_available: true)
    assignable_info = script.assignable_info

    assert_equal("fake-script *", assignable_info[:name])
    assert_equal("fake-script", assignable_info[:script_name])
    assert_equal("other", assignable_info[:category])
    assert(assignable_info[:stage_extras_available])
  end

  test "assignable_info: correctly translates script info" do
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

    script = build(:script, name: 'csp1-2017')
    assignable_info = script.assignable_info

    assert_equal('CSP Unit 1 Test', assignable_info[:name])
    assert_equal('CSP Test', assignable_info[:category])
  end

  test "self.valid_scripts: does not return hidden scripts when user is a student" do
    student = create(:student)

    scripts = Script.valid_scripts(student)
    refute has_hidden_script?(scripts)
  end

  test "self.valid_scripts: does not return hidden scripts when user is a teacher" do
    teacher = create(:teacher)

    scripts = Script.valid_scripts(teacher)
    refute has_hidden_script?(scripts)
  end

  test "self.valid_scripts: returns hidden scripts when user is an admin" do
    admin = create(:admin)

    scripts = Script.valid_scripts(admin)
    assert has_hidden_script?(scripts)
  end

  test "self.valid_scripts: returns hidden scripts when user has hidden script access" do
    teacher = create(:teacher)
    teacher.update(permission: UserPermission::HIDDEN_SCRIPT_ACCESS)

    scripts = Script.valid_scripts(teacher)
    assert has_hidden_script?(scripts)
  end

  test "self.valid_scripts: returns alternate script if user has a course experiment with an alternate script" do
    user = create(:user)
    script = create(:script)
    alternate_script = build(:script)

    Course.stubs(:has_any_course_experiments?).returns(true)
    Rails.cache.stubs(:fetch).returns([script])
    script.stubs(:alternate_script).returns(alternate_script)

    scripts = Script.valid_scripts(user)
    assert_equal [alternate_script], scripts
  end

  test "self.valid_scripts: returns original script if user has a course experiment with no alternate script" do
    user = create(:user)
    script = create(:script)

    Course.stubs(:has_any_course_experiments?).returns(true)
    Rails.cache.stubs(:fetch).returns([script])
    script.stubs(:alternate_script).returns(nil)

    scripts = Script.valid_scripts(user)
    assert_equal [script], scripts
  end

  test "self.valid_scripts: omits pilot scripts" do
    student = create :student
    teacher = create :teacher
    levelbuilder = create :levelbuilder
    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    pilot_script = create :script, pilot_experiment: 'my-experiment'
    assert pilot_script.hidden
    assert Script.any?(&:pilot?)

    refute Script.valid_scripts(student).any?(&:pilot?)
    refute Script.valid_scripts(teacher).any?(&:pilot?)
    assert Script.valid_scripts(pilot_teacher).any?(&:pilot?)
    assert Script.valid_scripts(levelbuilder).any?(&:pilot?)
  end

  test "get_assessment_script_levels returns an empty list if no level groups" do
    script = create(:script, name: 'test-no-levels')
    level_group_script_level = script.get_assessment_script_levels
    assert_equal level_group_script_level, []
  end

  test "get_assessment_script_levels returns a list of script levels" do
    script = create(:script, name: 'test-level-group')
    level_group = create(:level_group, name: 'assessment 1')
    script_level = create(:script_level, levels: [level_group], assessment: true, script: script)

    assessment_script_levels = script.get_assessment_script_levels
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
    script = create :script
    assert_equal ['English'], script.supported_locale_names

    script.supported_locales = ['en-US']
    assert_equal ['English'], script.supported_locale_names

    script.supported_locales = ['fr-FR']
    assert_equal ['English', 'French'], script.supported_locale_names

    script.supported_locales = ['fr-FR', 'ar-SA']
    assert_equal ['Arabic', 'English', 'French'], script.supported_locale_names

    script.supported_locales = ['en-US', 'fr-FR', 'ar-SA']
    assert_equal ['Arabic', 'English', 'French'], script.supported_locale_names

    script.supported_locales = ['fr-fr']
    assert_equal ['English', 'fr-fr'], script.supported_locale_names
  end

  test 'section_hidden_unit_info' do
    teacher = create :teacher
    section1 = create :section, user: teacher
    assert_equal({}, @script_in_course.section_hidden_unit_info(teacher))

    create :section_hidden_script, section: section1, script: @script_in_course
    assert_equal({section1.id => [@script_in_course.id]}, @script_in_course.section_hidden_unit_info(teacher))

    # other script has no effect
    other_script = create :script
    create :section_hidden_script, section: section1, script: other_script
    assert_equal({section1.id => [@script_in_course.id]}, @script_in_course.section_hidden_unit_info(teacher))

    # other teacher's sections have no effect
    other_teacher = create :teacher
    other_teacher_section = create :section, user: other_teacher
    create :section_hidden_script, section: other_teacher_section, script: @script_in_course
    assert_equal({section1.id => [@script_in_course.id]}, @script_in_course.section_hidden_unit_info(teacher))

    # other section for same teacher hidden for same script appears in list
    section2 = create :section, user: teacher
    assert_equal({section1.id => [@script_in_course.id]}, @script_in_course.section_hidden_unit_info(teacher))
    create :section_hidden_script, section: section2, script: @script_in_course
    assert_equal(
      {
        section1.id => [@script_in_course.id],
        section2.id => [@script_in_course.id]
      },
      @script_in_course.section_hidden_unit_info(teacher)
    )
  end

  test 'pilot scripts are always hidden during seed' do
    l = create :level
    dsl = <<-SCRIPT
      hidden false
      pilot_experiment 'pilot-experiment'

      stage 'Stage1'
      level '#{l.name}'
    SCRIPT

    File.stubs(:read).returns(dsl)
    scripts, _ = Script.setup(['pilot-script.script'])
    script = scripts.first

    assert_equal 'pilot-script', script.name
    assert_equal 'pilot-experiment', script.pilot_experiment
    assert script.hidden
  end

  test 'has pilot access' do
    script = create :script
    pilot_script = create :script, pilot_experiment: 'my-experiment'

    student = create :student
    teacher = create :teacher

    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'

    # student in a pilot teacher's section which is not assigned to any script
    section = create :section, user: pilot_teacher
    unassigned_student = create(:follower, section: section).student_user

    # student in a pilot teacher's section which is assigned to a pilot script
    pilot_section = create :section, user: pilot_teacher, script: pilot_script
    pilot_student = create(:follower, section: pilot_section).student_user

    # teacher in a pilot teacher's section
    teacher_in_section = create :teacher
    create(:follower, section: pilot_section, student_user: teacher_in_section)

    # student in a section which was previously assigned to a pilot script
    other_pilot_section = create :section, user: pilot_teacher, script: pilot_script
    previous_student = create(:follower, section: other_pilot_section).student_user
    other_pilot_section.script = nil
    other_pilot_section.save!

    # student of pilot teacher, student never assigned to pilot script
    non_pilot_section = create :section, user: pilot_teacher
    student_of_pilot_teacher = create(:follower, section: non_pilot_section).student_user

    levelbuilder = create :levelbuilder

    refute script.pilot?
    refute script.has_pilot_access?
    refute script.has_pilot_access?(student)
    refute script.has_pilot_access?(teacher)
    refute script.has_pilot_access?(pilot_teacher)
    refute script.has_pilot_access?(unassigned_student)
    refute script.has_pilot_access?(pilot_student)
    refute script.has_pilot_access?(teacher_in_section)
    refute script.has_pilot_access?(previous_student)
    refute script.has_pilot_access?(student_of_pilot_teacher)
    refute script.has_pilot_access?(levelbuilder)

    assert pilot_script.pilot?
    refute pilot_script.has_pilot_access?
    refute pilot_script.has_pilot_access?(student)
    refute pilot_script.has_pilot_access?(teacher)
    assert pilot_script.has_pilot_access?(pilot_teacher)
    refute pilot_script.has_pilot_access?(unassigned_student)
    assert pilot_script.has_pilot_access?(pilot_student)
    assert pilot_script.has_pilot_access?(teacher_in_section)
    assert pilot_script.has_pilot_access?(previous_student)
    refute script.has_pilot_access?(student_of_pilot_teacher)
    assert pilot_script.has_pilot_access?(levelbuilder)
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

  test "script_names_by_curriculum_umbrella returns the correct script names" do
    assert_equal(
      [@csf_script.name],
      Script.script_names_by_curriculum_umbrella('CSF')
    )
    assert_equal(
      [@csd_script.name],
      Script.script_names_by_curriculum_umbrella('CSD')
    )
    assert_equal(
      [@csp_script.name],
      Script.script_names_by_curriculum_umbrella('CSP')
    )
  end

  test "under_curriculum_umbrella and helpers" do
    assert @csf_script.under_curriculum_umbrella?('CSF')
    assert @csf_script.csf?
    assert @csd_script.under_curriculum_umbrella?('CSD')
    assert @csd_script.csd?
    assert @csp_script.under_curriculum_umbrella?('CSP')
    assert @csp_script.csp?
  end

  private

  def has_hidden_script?(scripts)
    scripts.any?(&:hidden)
  end
end
