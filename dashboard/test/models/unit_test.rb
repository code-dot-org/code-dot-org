require 'test_helper'
require 'cdo/shared_constants'

class UnitTest < ActiveSupport::TestCase
  include SharedConstants

  self.use_transactional_test_case = true

  setup_all do
    seed_deprecated_unit_fixtures

    Rails.application.config.stubs(:levelbuilder_mode).returns false
    @game = create(:game)
    # Level names match those in 'test.script'
    @levels = (1..8).map {|n| create(:level, name: "Level #{n}", game: @game)}

    @unit_group = create(:unit_group)
    @unit_in_unit_group = create(:script, name: 'unit-in-unit-group', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)
    create(:unit_group_unit, position: 1, unit_group: @unit_group, script: @unit_in_unit_group)
    @unit_in_unit_group.reload
    @unit_group.reload

    @pl_unit_group = create(:unit_group)
    @pl_unit_in_unit_group = create(:script, name: 'pl-unit-in-unit-group', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    create(:unit_group_unit, position: 1, unit_group: @pl_unit_group, script: @pl_unit_in_unit_group)
    @pl_unit_in_unit_group.reload
    @pl_unit_group.reload

    @unit_2017 = create :script, name: 'script-2017', family_name: 'family-cache-test', version_year: '2017'
    @unit_2018 = create :script, name: 'script-2018', family_name: 'family-cache-test', version_year: '2018'

    @csf_unit = create :csf_script, name: 'csf1'
    @csd_unit = create :csd_script, name: 'csd1'
    @csp_unit = create :csp_script, name: 'csp1'
    @csa_unit = create :csa_script, name: 'csa1'

    @csc_unit = create :csc_script, name: 'csc1', is_course: true, family_name: 'csc-test-unit', version_year: 'unversioned'

    @hoc_unit = create :hoc_script, name: 'hoc1', is_course: true, family_name: 'hoc-test-unit', version_year: 'unversioned'

    @csf_unit_2019 = create :csf_script, name: 'csf-2019', version_year: '2019'

    # To test level caching, we have to make sure to create a level in a script
    # *before* generating the caches.
    # We also want to test level_concept_difficulties, so make sure to give it
    # one.
    @cacheable_level = create(:level, :with_script, level_concept_difficulty: create(:level_concept_difficulty))
  end

  setup do
    UnitGroup.clear_cache
    Unit.clear_cache
  end

  def populate_cache_and_disconnect_db
    Unit.stubs(:should_cache?).returns true
    # Only need to populate cache once per test-suite run
    @@script_cached ||= Unit.unit_cache_to_cache
    Unit.script_cache
    Unit.unit_family_cache

    # Also populate course_cache, as it's used by course_link
    UnitGroup.stubs(:should_cache?).returns true
    @@course_cached ||= UnitGroup.course_cache_to_cache
    UnitGroup.course_cache

    CourseVersion.stubs(:should_cache?).returns true
    CourseVersion.course_offering_keys('Unit')

    CourseOffering.all.pluck(:key).each do |key|
      CourseOffering.get_from_cache(key)
    end

    Unit.all.pluck(:id, :name).each do |sid, name|
      CourseOffering.get_from_cache(sid)
      CourseOffering.get_from_cache(name)
    end

    # NOTE: ActiveRecord collection association still references an active DB connection,
    # even when the data is already eager loaded.
    # Best we can do is ensure that no queries are executed on the active connection.
    ActiveRecord::Base.connection.stubs(:execute).raises 'Database disconnected'
  end

  test 'can setup migrated unit with new models' do
    Unit.stubs(:unit_json_directory).returns(File.join(self.class.fixture_path, 'config', 'scripts_json'))

    # test that LessonActivity, ActivitySection and Objective can be seeded
    # from .script_json when is_migrated is specified in the .script file.
    # use 'custom' level num to make level key match level name.
    create :maze, name: 'test_maze_level'
    Unit.seed_from_json_file('test-migrated-models')
    unit = Unit.find_by_name('test-migrated-models')
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

  test 'get_script_level_by_relative_position_and_puzzle_position returns nil when not found' do
    artist = Unit.find_by_name('artist')
    assert artist.get_script_level_by_relative_position_and_puzzle_position(11, 1, false).nil?
  end

  test 'get_from_cache uses cache' do
    # We test the cache using name lookups...
    flappy = Unit.find_by_name('flappy')
    frozen = Unit.find_by_name('frozen')
    # ...and ID lookups.
    flappy_id = flappy.id
    frozen_id = frozen.id

    populate_cache_and_disconnect_db

    assert_equal flappy, Unit.get_from_cache('flappy')
    assert_equal flappy, Unit.get_from_cache(flappy_id)
    assert_equal frozen, Unit.get_from_cache('frozen')
    assert_equal frozen, Unit.get_from_cache(frozen_id)
  end

  test 'get_from_cache raises if called with a family_name' do
    error = assert_raises do
      Unit.get_from_cache('coursea')
    end
    assert_equal 'Do not call Unit.get_from_cache with a family_name. Call Unit.get_unit_family_redirect_for_user instead.  Family: coursea', error.message
  end

  test 'get_family_from_cache uses unit_family_cache' do
    family_scripts = Unit.where(family_name: 'family-cache-test')
    assert_equal [@unit_2017.name, @unit_2018.name], family_scripts.map(&:name)

    populate_cache_and_disconnect_db

    cached_family_scripts = Unit.get_family_from_cache('family-cache-test')
    assert_equal [@unit_2017.name, @unit_2018.name], cached_family_scripts.map(&:name).uniq
  end

  test 'cache_find_script_level uses cache' do
    script_level = Unit.first.script_levels.first

    populate_cache_and_disconnect_db

    assert_equal script_level, Unit.cache_find_script_level(script_level.id)
  end

  test 'cache_find_level uses cache with ID lookup' do
    level = Unit.find_by_name(Unit::FLAPPY_NAME).script_levels.first.level

    populate_cache_and_disconnect_db

    assert_equal level, Unit.cache_find_level(level.id)
  end

  test 'cache_find_level uses cache with name lookup' do
    level = Unit.find_by_name(Unit::FLAPPY_NAME).script_levels.first.level

    populate_cache_and_disconnect_db

    assert_equal level, Unit.cache_find_level(level.name)
  end

  test 'cache_find_level raises exception on bad ID and bad name' do
    bad_id = Level.last.id + 1

    assert_raises(ActiveRecord::RecordNotFound) do
      Unit.cache_find_level(bad_id)
    end
    assert_raises(ActiveRecord::RecordNotFound) do
      Unit.cache_find_level('not a level name')
    end
  end

  test 'level uses cache' do
    script_level = Unit.first.script_levels.first
    expected_level = script_level.level

    populate_cache_and_disconnect_db

    assert_equal expected_level,
      Unit.cache_find_script_level(script_level.id).level
  end

  test 'lesson hierarchy uses cache' do
    unit = Unit.first
    lesson = unit.lessons.first
    expected_script_level = lesson.script_levels.first
    expected_level = lesson.script_levels.first.levels.first

    populate_cache_and_disconnect_db

    assert_equal expected_script_level,
      Unit.get_from_cache(unit.id).lessons.first.script_levels.first
    assert_equal expected_level,
      Unit.get_from_cache(unit.id).
        lessons.first.script_levels.first.levels.first
  end

  test 'level_concept_difficulty uses preloading' do
    script = @cacheable_level.script_levels.first.script
    expected = @cacheable_level.level_concept_difficulty

    refute_nil expected

    populate_cache_and_disconnect_db

    assert_equal expected, Unit.get_from_cache(script.name).script_levels.first.level.level_concept_difficulty
  end

  test 'get_without_cache raises exception for bad id' do
    bad_id = Unit.last.id + 1

    assert_raises(ActiveRecord::RecordNotFound) do
      Unit.get_from_cache(bad_id)
    end
  end

  test 'get_unit_family_redirect_for_user returns latest stable unit assigned or with progress if participant' do
    pl_csp1_2017 = create(:script, name: 'pl-csp1-2017', family_name: 'pl-csp', version_year: '2017', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    pl_csp1_2018 = create(:script, name: 'pl-csp1-2018', family_name: 'pl-csp', version_year: '2018', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)

    # Assign participant to pl_csp1_2017.
    section = create :section, script: pl_csp1_2017
    participant = create :teacher
    section.students << participant

    redirect_unit = Unit.get_unit_family_redirect_for_user('pl-csp', user: participant)
    assert_equal pl_csp1_2017.name, redirect_unit.redirect_to

    # participant makes progress in csp1_2018.
    create :user_level, user: participant, script: pl_csp1_2018
    participant.reload

    redirect_unit = Unit.get_unit_family_redirect_for_user('pl-csp', user: participant)
    assert_equal pl_csp1_2018.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns nil if user can not be an instructor or participant' do
    student = create :student
    create(:script, name: 'pl-csp1-2017', family_name: 'pl-csp', version_year: '2017', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    create(:script, name: 'pl-csp1-2018', family_name: 'pl-csp', version_year: '2018', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)

    assert_nil Unit.get_unit_family_redirect_for_user('pl-csp', user: student)
  end

  test 'get_unit_family_redirect_for_user returns latest stable unit assigned or with progress if student' do
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018')

    # Assign student to csp1_2017.
    section = create :section, script: csp1_2017
    student = create :student
    section.students << student

    redirect_unit = Unit.get_unit_family_redirect_for_user('csp', user: student)
    assert_equal csp1_2017.name, redirect_unit.redirect_to

    # Student makes progress in csp1_2018.
    create :user_level, user: student, script: csp1_2018
    student.reload

    redirect_unit = Unit.get_unit_family_redirect_for_user('csp', user: student)
    assert_equal csp1_2018.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns latest stable unit in family if instructor' do
    facilitator = create :facilitator
    pl_csp1_2017 = create(:script, name: 'pl-csp1-2017', family_name: 'pl-csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    pl_csp1_2018 = create(:script, name: 'pl-csp1-2018', family_name: 'pl-csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    create(:script, name: 'pl-csp1-2019', family_name: 'pl-csp', version_year: '2019', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    create :section, user: facilitator, script: pl_csp1_2017

    redirect_unit = Unit.get_unit_family_redirect_for_user('pl-csp', user: facilitator)
    assert_equal pl_csp1_2018.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns latest stable unit in family if teacher' do
    teacher = create :teacher
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    create(:script, name: 'csp1-2019', family_name: 'csp', version_year: '2019')
    create :section, user: teacher, script: csp1_2017

    redirect_unit = Unit.get_unit_family_redirect_for_user('csp', user: teacher)
    assert_equal csp1_2018.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns nil if no units in family are stable' do
    create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)
    assert_nil Unit.get_unit_family_redirect_for_user('csp')
  end

  test 'get_unit_family_redirect_for_user returns latest version supported in locale if available' do
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, supported_locales: ['es-MX'])
    create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)

    redirect_unit = Unit.get_unit_family_redirect_for_user('csp', locale: 'es-MX')
    assert_equal csp1_2017.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns latest stable version if no user or locale' do
    create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)

    redirect_unit = Unit.get_unit_family_redirect_for_user('csp')
    assert_equal csp1_2018.name, redirect_unit.redirect_to
  end

  test 'get_unit_family_redirect_for_user returns latest stable version if no versions supported in locale' do
    create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, supported_locales: ['es-MX'])
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)

    redirect_unit = Unit.get_unit_family_redirect_for_user('csp', locale: 'it-IT')
    assert_equal csp1_2018.name, redirect_unit.redirect_to
  end

  test 'redirect_to_unit_url returns nil unless user can view unit version' do
    Unit.any_instance.stubs(:can_view_version?).returns(false)
    student = create :student
    unit = create :script, name: 'my-script'

    assert_nil unit.redirect_to_unit_url(student)
  end

  test 'redirect_to_unit_url returns nil if user is assigned to unit' do
    Unit.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    unit = create :script, name: 'my-script'
    section = create :section, script: unit
    section.students << student

    assert_nil unit.redirect_to_unit_url(student)
  end

  test 'redirect_to_unit_url returns nil if user is not assigned to any unit in family' do
    Unit.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    unit = create :script, name: 'my-script'

    assert_nil unit.redirect_to_unit_url(student)
  end

  test 'returns nil if latest assigned unit is an older version than the current unit' do
    Unit.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp', version_year: '2017')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp', version_year: '2018')
    section = create :section, script: csp1_2017
    section.students << student

    assert_nil csp1_2018.redirect_to_unit_url(student)
  end

  test 'redirect_to_unit_url returns unit url of latest assigned unit version in family for unit belonging to course family' do
    Unit.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017', family_name: 'csp')
    create :unit_group_unit, unit_group: csp_2017, script: csp1_2017, position: 1
    CourseOffering.add_course_offering(csp_2017)
    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp')
    create :unit_group_unit, unit_group: csp_2018, script: csp1_2018, position: 1
    CourseOffering.add_course_offering(csp_2018)
    section = create :section, unit_group: csp_2018
    section.students << student

    csp1_2018.reload
    csp1_2017.reload
    assert_equal csp1_2018.link, csp1_2017.redirect_to_unit_url(student)
  end

  test 'redirect_to_unit_url returns unit url of latest assigned unit version in family for unit not belonging to course family' do
    Unit.any_instance.stubs(:can_view_version?).returns(true)
    student = create :student
    courseg_2017 = create(:script, name: 'courseg-2017', family_name: 'courseg', version_year: '2017', is_course: true)
    CourseOffering.add_course_offering(courseg_2017)
    courseg_2018 = create(:script, name: 'courseg-2018', family_name: 'courseg', version_year: '2018', is_course: true)
    CourseOffering.add_course_offering(courseg_2018)
    section = create :section, script: courseg_2018
    section.students << student

    assert_equal courseg_2018.link, courseg_2017.redirect_to_unit_url(student)
  end

  class CanViewVersion < ActiveSupport::TestCase
    setup do
      @student = create :student
      @teacher = create :teacher
      @facilitator = create :facilitator
      @plc_reviewer = create :plc_reviewer

      @courseq_2017 = create(:script, name: 'courseq-2017', family_name: 'courseq', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
      @courseq_2018 = create(:script, name: 'courseq-2018', family_name: 'courseq', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
      @courseq_2019 = create(:script, name: 'courseq-2019', family_name: 'courseq', version_year: '2019')

      @pl_courseq_2017 = create(:script, name: 'pl-courseq-2017', family_name: 'pl-courseq', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator)
      @pl_courseq_2018 = create(:script, name: 'pl-courseq-2018', family_name: 'pl-courseq', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator)
    end

    test 'can_view_version? is true for instructor audience for old versions' do
      assert @pl_courseq_2017.can_view_version?(@plc_reviewer)
    end

    test 'can_view_version? is true for teachers where they are part of the instructor or participant audiences' do
      assert @courseq_2017.can_view_version?(@teacher)
    end

    test 'can_view_version? is false for teachers where they are NOT part of the instructor or participant audiences' do
      refute @pl_courseq_2017.can_view_version?(@teacher)
    end

    test 'can_view_version? is true if unit is latest stable version in student locale or in English' do
      latest_in_english = create :script, name: 'english-only-script', family_name: 'courseg', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, supported_locales: []
      latest_in_locale = create :script, name: 'localized-script', family_name: 'courseg', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, supported_locales: ['it-it']
      student = create :student

      assert latest_in_english.can_view_version?(student, locale: 'it-it')
      assert latest_in_english.can_view_version?(nil)
      assert latest_in_locale.can_view_version?(student, locale: 'it-it')
      assert latest_in_locale.can_view_version?(nil, locale: 'it-it')
    end

    test 'can_view_version? is false if unit is unstable and has no progress and is not assigned' do
      refute @courseq_2019.can_view_version?(@student)
    end

    test 'can_view_version? is true if student is assigned to unit' do
      @student.expects(:assigned_script?).returns(true)

      assert @courseq_2017.can_view_version?(@student)
    end

    test 'can_view_version? is true if student has progress in unit' do
      @student.scripts << @courseq_2017

      assert @courseq_2017.can_view_version?(@student)
    end

    test 'can_view_version? is true if student has progress in unit group unit belongs to' do
      unit_group = create :unit_group, family_name: 'unit-fam'
      unit1 = create :script, name: 'unit1', family_name: 'unit-fam'
      create :unit_group_unit, unit_group: unit_group, script: unit1, position: 1
      unit2 = create :script, name: 'unit2', family_name: 'unit-fam'
      create :unit_group_unit, unit_group: unit_group, script: unit2, position: 2
      @student.scripts << unit1
      unit_group.reload
      unit1.reload
      unit2.reload

      assert unit2.can_view_version?(@student)
    end
  end

  test 'self.latest_stable_version is nil if no unit versions in family are stable in locale' do
    create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, supported_locales: ["it-it"]
    create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, supported_locales: ["it-it"]

    assert_nil Unit.latest_stable_version('fake-family', locale: 'es-mx')
  end

  test 'self.latest_stable_version returns latest stable version for user locale' do
    create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, supported_locales: ["it-it"]
    unit_2018 = create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, supported_locales: ["it-it"]

    assert_equal unit_2018, Unit.latest_stable_version('fake-family', locale: 'it-it')
  end

  test 'self.latest_stable_version returns latest stable version for English locales' do
    create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    unit_2018 = create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable

    assert_equal unit_2018, Unit.latest_stable_version('fake-family')
    assert_equal unit_2018, Unit.latest_stable_version('fake-family', locale: 'en-ca')
  end

  test 'self.latest_stable_version returns correct unit version in family if version_year is supplied' do
    unit_2017 = create :script, name: 's-2017', family_name: 'fake-family', version_year: '2017', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    create :script, name: 's-2018', family_name: 'fake-family', version_year: '2018', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable

    assert_equal unit_2017, Unit.latest_stable_version('fake-family', version_year: '2017')
  end

  test 'self.latest_assigned_version returns nil if no units in family are assigned to user' do
    unit1 = create :script, name: 's-1', family_name: 'family-1'
    student = create :student
    student.scripts << unit1

    assert_nil Unit.latest_assigned_version('family-2', student)
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

    assert_equal csp1_2017, Unit.latest_assigned_version('csp', student)
  end

  test 'self.latest_assigned_version returns latest assigned unit in family if unit is not in course family' do
    student = create :student
    courseg_2017 = create(:script, name: 'courseg-2017', family_name: 'courseg', version_year: '2017')
    create(:script, name: 'courseg-2018', family_name: 'courseg', version_year: '2018')
    section = create :section, script: courseg_2017
    section.students << student

    assert_equal courseg_2017, Unit.latest_assigned_version('courseg', student)
  end

  test 'self.latest_version_with_progress returns nil if user made no progress in any version' do
    student = create :student
    family_name = 'fake-script-family'
    create(:script, name: 'fake-script-family-2023', family_name: family_name, version_year: '2023')

    assert_nil Unit.latest_version_with_progress(family_name, student)
  end

  test 'self.latest_version_with_progress returns version user made progress in if they made progress in one' do
    student = create :student
    family_name = 'fake-script-family'
    fake_script_2023 = create(:script, name: 'sample-script-family-2023', family_name: family_name, version_year: '2023')
    create :user_script, user: student, script: fake_script_2023, last_progress_at: Time.now

    assert_equal fake_script_2023, Unit.latest_version_with_progress(family_name, student)
  end

  test 'self.latest_version_with_progress returns latest version of unit user made progress in' do
    student = create :student
    family_name = 'fake-script-family'
    fake_script_2022 = create(:script, name: 'sample-script-family-2022', family_name: family_name, version_year: '2022')
    fake_script_2023 = create(:script, name: 'sample-script-family-2023', family_name: family_name, version_year: '2023')
    create :user_script, user: student, script: fake_script_2022, last_progress_at: Time.now
    create :user_script, user: student, script: fake_script_2023, last_progress_at: Time.now

    assert_equal fake_script_2023, Unit.latest_version_with_progress(family_name, student)
  end

  test 'self.latest_version_with_progress returns latest version of unit user made progress in even if most recent progress not in most recent version' do
    student = create :student
    family_name = 'fake-script-family'
    fake_script_2022 = create(:script, name: 'sample-script-family-2022', family_name: family_name, version_year: '2022')
    fake_script_2023 = create(:script, name: 'sample-script-family-2023', family_name: family_name, version_year: '2023')
    create :user_script, user: student, script: fake_script_2022, last_progress_at: Time.now
    create :user_script, user: student, script: fake_script_2023, last_progress_at: Time.now - 1.day

    assert_equal fake_script_2023, Unit.latest_version_with_progress(family_name, student)
  end

  test 'has_other_versions? makes no queries when there is one other unit group version' do
    Unit.stubs(:should_cache?).returns true

    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017')
    create :unit_group_unit, unit_group: csp_2017, script: csp1_2017, position: 1
    CourseOffering.add_course_offering(csp_2017)

    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018')
    create :unit_group_unit, unit_group: csp_2018, script: csp1_2018, position: 1
    CourseOffering.add_course_offering(csp_2018)

    csp1_2017 = Unit.get_from_cache(csp1_2017.id)
    assert_queries(0) do
      assert csp1_2017.has_other_versions?
    end
  end

  test 'has_other_versions? makes no queries when there are no other unit group versions' do
    Unit.stubs(:should_cache?).returns true

    csp_2017 = create(:unit_group, name: 'csp-2017', family_name: 'csp', version_year: '2017')
    csp1_2017 = create(:script, name: 'csp1-2017')
    create :unit_group_unit, unit_group: csp_2017, script: csp1_2017, position: 1
    CourseOffering.add_course_offering(csp_2017)

    csp1_2017 = Unit.get_from_cache(csp1_2017.id)
    assert_queries(0) do
      refute csp1_2017.has_other_versions?
    end
  end

  test 'has_other_versions? makes no queries when there is one other unit version' do
    Unit.stubs(:should_cache?).returns true

    foo17 = create(:script, name: 'foo-2017', family_name: 'foo', version_year: '2017', is_course: true)
    CourseOffering.add_course_offering(foo17)
    foo18 = create(:script, name: 'foo-2018', family_name: 'foo', version_year: '2018', is_course: true)
    CourseOffering.add_course_offering(foo18)

    foo17 = Unit.get_from_cache(foo17.id)
    assert_queries(0) do
      assert foo17.has_other_versions?
    end
  end

  # we expect to hit this case when serving uncached hoc unit overview pages.
  test 'has_other_versions? makes no queries when there are no other unit versions' do
    Unit.stubs(:should_cache?).returns true

    foo17 = create(:script, name: 'foo-2017', family_name: 'foo', version_year: '2017', is_course: true)
    CourseOffering.add_course_offering(foo17)

    foo17 = Unit.get_from_cache(foo17.id)
    assert_queries(0) do
      refute foo17.has_other_versions?
    end
  end

  test 'banner image' do
    assert_nil Unit.find_by_name('flappy').banner_image
    assert_equal 'banner_course1.jpg', Unit.find_by_name('course1').banner_image
    assert_equal 'banner_course2.jpg', Unit.find_by_name('course2').banner_image
    assert_nil Unit.find_by_name('csf1').banner_image
  end

  test 'old_professional_learning_course?' do
    refute Unit.find_by_name('flappy').old_professional_learning_course?
    assert Unit.find_by_name('ECSPD').old_professional_learning_course?
  end

  test 'should summarize migrated unit' do
    unit = create(:script, name: 'single-lesson-script', instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student)
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    lesson = create(:lesson, script: unit, name: 'lesson 1', lesson_group: lesson_group)
    create(:script_level, script: unit, lesson: lesson)
    create :resource, lessons: [lesson], include_in_pdf: true
    Services::CurriculumPdfs.stubs(:get_script_overview_url).returns('/overview-pdf-url')
    Services::CurriculumPdfs.stubs(:get_unit_resources_url).returns('/resources-pdf-url')
    summary = unit.summarize

    assert_equal 1, summary[:lessons].count
    assert_nil summary[:peerReviewLessonInfo]
    assert_equal 0, summary[:peerReviewsRequired]
    assert_equal 'teacher_led', summary[:instructionType]
    assert_equal 'teacher', summary[:instructorAudience]
    assert_equal 'student', summary[:participantAudience]
    assert_equal '/overview-pdf-url', summary[:scriptOverviewPdfUrl]
    assert_equal '/resources-pdf-url', summary[:scriptResourcesPdfUrl]
  end

  test 'get_unit_resources_pdf_url returns nil if no resources in script or lessons' do
    Services::CurriculumPdfs.stubs(:get_unit_resources_url).returns('/resources-pdf-url')
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    create :script_level, script: unit, lesson: lesson

    assert_nil unit.get_unit_resources_pdf_url
  end

  test 'should summarize migrated unit in unit group' do
    unit_group = create(:unit_group, instruction_type: Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.self_paced, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    unit = create(:script, name: 'single-lesson-script', is_migrated: true)
    create(:unit_group_unit, position: 1, unit_group: unit_group, script: unit)

    unit.reload
    summary = unit.summarize

    assert_equal 'self_paced', summary[:instructionType]
    assert_equal 'facilitator', summary[:instructorAudience]
    assert_equal 'teacher', summary[:participantAudience]
  end

  test 'should summarize migrated unit with legacy lesson plans' do
    unit = create(:script, name: 'single-lesson-script', use_legacy_lesson_plans: true)
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    lesson = create(:lesson, script: unit, name: 'lesson 1', lesson_group: lesson_group)
    create(:script_level, script: unit, lesson: lesson)
    Services::CurriculumPdfs.stubs(:get_script_overview_url).returns('/overview-pdf-url')
    Services::CurriculumPdfs.stubs(:get_unit_resources_url).returns('/resources-pdf-url')
    summary = unit.summarize

    refute summary[:scriptOverviewPdfUrl]
    refute summary[:scriptResourcesPdfUrl]
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

  test 'should generate a shorter summary for header' do
    unit = create(:script, name: 'single-lesson-script')
    lesson_group = create(:lesson_group, key: 'key1', script: unit)
    lesson = create(:lesson, script: unit, name: 'lesson 1', lesson_group: lesson_group)
    create(:script_level, script: unit, lesson: lesson)

    expected = {
      name: 'single-lesson-script',
      displayName: 'single-lesson-script',
      disablePostMilestone: false,
      student_detail_progress_view: false,
      age_13_required: false,
      show_sign_in_callout: false
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
    csp_2017.reload
    csp1_2017.reload

    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018')
    create(:unit_group_unit, unit_group: csp_2018, script: csp1_2018, position: 1)
    csp_2018.reload
    csp1_2018.reload

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
    foo17 = create(:script, name: 'foo-2017', family_name: 'foo', version_year: '2017', is_course: true)
    CourseOffering.add_course_offering(foo17)
    foo18 = create(:script, name: 'foo-2018', family_name: 'foo', version_year: '2018', is_course: true)
    CourseOffering.add_course_offering(foo18)
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
    csp_2017.reload
    csp1_2017.reload

    csp_2018 = create(:unit_group, name: 'csp-2018', family_name: 'csp', version_year: '2018')
    csp1_2018 = create(:script, name: 'csp1-2018', family_name: 'csp1', version_year: '2018')
    create(:unit_group_unit, unit_group: csp_2018, script: csp1_2018, position: 1)
    csp_2018.reload
    csp1_2018.reload

    user = create(:student)
    create(:user_script, user: user, script: csp1_2017)
    assert csp1_2018.summarize(true, user)[:show_course_unit_version_warning]
    refute csp1_2018.summarize(true, user)[:show_script_version_warning]
  end

  test 'summarize includes versions' do
    foo17 = create(
      :script, name: 'foo-2017', family_name: 'foo', version_year: '2017', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    )
    CourseOffering.add_course_offering(foo17)
    foo18 = create(
      :script, name: 'foo-2018', family_name: 'foo', version_year: '2018', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    )
    CourseOffering.add_course_offering(foo18)

    course_versions = foo17.summarize(false, create(:teacher))[:course_versions]
    assert_equal 2, course_versions.keys.length
    assert_equal 'foo-2017', course_versions.values[0][:name]
    assert_equal '2017', course_versions.values[0][:version_year]
    assert_equal 'foo-2018', course_versions.values[1][:name]
    assert_equal '2018', course_versions.values[1][:version_year]
  end

  test 'summarize course_versions for teacher' do
    foo16 = create(
      :script, name: 'foo-2016', family_name: 'foo', version_year: '2016', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    )
    CourseOffering.add_course_offering(foo16)
    foo17 = create(
      :script, name: 'foo-2017', family_name: 'foo', version_year: '2017', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    )
    CourseOffering.add_course_offering(foo17)
    foo18 = create(
      :script, name: 'foo-2018', family_name: 'foo', version_year: '2018', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    )
    CourseOffering.add_course_offering(foo18)
    foo19 = create(
      :script, name: 'foo-2019', family_name: 'foo', version_year: '2019', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    )
    CourseOffering.add_course_offering(foo19)

    [foo16, foo17, foo18, foo19].each do |s|
      summary = s.summarize_course_versions(create(:teacher))
      assert_equal(["foo-2016", "foo-2017", "foo-2018"], summary.values.map {|h| h[:name]})
      assert_equal([true, true, false], summary.values.map {|h| h[:is_stable]})
      assert_equal([false, true, false], summary.values.map {|h| h[:is_recommended]})
    end
  end

  test 'summarize_course_versions for student' do
    foo16 = create(
      :script, name: 'foo-2016', family_name: 'foo', version_year: '2016', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    )
    CourseOffering.add_course_offering(foo16)
    foo17 = create(
      :script, name: 'foo-2017', family_name: 'foo', version_year: '2017', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    )
    CourseOffering.add_course_offering(foo17)
    foo18 = create(
      :script, name: 'foo-2018', family_name: 'foo', version_year: '2018', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    )
    CourseOffering.add_course_offering(foo18)
    foo19 = create(
      :script, name: 'foo-2019', family_name: 'foo', version_year: '2019', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    )
    CourseOffering.add_course_offering(foo19)

    [foo17, foo18, foo19].each do |s|
      summary = s.summarize_course_versions(create(:student))
      assert_equal(["foo-2017"], summary.values.map {|h| h[:name]})
      assert_equal([true], summary.values.map {|h| h[:is_stable]})
      assert_equal([true], summary.values.map {|h| h[:is_recommended]})
    end
  end

  test 'summarize excludes unlaunched versions' do
    teacher = create(:teacher)
    foo17 = create(
      :script, name: 'foo-2017', family_name: 'foo', version_year: '2017', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    )
    CourseOffering.add_course_offering(foo17)
    foo18 = create(
      :script, name: 'foo-2018', family_name: 'foo', version_year: '2018', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview
    )
    CourseOffering.add_course_offering(foo18)
    foo19 = create(
      :script, name: 'foo-2019', family_name: 'foo', version_year: '2019', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    )
    CourseOffering.add_course_offering(foo19)

    course_versions = foo17.summarize[:course_versions]
    assert_equal 0, course_versions.keys.length

    course_versions = foo17.summarize(true, teacher)[:course_versions]
    assert_equal 2, course_versions.keys.length
    assert_equal 'foo-2017', course_versions.values[0][:name]
    assert_equal 'foo-2018', course_versions.values[1][:name]
  end

  test 'summarize includes show assign button' do
    unit = create(:course_version, :with_unit).content_root
    unit.update!(name: 'script', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)
    teacher = create(:teacher)

    # No user, show_assign_button set to false
    refute unit.summarize[:show_assign_button]

    # Teacher should be able to assign a launched unit.
    assert_equal Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview, unit.summarize[:publishedState]
    assert unit.summarize(true, teacher)[:show_assign_button]

    # Teacher should not be able to assign a unlaunched script.
    hidden_unit = create(:script, name: 'unassignable-hidden', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)
    assert_equal Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, hidden_unit.summarize[:publishedState]
    refute hidden_unit.summarize(true, teacher)[:show_assign_button]

    # Student should not be able to assign a unit,
    # regardless of visibility.
    assert_equal Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview, unit.summarize[:publishedState]
    refute unit.summarize(true, create(:student))[:show_assign_button]
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

  test 'summarize translates announcements' do
    unit = create :script
    announcement_key = SecureRandom.uuid
    unit.announcements = [{
      key: announcement_key,
      notice: 'Announcement notice',
      details: 'Announcement details',
      buttonText: 'Announcement button text'
    }]
    unit.save!

    # Add translation mapping to the I18n backend
    test_locale = 'te-ST'
    localized_notice = 'Localized notice'
    localized_details = 'Localized details'
    localized_button_text = 'Localized button text'
    custom_i18n = {
      'data' => {
        'script_announcements' => {
          announcement_key => {
            notice: localized_notice,
            details: localized_details,
            buttonText: localized_button_text
          }
        }
      }
    }
    I18n.locale = test_locale
    I18n.backend.store_translations test_locale, custom_i18n

    summary = unit.summarize

    expected_announcements = [{
      'key' => announcement_key,
      'notice' => localized_notice,
      'details' => localized_details,
      'buttonText' => localized_button_text
    }]
    assert_equal expected_announcements, summary[:announcements]
  end

  test 'summarize_for_unit_selector determines whether feedback is enabled' do
    course_version = create :course_version, :with_unit
    course_offering = course_version.course_offering
    course_offering.update!(marketing_initiative: 'CSD')
    unit = course_version.content_root
    summary = unit.summarize_for_unit_selector
    assert summary[:is_feedback_enabled]

    course_offering.update!(marketing_initiative: 'HOC')
    unit.reload
    summary = unit.summarize_for_unit_selector
    refute summary[:is_feedback_enabled]

    # no course version means no feedback
    unit = create :script
    refute unit.get_course_version
    summary = unit.summarize_for_unit_selector
    refute summary[:is_feedback_enabled]
  end

  test 'should generate PLC objects for migrated unit' do
    i18n = {
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
    I18n.backend.store_translations I18n.locale, i18n['en']

    Unit.stubs(:unit_json_directory).returns(self.class.fixture_path)
    unit = Unit.seed_from_json_file('test-plc')

    assert unit.old_professional_learning_course?
    assert_equal 'Test plc course', unit.professional_learning_course
    assert_equal 42, unit.peer_reviews_to_complete

    course_unit = unit.plc_course_unit
    unit_group = unit.plc_course_unit.plc_course.unit_group
    assert_equal 'PLC Test', course_unit.unit_name
    assert_equal 'PLC test fixture script', course_unit.unit_description

    assert_equal 'plc_reviewer', unit_group.instructor_audience
    assert_equal 'facilitator', unit_group.participant_audience
    assert_equal 'teacher_led', unit_group.instruction_type
    assert_equal 'beta', unit_group.published_state

    lm = unit.lessons.first.plc_learning_module
    assert_equal 'Sample Module', lm.name
    assert_equal 1, course_unit.plc_learning_modules.count
    assert_equal lm, course_unit.plc_learning_modules.first
    assert_equal Plc::LearningModule::CONTENT_MODULE, lm.module_type
  end

  test 'updating plc unit updates its unit group' do
    Unit.stubs(:unit_json_directory).returns(self.class.fixture_path)
    unit = Unit.seed_from_json_file('test-plc')

    unit_group = unit.plc_course_unit.plc_course.unit_group

    assert_equal 'plc_reviewer', unit_group.instructor_audience
    assert_equal 'facilitator', unit_group.participant_audience
    assert_equal 'teacher_led', unit_group.instruction_type
    assert_equal 'beta', unit_group.published_state

    unit.update!(instructor_audience: 'universal_instructor', participant_audience: 'teacher', instruction_type: 'self_paced', published_state: 'in_development')

    unit.reload
    unit_group = unit.plc_course_unit.plc_course.unit_group

    assert_equal 'universal_instructor', unit_group.instructor_audience
    assert_equal 'teacher', unit_group.participant_audience
    assert_equal 'self_paced', unit_group.instruction_type
    assert_equal 'in_development', unit_group.published_state
  end

  test 'generate plc objects will use defaults if script has null values' do
    unit = create(:script, professional_learning_course: 'my-plc-course', published_state: nil, instruction_type: nil, instructor_audience: nil, participant_audience: nil)

    unit_group = unit.plc_course_unit.plc_course.unit_group

    assert_equal 'plc_reviewer', unit_group.instructor_audience
    assert_equal 'facilitator', unit_group.participant_audience
    assert_equal 'teacher_led', unit_group.instruction_type
    assert_equal 'beta', unit_group.published_state
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
    lockable1 = create :level, name: 'LockableAssessment1'
    level1 = create :level, name: 'NonLockableAssessment1'
    level2 = create :level, name: 'NonLockableAssessment2'
    level3 = create :level, name: 'NonLockableAssessment3'

    unit = create :script, :with_lessons, lessons_count: 3
    create :script_level, levels: [level1], activity_section: unit.lessons[0].activity_sections.first, assessment: true
    create :script_level, levels: [level2], activity_section: unit.lessons[1].activity_sections.first, assessment: true
    create :script_level, levels: [level3], activity_section: unit.lessons[2].activity_sections.first, assessment: true

    # Everything has Lesson <number> when nothing is lockable
    assert(/^Lesson 1:/.match(unit.lessons[0].localized_title))
    assert(/^Lesson 2:/.match(unit.lessons[1].localized_title))
    assert(/^Lesson 3:/.match(unit.lessons[2].localized_title))

    unit = create :script
    lesson_group = create :lesson_group, script: unit
    create :lesson, lesson_group: lesson_group, relative_position: 1, lockable: true, key: 'Lockable', name: 'Lockable'
    create :lesson, lesson_group: lesson_group, relative_position: 1
    create :lesson, lesson_group: lesson_group, relative_position: 2
    create :script_level, levels: [lockable1], activity_section: unit.lessons[0].activity_sections.first, assessment: true
    create :script_level, levels: [level1], activity_section: unit.lessons[1].activity_sections.first, assessment: true
    create :script_level, levels: [level2], activity_section: unit.lessons[2].activity_sections.first, assessment: true

    # When first lesson is lockable, it has no lesson number, and the next lesson starts at 1
    assert(/^Lesson/.match(unit.lessons[0].localized_title).nil?)
    assert(/^Lesson 1:/.match(unit.lessons[1].localized_title))
    assert(/^Lesson 2:/.match(unit.lessons[2].localized_title))

    unit = create :script
    lesson_group = create :lesson_group, script: unit
    create :lesson, lesson_group: lesson_group, relative_position: 1
    create :lesson, lesson_group: lesson_group, relative_position: 1, lockable: true, key: 'Lockable', name: 'Lockable'
    create :lesson, lesson_group: lesson_group, relative_position: 2
    create :script_level, levels: [level1], activity_section: unit.lessons[0].activity_sections.first, assessment: true
    create :script_level, levels: [lockable1], activity_section: unit.lessons[1].activity_sections.first, assessment: true
    create :script_level, levels: [level2], activity_section: unit.lessons[2].activity_sections.first, assessment: true

    # When only second lesson is lockable, we count non-lockable lessons appropriately
    assert(/^Lesson 1:/.match(unit.lessons[0].localized_title))
    assert(/^Lesson/.match(unit.lessons[1].localized_title).nil?)
    assert(/^Lesson 2:/.match(unit.lessons[2].localized_title))
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
    updated = Unit.update_i18n(original_yml, lessons_i18n)

    assert_equal course3_yml, updated['en']['data']['script']['name']['course3']
    assert_equal course4_yml, updated['en']['data']['script']['name']['course4']
  end

  test "update_i18n with metadata" do
    # In this case, we're modifying a lesson description without changing any
    # lesson names
    original_yml = YAML.load_file(Rails.root.join('test', 'en.yml'))

    # No updates to lesson names
    lessons_i18n = {'en' => {'data' => {'name' => {}}}}

    unit_name = 'Report Unit'

    metadata = {
      'title' => 'Report Unit Name',
      'description' => 'This is what Report Unit is all about',
    }

    updated = Unit.update_i18n(original_yml, lessons_i18n, unit_name, metadata)

    updated_report_unit = updated['en']['data']['script']['name']['Report Unit']

    assert_equal 'Report Unit Name', updated_report_unit['title']
    assert_equal 'This is what Report Unit is all about', updated_report_unit['description']
    assert_equal 'report-lesson-1', updated_report_unit['lessons']['Report Lesson 1']['name']
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
    updated = Unit.update_i18n(original_yml, lessons_i18n)

    assert_equal course3_yml, updated['en']['data']['script']['name']['course3']

    course3_yml = {'lessons' => {'course3' => {'name' => 'course3-changed'}}}

    lessons_i18n = {
      'course3' => course3_yml,
    }

    # updated represents what will get written to scripts.en.yml
    updated = Unit.update_i18n(original_yml, lessons_i18n)

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

  test 'predict free response level is listed in text_response_levels' do
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    level = create :pythonlab, properties: {
      predict_settings: {isPredictLevel: true, questionType: 'freeResponse'}
    }
    create :script_level, script: unit, lesson: lesson, levels: [level]

    assert_equal level, unit.text_response_levels.first[:levels].first
  end

  test 'predict multiple choice level is listed in text_response_levels' do
    unit = create :script
    lesson_group = create :lesson_group, script: unit
    lesson = create :lesson, script: unit, lesson_group: lesson_group
    level = create :pythonlab, properties: {
      predict_settings: {
        isPredictLevel: true,
        questionType: 'multipleChoice',
        multipleChoiceOptions: ['a', 'b', 'c'],
        solution: 'a'
      }
    }
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
    unit.reload
    unit_group.reload

    assert_equal '/courses/csp', unit.course_link
  end

  test 'course_link uses cache' do
    populate_cache_and_disconnect_db
    Unit.stubs(:should_cache?).returns true
    UnitGroup.stubs(:should_cache?).returns true
    unit = Unit.get_from_cache(@unit_in_unit_group.name)
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

  test 'get_feedback_for_section returns feedbacks for students in the section on the script' do
    script = create :script
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, lesson_group: lesson_group, script: script)
    weblab_level = create :weblab
    gamelab_level = create :gamelab
    create(:script_level, lesson: lesson, levels: [weblab_level], script: script)
    create(:script_level, lesson: lesson, levels: [gamelab_level], script: script)

    teacher = create :teacher
    student1 = create :student
    student2 = create :student

    section = create :section, user: teacher
    section.add_student(student1)
    section.add_student(student2)

    feedback1 = create(:teacher_feedback, script: script, level: weblab_level, teacher: teacher, student: student1, comment: "Testing", performance: 'performanceLevel1')
    feedback2 = create(:teacher_feedback, script: script, level: weblab_level, teacher: teacher, student: student2, review_state: TeacherFeedback::REVIEW_STATES.keepWorking)
    create :user_level, user: student2, level: weblab_level, script: script, updated_at: 1.week.from_now
    create(:teacher_feedback, script: script, level: gamelab_level, teacher: teacher, student: student2)

    feedback_for_section = script.get_feedback_for_section(section)

    assert_equal(3, feedback_for_section.keys.length) # expect 3 feedbacks

    # feedback1 assertions
    feedback1_result = feedback_for_section[feedback1.id]
    assert_equal(student1.name, feedback1_result[:studentName])
    assert_equal("Testing", feedback1_result[:comment])
    assert_equal("Extensive Evidence", feedback1_result[:performance])
    assert_equal("Never reviewed", feedback1_result[:reviewStateLabel])

    # feedback2 assertions
    feedback2_result = feedback_for_section[feedback2.id]
    assert_equal("Waiting for review", feedback2_result[:reviewStateLabel])
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

  test 'locale_english_name_map' do
    english_names = Unit.locale_english_name_map
    assert english_names.key?('en-US')
    assert_equal english_names['en-US'], 'English'
    assert english_names.key?('fr-FR')
    assert_equal english_names['fr-FR'], 'French'
  end

  test 'locale_native_name_map' do
    native_names = Unit.locale_native_name_map
    assert native_names.key?('en-US')
    assert_equal native_names['en-US'], 'English'
    assert native_names.key?('fr-FR')
    assert_equal native_names['fr-FR'], 'Français'
  end

  test 'supported_locale_codes' do
    unit = create :script
    assert_equal ['en-US'], unit.supported_locale_codes

    unit.supported_locales = ['en-US']
    assert_equal ['en-US'], unit.supported_locale_codes

    unit.supported_locales = ['fr-FR']
    assert_equal ['en-US', 'fr-FR'], unit.supported_locale_codes

    unit.supported_locales = ['fr-FR', 'ar-SA']
    assert_equal ['ar-SA', 'en-US', 'fr-FR'], unit.supported_locale_codes

    unit.supported_locales = ['en-US', 'fr-FR', 'ar-SA']
    assert_equal ['ar-SA', 'en-US', 'fr-FR'], unit.supported_locale_codes

    unit.supported_locales = ['fr-fr']
    assert_equal ['en-US', 'fr-fr'], unit.supported_locale_codes
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

  test 'section_hidden_unit_info for instructor of pl course' do
    facilitator = create :facilitator
    section1 = create :section, user: facilitator
    assert_equal({}, @pl_unit_in_unit_group.section_hidden_unit_info(facilitator))

    create :section_hidden_script, section: section1, script: @pl_unit_in_unit_group
    assert_equal({section1.id => [@pl_unit_in_unit_group.id]}, @pl_unit_in_unit_group.section_hidden_unit_info(facilitator))

    # other unit has no effect
    other_unit = create :script
    create :section_hidden_script, section: section1, script: other_unit
    assert_equal({section1.id => [@pl_unit_in_unit_group.id]}, @pl_unit_in_unit_group.section_hidden_unit_info(facilitator))

    # other facilitator's sections have no effect
    other_facilitator = create :facilitator
    other_facilitator_section = create :section, user: other_facilitator
    create :section_hidden_script, section: other_facilitator_section, script: @pl_unit_in_unit_group
    assert_equal({section1.id => [@pl_unit_in_unit_group.id]}, @pl_unit_in_unit_group.section_hidden_unit_info(facilitator))

    # other section for same facilitator hidden for same unit appears in list
    section2 = create :section, user: facilitator
    assert_equal({section1.id => [@pl_unit_in_unit_group.id]}, @pl_unit_in_unit_group.section_hidden_unit_info(facilitator))
    create :section_hidden_script, section: section2, script: @pl_unit_in_unit_group
    assert_equal(
      {
        section1.id => [@pl_unit_in_unit_group.id],
        section2.id => [@pl_unit_in_unit_group.id]
      },
      @pl_unit_in_unit_group.section_hidden_unit_info(facilitator)
    )
  end

  test 'section_hidden_unit_info returns empty object for participant of pl course' do
    teacher = create :teacher
    assert_equal({}, @pl_unit_in_unit_group.section_hidden_unit_info(teacher))
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

    refute Unit.has_any_pilot_access?
    refute Unit.has_any_pilot_access?(student)
    refute Unit.has_any_pilot_access?(teacher)
    assert Unit.has_any_pilot_access?(pilot_teacher)
    assert Unit.has_any_pilot_access?(levelbuilder)
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
      Unit.unit_names_by_curriculum_umbrella(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSF)
    )
    assert_equal(
      [@csd_unit.name],
      Unit.unit_names_by_curriculum_umbrella(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSD)
    )
    assert_includes(Unit.unit_names_by_curriculum_umbrella(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSP), @csp_unit.name)
    assert_equal(
      [@csa_unit.name],
      Unit.unit_names_by_curriculum_umbrella(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSA)
    )
    assert_equal(
      [@csc_unit.name],
      Unit.unit_names_by_curriculum_umbrella(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSC)
    )
    assert_includes(Unit.unit_names_by_curriculum_umbrella(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.HOC), @hoc_unit.name)
  end

  test "under_curriculum_umbrella and helpers" do
    assert @csf_unit.under_curriculum_umbrella?(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSF)
    assert @csf_unit.csf?
    assert @csd_unit.under_curriculum_umbrella?(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSD)
    assert @csd_unit.csd?
    assert @csp_unit.under_curriculum_umbrella?(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSP)
    assert @csp_unit.csp?
    assert @csa_unit.under_curriculum_umbrella?(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSA)
    assert @csa_unit.csa?
    assert @csc_unit.under_curriculum_umbrella?(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSC)
    assert @csc_unit.csc?
    assert @hoc_unit.under_curriculum_umbrella?(Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.HOC)
    assert @hoc_unit.hoc?
    refute @csf_unit.hoc?
    refute @csd_unit.hoc?
  end

  test "middle_high?" do
    assert @csd_unit.middle_high?
    assert @csp_unit.middle_high?
    assert @csa_unit.middle_high?

    refute @csf_unit.middle_high?
    refute @csc_unit.middle_high?
    refute @hoc_unit.middle_high?
  end

  test "has_standards_associations?" do
    assert @csf_unit_2019.has_standards_associations?
    refute @csp_unit.has_standards_associations?
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

    unit = create :script, :with_lessons, lessons_count: 1
    section = unit.lessons.first.activity_sections.first
    create :script_level, activity_section: section, levels: [level1]
    create :script_level, activity_section: section, levels: [swap1, swap2]
    create :script_level, activity_section: section, levels: [container]
    create :script_level, activity_section: section, levels: [template_backed_level]
    create :script_level, activity_section: section, levels: [level_group]
    create :script_level, activity_section: section, levels: [bubble_choice]
    create :script_level, activity_section: section, levels: [extra1], bonus: true
    create :script_level, activity_section: section, levels: [extra2], bonus: true

    levels = [level1, swap1, swap2, container,  template_backed_level, level_group, bubble_choice, extra1, extra2]
    nested_levels = [containee, template_level, level_group_sublevels, bubble_choice_sublevels].flatten

    assert_equal levels, unit.levels
    expected_levels = levels + nested_levels
    actual_levels = unit.all_descendant_levels
    assert_equal expected_levels.compact.map(&:name), actual_levels.compact.map(&:name)
    assert_equal expected_levels, actual_levels
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

  test 'next_unit returns next unit if there is another unit in unit group' do
    unit_group = create :unit_group
    unit1 = create :unit
    unit2 = create :unit
    create :unit_group_unit, unit_group: unit_group, script: unit1, position: 1
    create :unit_group_unit, unit_group: unit_group, script: unit2, position: 2
    unit1.reload
    unit2.reload

    student = create :student

    assert_equal unit2, unit1.next_unit(student)
  end

  test 'next_unit returns nil if there is no next unit in unit group' do
    unit1 = create :unit
    unit2 = create :unit
    unit_group = create :unit_group
    create :unit_group_unit, unit_group: unit_group, script: unit1, position: 1
    create :unit_group_unit, unit_group: unit_group, script: unit2, position: 2
    unit1.reload
    unit2.reload

    student = create :student

    assert_nil unit2.next_unit(student)
  end

  test 'next_unit returns nil if not in a unit group' do
    unit1 = create :unit, is_course: true

    student = create :student

    assert_nil unit1.next_unit(student)
  end

  class MigratedScriptCopyTests < ActiveSupport::TestCase
    setup do
      Unit.any_instance.stubs(:write_script_json)
      Unit.stubs(:merge_and_write_i18n)

      @standalone_unit = create :script, is_migrated: true, is_course: true, version_year: '2021', family_name: 'csf', name: 'standalone-2021'
      create :course_version, content_root: @standalone_unit

      @deeper_learning_unit = create :script, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, professional_learning_course: 'DLP 2021'

      @unit_group = create :unit_group
      @ug_course_version = create :course_version, content_root: @unit_group
      create :reference_guide, course_version: @ug_course_version

      @unit_in_course = create :script, is_migrated: true, name: 'coursename1-2021'
      create :unit_group_unit, unit_group: @unit_group, script: @unit_in_course, position: 1
      @unit_group.reload
      @unit_in_course.reload
    end

    test 'can copy a deeper learning unit as another deeper learning unit' do
      lesson_group = create :lesson_group, script: @deeper_learning_unit
      lesson = create :lesson, lesson_group: lesson_group, script: @deeper_learning_unit
      lesson_activity = create :lesson_activity, lesson: lesson
      activity_section = create :activity_section, lesson_activity: lesson_activity

      level1 = create :level, name: 'level1-2021'
      level2 = create :level, name: 'level2-2021'
      create :script_level, levels: [level1], script: @deeper_learning_unit, lesson: lesson, activity_section: activity_section, activity_section_position: 1
      create :script_level, levels: [level2], script: @deeper_learning_unit, lesson: lesson, activity_section: activity_section, activity_section_position: 2

      cloned_unit = @deeper_learning_unit.clone_migrated_unit('dlp-2022', destination_professional_learning_course: 'Deeper Learning 2022', new_level_suffix: '2022')
      assert_equal 'dlp-2022', cloned_unit.name
      assert_equal 'Deeper Learning 2022', cloned_unit.professional_learning_course
      assert_equal cloned_unit.instruction_type, @deeper_learning_unit.instruction_type
      assert_equal cloned_unit.instructor_audience, @deeper_learning_unit.instructor_audience
      assert_equal cloned_unit.participant_audience, @deeper_learning_unit.participant_audience
      refute_equal [level1, level2], cloned_unit.levels
    end

    test 'can copy a standalone unit as another standalone unit' do
      cloned_unit = @standalone_unit.clone_migrated_unit('standalone-2022', version_year: '2022', family_name: 'csf')
      assert_equal 'standalone-2022', cloned_unit.name
      assert_equal '2022', cloned_unit.version_year
      assert_equal cloned_unit.published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
      assert_equal cloned_unit.instruction_type, @standalone_unit.instruction_type
      assert_equal cloned_unit.instructor_audience, @standalone_unit.instructor_audience
      assert_equal cloned_unit.participant_audience, @standalone_unit.participant_audience
    end

    test 'can update markdown on clone' do
      old_course_offering = create :course_offering, key: 'familya'
      old_course_version = create :course_version, course_offering: old_course_offering, key: '2000'
      resource = create :resource, course_version: old_course_version, name: 'resource', url: 'code.org'
      vocab = create :vocabulary, course_version: old_course_version, word: 'word', definition: 'definition'
      new_course_offering = create :course_offering, key: 'familyb'
      new_course_version = create :course_version, course_offering: new_course_offering, key: '2001'
      test_locale = :en
      I18n.locale = test_locale
      mock_i18n = {
        'data' => {
          'script' => {
            'name' => {
              @standalone_unit.name => {
                'description_short' => "Description short: Resource: [r #{resource.key}/familya/2000]. Vocab: [v #{vocab.key}/familya/2000].",
                'description_audience' => "Description audience: Resource: [r #{resource.key}/familya/2000]. Vocab: [v #{vocab.key}/familya/2000].",
                'description' => "Description: Resource: [r #{resource.key}/familya/2000]. Vocab: [v #{vocab.key}/familya/2000].",
                'student_description' => "Student description: Resource: [r #{resource.key}/familya/2000]. Vocab: [v #{vocab.key}/familya/2000].",
              }
            }
          }
        }
      }
      I18n.backend.store_translations test_locale, mock_i18n
      copied_resource = resource.copy_to_course_version(new_course_version)
      copied_vocab = vocab.copy_to_course_version(new_course_version)
      expected_i18n = {
        'en' => {
          'data' => {
            'script' => {
              'name' => {
                'new_name' => {
                  'title' => '',
                  'description_short' => "Description short: Resource: [r #{copied_resource.key}/familyb/2001]. Vocab: [v #{copied_vocab.key}/familyb/2001].",
                  'description_audience' => "Description audience: Resource: [r #{copied_resource.key}/familyb/2001]. Vocab: [v #{copied_vocab.key}/familyb/2001].",
                  'description' => "Description: Resource: [r #{copied_resource.key}/familyb/2001]. Vocab: [v #{copied_vocab.key}/familyb/2001].",
                  'student_description' => "Student description: Resource: [r #{copied_resource.key}/familyb/2001]. Vocab: [v #{copied_vocab.key}/familyb/2001]."
                }
              }
            }
          }
        }
      }
      new_i18n = @standalone_unit.summarize_i18n_for_copy('new_name', new_course_version)
      assert_equal expected_i18n, new_i18n
    end

    test 'can copy a standalone unit into a unit group' do
      Rails.application.config.stubs(:levelbuilder_mode).returns true
      UnitGroup.any_instance.expects(:write_serialization).once
      File.stubs(:write)
      cloned_unit = @standalone_unit.clone_migrated_unit('coursename2-2021', destination_unit_group_name: @unit_group.name)
      assert_equal 2, @unit_group.default_units.count
      assert_equal 'coursename2-2021', @unit_group.default_units[1].name
      assert_equal cloned_unit.unit_group, @unit_group
      assert_nil cloned_unit.published_state
      assert_nil cloned_unit.instruction_type
      assert_nil cloned_unit.instructor_audience
      assert_nil cloned_unit.participant_audience
    end

    test 'can copy a unit in a unit group to a standalone unit' do
      cloned_unit = @unit_in_course.clone_migrated_unit('standalone-coursename-2021', version_year: '2021', family_name: 'csf')
      assert_nil cloned_unit.unit_group
      assert_equal 'standalone-coursename-2021', cloned_unit.name
      assert_equal cloned_unit.published_state, Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
      assert_equal cloned_unit.instruction_type, @unit_group.instruction_type
      assert_equal cloned_unit.instructor_audience, @unit_group.instructor_audience
      assert_equal cloned_unit.participant_audience, @unit_group.participant_audience
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

      level1 = create :level, name: 'level1-2021'
      level2 = create :level, name: 'level2-2021'
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

    test 'can copy reference guides when cloning unit in unit group' do
      Rails.application.config.stubs(:levelbuilder_mode).returns true
      ReferenceGuide.any_instance.expects(:write_serialization).once
      File.stubs(:write)
      cloned_unit = @unit_in_course.clone_migrated_unit('refguidetest-ug-coursename-2021', destination_unit_group_name: @unit_group.name)
      assert_equal cloned_unit.unit_group, @unit_group
      assert_equal 1, cloned_unit.get_course_version.reference_guides.count
    end

    test 'can copy reference guides when cloning unit from unit group to stand alone' do
      Rails.application.config.stubs(:levelbuilder_mode).returns true
      ReferenceGuide.any_instance.expects(:write_serialization).once
      File.stubs(:write)
      cloned_unit = @unit_in_course.clone_migrated_unit('refguidetest-ugsa-coursename-2021', version_year: '2021', family_name: 'csf')
      assert_equal 1, cloned_unit.get_course_version.reference_guides.count
    end

    test 'can copy reference guides when cloning stand alone' do
      Rails.application.config.stubs(:levelbuilder_mode).returns true
      ReferenceGuide.any_instance.expects(:write_serialization).once
      File.stubs(:write)
      @standalone_unit.course_version.reference_guides = [create(:reference_guide)]

      cloned_unit = @standalone_unit.clone_migrated_unit('refguidetest-sa-coursename-2022', version_year: '2022', family_name: 'csf')
      assert_equal 1, cloned_unit.get_course_version.reference_guides.count
    end

    test 'can copy a script without a course version' do
      source_unit = create :script, is_course: true, is_migrated: true
      lesson = create :lesson, script: source_unit
      create :lesson_group, script: source_unit, lessons: [lesson]

      cloned_unit = source_unit.clone_migrated_unit('cloned-unit', family_name: 'family-name', version_year: 'unversioned')
      assert_equal 1, cloned_unit.lesson_groups.count
      assert_equal 1, cloned_unit.lessons.count
      refute_nil cloned_unit.get_course_version
    end

    test 'clone raises exception if deeper learning course is being copied to a non-deeper learning course' do
      raise = assert_raises do
        @deeper_learning_unit.clone_migrated_unit('my-name')
      end
      assert_equal 'Deeper learning courses must be copied to be new deeper learning courses. Include destination_professional_learning_course to set the professional learning course.', raise.message
    end

    test 'clone raises exception if provide both destination unit group and deeper learning course' do
      raise = assert_raises do
        @deeper_learning_unit.clone_migrated_unit('my-name', destination_professional_learning_course: 'DLP', destination_unit_group_name: 'my-ug')
      end
      assert_equal 'Can not have both a destination unit group and a destination professional learning course.', raise.message
    end

    test 'clone raises exception if script name has already been taken' do
      create :script, name: 'my-name'
      raise = assert_raises do
        @standalone_unit.clone_migrated_unit('my-name', version_year: '2022')
      end
      assert_equal 'Unit name has already been taken', raise.message
    end

    test 'clone raises exception if destination_unit_group does not have a course version' do
      versionless_unit_group = create :unit_group
      assert_nil versionless_unit_group.course_version
      assert_raises do
        @standalone_unit.clone_migrated_unit('coursename2-2021', destination_unit_group_name: versionless_unit_group.name)
      end
    end

    test 'clone raises exception if cloning as standalone without family name or version year' do
      assert_raises do
        @standalone_unit.clone_migrated_unit('standalone-2022', version_year: '2022')
      end
      assert_raises do
        @standalone_unit.clone_migrated_unit('standalone-2022', family_name: 'standalone')
      end
    end
  end

  test 'should raise error if deeper learning course is being launched' do
    unit = create(:standalone_unit, professional_learning_course: 'my-deeper-learning-course')
    error = assert_raises do
      unit.published_state = 'stable'
      unit.save!
    end

    assert_includes error.message, 'Validation failed: Published state can never be pilot, preview or stable for a deeper learning course.'
  end

  test 'should raise error if participant audience is nil for standalone unit' do
    unit = create(:standalone_unit)
    error = assert_raises do
      unit.participant_audience = nil
      unit.save!
    end

    assert_includes error.message, 'Participant audience must be set on the unit if its a standalone unit.'
  end

  test 'should raise error if instructor audience is nil for standalone unit' do
    unit = create(:standalone_unit)
    error = assert_raises do
      unit.instructor_audience = nil
      unit.save!
    end

    assert_includes error.message, 'Instructor audience must be set on the unit if its a standalone unit.'
  end

  test 'should raise error if published state is nil for standalone unit' do
    unit = create(:standalone_unit)
    error = assert_raises do
      unit.published_state = nil
      unit.save!
    end

    assert_includes error.message, 'Published state must be set on the unit if its a standalone unit.'
  end

  test 'should raise error if instruction type is nil for standalone unit' do
    unit = create(:standalone_unit)
    error = assert_raises do
      unit.instruction_type = nil
      unit.save!
    end

    assert_includes error.message, 'Instruction type must be set on the unit if its a standalone unit.'
  end

  test 'finish_url returns unit group finish url if in a unit group' do
    unit_group = create :unit_group
    unit = create :script
    create :unit_group_unit, unit_group: unit_group, script: unit, position: 1
    unit.reload

    assert unit.finish_url.include?(unit_group.name)
  end

  test 'finish_url returns unit finish url if not in a unit group' do
    unit = create :script, is_course: true
    assert unit.finish_url.include?(unit.name)
  end

  test 'deleting standalone unit deletes corresponding dependencies' do
    standalone_unit = create :script, is_migrated: true, is_course: true, version_year: '2021', family_name: 'csf', name: 'standalone-2021'
    course_version = create :course_version, content_root: standalone_unit
    CourseOffering.add_course_offering(standalone_unit)
    lesson = create :lesson, script: standalone_unit
    lesson_gp = create :lesson_group, script: standalone_unit, lessons: [lesson]

    # delete standalone unit
    unit_id = standalone_unit.id
    standalone_unit.destroy

    assert Unit.find_by(id: unit_id).nil?
    assert CourseVersion.find_by(id: course_version.id).nil?
    assert Lesson.find_by(id: lesson.id).nil?
    assert LessonGroup.find_by(id: lesson_gp.id).nil?
  end

  test 'deleting unit in unit group deletes corresponding dependencies' do
    unit_in_course = create :script, is_migrated: true, name: 'coursename1-2021'
    unit_group = create(:unit_group)
    unit_gp_unit = create :unit_group_unit, unit_group: @unit_group, script: unit_in_course, position: 1
    CourseOffering.add_course_offering(unit_group)

    unit_group.reload
    unit_in_course.reload
    course_version = unit_group.course_version
    assert UnitGroupUnit.find_by(id: unit_gp_unit.id)

    # delete unit in unit group
    unit_id = unit_in_course.id
    unit_in_course.destroy

    assert Unit.find_by(id: unit_id).nil?
    assert UnitGroup.find_by(id: unit_group.id)

    # Course version is associated to unit group and shouldn't be deleted
    assert CourseVersion.find_by(id: course_version.id)
    assert UnitGroupUnit.find_by(id: unit_gp_unit.id).nil?
  end

  test 'deleting unit in unit group updates course json' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    unit_in_course = create :script, is_migrated: true, name: 'coursename1-2021'
    unit_group = create(:unit_group)
    unit_gp_unit = create :unit_group_unit, unit_group: @unit_group, script: unit_in_course, position: 1
    CourseOffering.add_course_offering(unit_group)

    File.stubs(:write)
    UnitGroup.any_instance.expects(:write_serialization).once

    unit_group.reload
    unit_in_course.reload
    assert UnitGroupUnit.find_by(id: unit_gp_unit.id)

    # delete unit in unit group
    unit_id = unit_in_course.id
    unit_in_course.destroy

    assert Unit.find_by(id: unit_id).nil?
    assert UnitGroupUnit.find_by(id: unit_gp_unit.id).nil?
  end

  private def has_unlaunched_unit?(units)
    units.any? {|u| !u.launched?}
  end
end
