require 'test_helper'

class CourseOfferingTest < ActiveSupport::TestCase
  setup_all do
    @student = create(:student)
    @teacher = create(:teacher)
    @facilitator = create(:facilitator)
    @universal_instructor = create(:universal_instructor)
    @plc_reviewer = create(:plc_reviewer)
    @levelbuilder = create(:levelbuilder)

    Rails.application.config.stubs(:levelbuilder_mode).returns false

    @unit_teacher_to_students = create(:script, name: 'unit-teacher-to-student2')
    create(:single_unit_course, :with_course_offering, unit: @unit_teacher_to_students, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '1991', family_name: 'family-2')
    @unit_teacher_to_students2 = create(:script, name: 'unit-teacher-to-student3')
    create(:single_unit_course, :with_course_offering, unit: @unit_teacher_to_students2, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '1992', family_name: 'family-2')
    @unit_facilitator_to_teacher = create(:script, name: 'unit-facilitator-to-teacher2')
    create(:single_unit_course, :pl_course, :with_course_offering, unit: @unit_facilitator_to_teacher, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '1991', family_name: 'family-3')

    @beta_unit = create(:script, name: 'beta-unit')
    create(:single_unit_course, :with_course_offering, unit: @beta_unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, version_year: '1991', family_name: 'beta')

    @in_development_unit = create(:script, name: 'in-development-unit2')
    create(:single_unit_course, :with_course_offering, unit: @in_development_unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development, version_year: '1991', family_name: 'development')
  end

  setup do
    @unit_group = create(:unit_group, name: 'course-instructed-by-teacher2', family_name: 'family-1', version_year: '1991', published_state: 'stable')
    @unit_in_course = create(:script, name: 'unit-in-teacher-instructed-course2', instructor_audience: nil, participant_audience: nil, instruction_type: nil, published_state: nil)
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @unit_in_course.reload
    @unit_group.reload
    CourseOffering.add_course_offering(@unit_group)

    @pilot_teacher = create(:teacher, pilot_experiment: 'my-experiment')
    @pilot_unit = create(:single_unit_course, :with_course_offering, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot, version_year: '1991', family_name: 'family-4', pilot_experiment: 'my-experiment').first_unit

    @pilot_instructor = create(:facilitator, pilot_experiment: 'my-pl-experiment')
    @pilot_pl_unit = create(:single_unit_course, :with_course_offering, :pl_course, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot, version_year: '1991', family_name: 'family-5', pilot_experiment: 'my-pl-experiment').first_unit

    @partner = create(:teacher, pilot_experiment: 'my-editor-experiment', editor_experiment: 'ed-experiment')
    @partner_unit = create(:script, editor_experiment: 'ed-experiment')
    create(:single_unit_course, :with_course_offering, unit: @partner_unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot, version_year: '1991', family_name: 'family-11', pilot_experiment: 'my-editor-experiment')
  end

  test "course offering associations" do
    course_offering = create(:course_offering)
    version1 = create(:course_version, course_offering: course_offering)
    version2 = create(:course_version, course_offering: course_offering)

    assert_equal [version1, version2].sort_by(&:key), course_offering.course_versions.sort_by(&:key)
    assert_equal course_offering, version1.course_offering
    assert_equal course_offering, version2.course_offering
  end

  test "add_course_offering creates CourseOffering and CourseVersion for UnitGroup" do
    family_name = 'csz'
    version_year = '2050'
    content_root = create(:unit_group, family_name: family_name, version_year: version_year)

    offering = CourseOffering.add_course_offering(content_root)

    assert_equal offering.key, family_name
    assert_equal offering.display_name, family_name
    assert_equal offering, CourseOffering.find_by(key: family_name)
    assert_equal offering.course_versions, [CourseVersion.find_by(course_offering: offering, key: version_year)]
  end

  test "add_course_offering updates existing CourseOffering and CourseVersion for UnitGroup" do
    offering = course_offering_with_versions(1)
    content_root = offering.course_versions.first.content_root
    old_offering_key = offering.key
    old_version_year = offering.course_versions.first.key

    content_root.update!(family_name: 'csz', version_year: '2050')
    CourseOffering.add_course_offering(content_root)
    content_root.reload

    assert_equal content_root.version_year, content_root.course_version.key
    assert_equal content_root.family_name, content_root.course_version.course_offering.key
    assert_nil CourseVersion.find_by(course_offering: offering, key: old_version_year) # old CourseVersion should be deleted
    assert_nil CourseOffering.find_by(key: old_offering_key) # old CourseOffering should be deleted
  end

  test "add_course_offering updates existing CourseOffering with multiple CourseVersion for UnitGroup" do
    offering = course_offering_with_versions(2)
    content_root = offering.course_versions.first.content_root
    old_offering_key = offering.key
    old_version_year = offering.course_versions.first.key

    content_root.update!(family_name: 'csz', version_year: '2050')
    CourseOffering.add_course_offering(content_root)
    content_root.reload

    assert_equal content_root.version_year, content_root.course_version.key
    assert_equal content_root.family_name, content_root.course_version.course_offering.key
    assert_nil CourseVersion.find_by(course_offering: offering, key: old_version_year) # old CourseVersion should be deleted
    assert_equal 1, CourseOffering.find_by(key: old_offering_key).course_versions.length # old CourseOffering should have 1 version left
  end

  test "throws exception if removing course version of course that prevent course version change" do
    course = create(:unit_group, family_name: 'family', version_year: '2000')
    CourseOffering.add_course_offering(course)

    course.family_name = nil
    course.save!
    course.reload
    script = create(:script)
    create(:unit_group_unit, unit_group: course, script: script, position: 1)
    script.reload
    script.resources = [create(:resource)]
    assert course.prevent_course_version_change?

    assert_raises do
      CourseOffering.add_course_offering(course)
    end
  end

  test "enforces key format" do
    course_offering = build(:course_offering, key: 'invalid key')
    refute course_offering.valid?
    course_offering.key = '0123456789abcdefghijklmnopqrstuvwxyz-'
    assert course_offering.valid?
  end

  test "latest_published_version returns most recent published course version with unit group if no locale specified" do
    offering = create(:course_offering, :with_unit_groups)

    most_recent_version = offering.course_versions[2]
    most_recent_version.update!(key: '2021')
    most_recent_version.content_root.update!(published_state: 'beta')

    preview_version = offering.course_versions[0]
    preview_version.update!(key: '2019')
    preview_version.content_root.update!(published_state: 'preview')

    most_recent_published_version = offering.course_versions[1]
    most_recent_published_version.update!(key: '2020')
    most_recent_published_version.content_root.update!(published_state: 'preview')

    stable_version = offering.course_versions[3]
    stable_version.update!(key: '2018')
    stable_version.content_root.update!(published_state: 'stable')

    assert_equal offering.latest_published_version, most_recent_published_version
  end

  test "latest_published_version returns most recent published course version with unit group if locale in English" do
    ug_2050 = create(:unit_group, family_name: 'ug', version_year: '2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    ug_2050_unit = create(:script, name: 'ug1-2050', supported_locales: ['fake-locale'])
    create(:unit_group_unit, unit_group: ug_2050, script: ug_2050_unit, position: 1)
    CourseOffering.add_course_offering(ug_2050)

    ug_2051 = create(:unit_group, family_name: 'ug', version_year: '2051', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    ug_2051_unit = create(:script, name: 'ug1-2051', supported_locales: [])
    create(:unit_group_unit, unit_group: ug_2051, script: ug_2051_unit, position: 1)
    offering = CourseOffering.add_course_offering(ug_2051)

    assert_equal offering.latest_published_version('en-us'), ug_2051.course_version
  end

  test "latest_published_version returns most recent published course version with single-unit course if locale in English" do
    script = create(:script, supported_locales: ['fake-locale'])
    create(:single_unit_course, :with_course_offering, unit: script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '2050', family_name: 'ss')

    script2 = create(:script, supported_locales: [])
    create(:single_unit_course, unit: script2, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '2051', family_name: 'ss')
    offering = CourseOffering.add_course_offering(script2.original_unit_group)

    assert_equal offering.latest_published_version('en-us'), script2.get_course_version
  end

  test "latest_published_version returns most recent published course version with unit group if no stable versions" do
    ug_2050 = create(:unit_group, family_name: 'ug', version_year: '2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)
    ug_2050_unit = create(:script, name: 'ug1-2050', supported_locales: ['fake-locale'])
    create(:unit_group_unit, unit_group: ug_2050, script: ug_2050_unit, position: 1)
    CourseOffering.add_course_offering(ug_2050)

    ug_2051 = create(:unit_group, family_name: 'ug', version_year: '2051', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)
    ug_2051_unit = create(:script, name: 'ug1-2051', supported_locales: [''])
    create(:unit_group_unit, unit_group: ug_2051, script: ug_2051_unit, position: 1)
    offering = CourseOffering.add_course_offering(ug_2051)

    assert_equal offering.latest_published_version('fake-locale'), ug_2051.course_version
  end

  test "latest_published_version returns most recent published course version with unit if no stable versions" do
    script = create(:script, supported_locales: ['fake-locale'])
    create(:single_unit_course, :with_course_offering, unit: script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview, version_year: '2050', family_name: 'ss')

    script2 = create(:script, supported_locales: [])
    create(:single_unit_course, unit: script2, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview, version_year: '2051', family_name: 'ss')
    offering = CourseOffering.add_course_offering(script2.original_unit_group)

    assert_equal offering.latest_published_version('fake-locale'), script2.get_course_version
  end

  test "latest_published_version returns most recent published course version with unit group if given locale not supported" do
    ug_2050 = create(:unit_group, family_name: 'ug', version_year: '2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    ug_2050_unit = create(:script, name: 'ug1-2050', supported_locales: ['fake-locale'])
    create(:unit_group_unit, unit_group: ug_2050, script: ug_2050_unit, position: 1)
    CourseOffering.add_course_offering(ug_2050)

    ug_2051 = create(:unit_group, family_name: 'ug', version_year: '2051', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    ug_2051_unit = create(:script, name: 'ug1-2051', supported_locales: ['fake-locale'])
    create(:unit_group_unit, unit_group: ug_2051, script: ug_2051_unit, position: 1)
    offering = CourseOffering.add_course_offering(ug_2051)

    assert_equal offering.latest_published_version('invalid-locale'), ug_2051.course_version
  end

  test "latest_published_version returns most recent published course version with single-unit course if given locale not supported" do
    script = create(:script, supported_locales: ['fake-locale'])
    create(
      :single_unit_course,
      :with_course_offering,
      unit: script,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable,
      version_year: '2050',
      family_name: 'ss'
    )

    script2 = create(:script, supported_locales: ['fake-locale'])
    create(
      :single_unit_course,
      unit: script2,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable,
      version_year: '2051',
      family_name: 'ss'
    )
    offering = CourseOffering.add_course_offering(script2.original_unit_group)

    assert_equal offering.latest_published_version('invalid-locale'), script2.get_course_version
  end

  test "latest_published_version returns latest stable course version with stable unit group if given locale supported" do
    ug_2050 = create(:unit_group, family_name: 'ug', version_year: '2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    ug_2050_unit = create(:script, name: 'ug1-2050', supported_locales: ['fake-locale', 'second-fake-locale'])
    create(:unit_group_unit, unit_group: ug_2050, script: ug_2050_unit, position: 1)
    CourseOffering.add_course_offering(ug_2050)

    ug_2051 = create(:unit_group, family_name: 'ug', version_year: '2051', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    ug_2051_unit = create(:script, name: 'ug1-2051', supported_locales: ['fake-locale'])
    create(:unit_group_unit, unit_group: ug_2051, script: ug_2051_unit, position: 1)
    CourseOffering.add_course_offering(ug_2051)

    ug_2052 = create(:unit_group, family_name: 'ug', version_year: '2052', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)
    ug_2052_unit = create(:script, name: 'ug1-2052', supported_locales: ['fake-locale'])
    create(:unit_group_unit, unit_group: ug_2052, script: ug_2052_unit, position: 1)
    offering = CourseOffering.add_course_offering(ug_2052)

    assert_equal offering.latest_published_version('fake-locale'), ug_2051.course_version
    assert_equal offering.latest_published_version('second-fake-locale'), ug_2050.course_version
    assert_equal offering.latest_published_version('invalid-locale'), ug_2052.course_version
  end

  test "latest_published_version returns latest stable course version with stable unit if given locale supported" do
    script = create(:script, supported_locales: ['fake-locale', 'second-fake-locale'])
    create(:single_unit_course, :with_course_offering, unit: script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '2050', family_name: 'ss')
    script2 = create(:script, supported_locales: ['fake-locale'])
    create(:single_unit_course, :with_course_offering, unit: script2, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '2051', family_name: 'ss')
    script3 = create(:script, supported_locales: ['fake-locale'])
    create(:single_unit_course, unit: script3, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview, version_year: '2052', family_name: 'ss')
    offering = CourseOffering.add_course_offering(script3.original_unit_group)

    assert_equal offering.latest_published_version('fake-locale'), script2.get_course_version
    assert_equal offering.latest_published_version('second-fake-locale'), script.get_course_version
    assert_equal offering.latest_published_version('invalid-locale'), script3.get_course_version
  end

  test 'any_version_is_assignable_pilot? is true if user has pilot access to any course versions' do
    unit_tts_co = @unit_teacher_to_students.get_course_version.course_offering
    unit_ftt_co = @unit_facilitator_to_teacher.get_course_version.course_offering
    pilot_unit_co = @pilot_unit.get_course_version.course_offering
    pilot_pl_unit_co = @pilot_pl_unit.get_course_version.course_offering

    refute unit_tts_co.any_version_is_assignable_pilot?(@student)
    refute unit_tts_co.any_version_is_assignable_pilot?(@teacher)
    refute unit_tts_co.any_version_is_assignable_pilot?(@pilot_teacher)
    refute unit_tts_co.any_version_is_assignable_pilot?(@pilot_instructor)
    refute unit_tts_co.any_version_is_assignable_pilot?(@levelbuilder)

    refute unit_ftt_co.any_version_is_assignable_pilot?(@student)
    refute unit_ftt_co.any_version_is_assignable_pilot?(@teacher)
    refute unit_ftt_co.any_version_is_assignable_pilot?(@pilot_teacher)
    refute unit_ftt_co.any_version_is_assignable_pilot?(@pilot_instructor)
    refute unit_ftt_co.any_version_is_assignable_pilot?(@levelbuilder)

    refute pilot_unit_co.any_version_is_assignable_pilot?(@student)
    refute pilot_unit_co.any_version_is_assignable_pilot?(@teacher)
    assert pilot_unit_co.any_version_is_assignable_pilot?(@pilot_teacher)
    refute pilot_unit_co.any_version_is_assignable_pilot?(@pilot_instructor)
    refute pilot_unit_co.any_version_is_assignable_pilot?(@levelbuilder)

    refute pilot_pl_unit_co.any_version_is_assignable_pilot?(@student)
    refute pilot_pl_unit_co.any_version_is_assignable_pilot?(@teacher)
    refute pilot_pl_unit_co.any_version_is_assignable_pilot?(@pilot_teacher)
    assert pilot_pl_unit_co.any_version_is_assignable_pilot?(@pilot_instructor)
    refute pilot_pl_unit_co.any_version_is_assignable_pilot?(@levelbuilder)
  end

  test 'any_version_is_assignable_editor_experiment? is true if user has pilot access to any course versions' do
    pilot_unit_co = @pilot_unit.get_course_version.course_offering
    partner_unit_co = @partner_unit.get_course_version.course_offering

    refute pilot_unit_co.any_version_is_assignable_editor_experiment?(@student)
    refute pilot_unit_co.any_version_is_assignable_editor_experiment?(@teacher)
    refute pilot_unit_co.any_version_is_assignable_editor_experiment?(@pilot_teacher)
    refute pilot_unit_co.any_version_is_assignable_editor_experiment?(@pilot_instructor)
    refute pilot_unit_co.any_version_is_assignable_editor_experiment?(@levelbuilder)
    refute pilot_unit_co.any_version_is_assignable_editor_experiment?(@partner)

    refute partner_unit_co.any_version_is_assignable_editor_experiment?(@student)
    refute partner_unit_co.any_version_is_assignable_editor_experiment?(@teacher)
    refute partner_unit_co.any_version_is_assignable_editor_experiment?(@pilot_teacher)
    refute partner_unit_co.any_version_is_assignable_editor_experiment?(@pilot_instructor)
    refute partner_unit_co.any_version_is_assignable_editor_experiment?(@levelbuilder)
    refute partner_unit_co.any_version_is_assignable_editor_experiment?(@partner)
  end

  test 'can_be_instructor? is true if user can be instructor of any course version' do
    unit_tts_co = @unit_teacher_to_students.get_course_version.course_offering
    unit_ftt_co = @unit_facilitator_to_teacher.get_course_version.course_offering

    refute unit_tts_co.can_be_instructor?(@student)
    assert unit_tts_co.can_be_instructor?(@teacher)

    refute unit_ftt_co.can_be_instructor?(@student)
    refute unit_ftt_co.can_be_instructor?(@teacher)
    assert unit_ftt_co.can_be_instructor?(@facilitator)
  end

  test 'any_versions_launched? is true if any course versions have been launched' do
    unit1 = create(:single_unit_course, :with_course_offering, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '1991', family_name: 'family-6').first_unit
    create(:single_unit_course, :with_course_offering, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, version_year: '1992', family_name: 'family-6')

    assert unit1.get_course_version.course_offering.any_versions_launched?
  end

  test 'any_versions_launched? is false if none of the course versions have been launched' do
    unit1 = create(:single_unit_course, :with_course_offering, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, version_year: '1991', family_name: 'family-7').first_unit
    create(:single_unit_course, :with_course_offering, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, version_year: '1992', family_name: 'family-7')

    refute unit1.get_course_version.course_offering.any_versions_launched?
  end

  test 'any_versions_in_development? is true if any course versions are in development' do
    unit1 = create(:single_unit_course, :with_course_offering, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '1991', family_name: 'family-8').first_unit
    create(:single_unit_course, :with_course_offering, family_name: 'family-8', version_year: '1992', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development)

    assert unit1.get_course_version.course_offering.any_versions_in_development?
  end

  test 'any_versions_in_development? is false if none of the course versions are in development' do
    unit1 = create(:single_unit_course, :with_course_offering, family_name: 'family-9', version_year: '1991', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta).first_unit
    create(:single_unit_course, :with_course_offering, family_name: 'family-9', version_year: '1992', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)

    refute unit1.get_course_version.course_offering.any_versions_in_development?
  end

  test 'any_version_is_in_published_state? is false if none of the course versions have a published_state of preview or stable' do
    unit1 = create(:single_unit_course, :with_course_offering, family_name: 'family-10', version_year: '1991', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta).first_unit
    create(:single_unit_course, :with_course_offering, family_name: 'family-10', version_year: '1992', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)

    refute unit1.get_course_version.course_offering.any_version_is_in_published_state?
  end

  test 'any_version_is_in_published_state? is true if one of the course versions have a published_state of preview or stable' do
    unit1 = create(:single_unit_course, :with_course_offering, family_name: 'family-12', version_year: '1991', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta).first_unit
    create(:single_unit_course, :with_course_offering, family_name: 'family-12', version_year: '1992', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)

    assert unit1.get_course_version.course_offering.any_version_is_in_published_state?
  end

  test 'any_version_is_in_published_state? is true if all of the course versions have a published_state of preview or stable' do
    unit1 = create(:single_unit_course, :with_course_offering, family_name: 'family-13', version_year: '1991', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable).first_unit
    create(:single_unit_course, :with_course_offering, family_name: 'family-13', version_year: '1992', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview)

    assert unit1.get_course_version.course_offering.any_version_is_in_published_state?
  end

  test 'assignable_published_for_students_course_offerings filters only for assignable, published, and for student course offerings' do
    # Course offering that doesn't satisfy any of the conditions
    none_course = create(:single_unit_course, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development, version_year: '1991', family_name: 'none', instructor_audience: 'universal_instructor', participant_audience: 'teacher')
    none_co = CourseOffering.add_course_offering(none_course)
    none_co.update!(assignable: false)

    # Course offering that only satisfies the 'assignable' condition
    assignable_course = create(:single_unit_course, family_name: 'assignable', version_year: '1992', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development, instructor_audience: 'universal_instructor', participant_audience: 'teacher')
    assignable_co = CourseOffering.add_course_offering(assignable_course)

    # Course offering that only satisfies the 'published' condition
    published_course = create(:single_unit_course, family_name: 'published', version_year: '1993', published_state: 'stable', instructor_audience: 'universal_instructor', participant_audience: 'teacher')
    published_co = CourseOffering.add_course_offering(published_course)
    published_co.update!(assignable: false)

    # Course offering that only satisfies the 'for student' condition
    for_student_course = create(:single_unit_course, family_name: 'for-student', version_year: '1994', published_state: 'in_development', instructor_audience: 'universal_instructor', participant_audience: 'student')
    for_student_co = CourseOffering.add_course_offering(for_student_course)
    for_student_co.update!(assignable: false)

    # Course offering that only satisfies the 'assignable' and 'published' condition
    assignable_published_course = create(:single_unit_course, family_name: 'assignable-published', version_year: '1995', published_state: 'stable', instructor_audience: 'universal_instructor', participant_audience: 'teacher')
    assignable_published_co = CourseOffering.add_course_offering(assignable_published_course)

    # Course offering that only satisfies the 'assignable' and 'for student' condition
    assignable_for_student_course = create(:single_unit_course, family_name: 'assignable-for-student', version_year: '1996', published_state: 'in_development', instructor_audience: 'universal_instructor', participant_audience: 'student')
    assignable_for_student_co = CourseOffering.add_course_offering(assignable_for_student_course)

    # Course offering that only satisfies the 'published' and 'for student' condition
    published_for_student_course = create(:single_unit_course, family_name: 'published-for-student', version_year: '1997', published_state: 'stable', instructor_audience: 'universal_instructor', participant_audience: 'student')
    published_for_student_co = CourseOffering.add_course_offering(published_for_student_course)
    published_for_student_co.update!(assignable: false)

    # Course offering that satisfies all 3 conditions
    all_course = create(:single_unit_course, family_name: 'all', version_year: '1998', published_state: 'stable', instructor_audience: 'universal_instructor', participant_audience: 'student')
    all_co = CourseOffering.add_course_offering(all_course)

    filtered_course_offerings = CourseOffering.assignable_published_for_students_course_offerings

    refute_includes(filtered_course_offerings, none_co)
    refute_includes(filtered_course_offerings, assignable_co)
    refute_includes(filtered_course_offerings, published_co)
    refute_includes(filtered_course_offerings, for_student_co)
    refute_includes(filtered_course_offerings, assignable_published_co)
    refute_includes(filtered_course_offerings, assignable_for_student_co)
    refute_includes(filtered_course_offerings, published_for_student_co)
    assert_includes(filtered_course_offerings, all_co)
  end

  test 'self_paced_course_offerings_for_catalog filters only for assignable published self-paced teacher course offerings' do
    # Course offering that doesn't satisfy any of the conditions
    none_course = create(
      :single_unit_course,
      family_name: 'none',
      version_year: '1991',
      published_state: 'in_development',
      instructor_audience: 'universal_instructor',
      participant_audience: 'student'
    )
    none_co = CourseOffering.add_course_offering(none_course)
    none_co.update!(assignable: false)

    # Course offering that only satisfies the 'assignable' condition
    assignable_course = create(
      :single_unit_course,
      family_name: 'assignable',
      version_year: '1992',
      published_state: 'in_development',
      instructor_audience: 'universal_instructor',
      participant_audience: 'student'
    )
    CourseOffering.add_course_offering(assignable_course)

    # Course offering that only satisfies the 'published' condition
    published_course = create(
      :single_unit_course,
      family_name: 'published',
      version_year: '1993',
      published_state: 'stable',
      instructor_audience: 'universal_instructor',
      participant_audience: 'student'
    )
    published_co = CourseOffering.add_course_offering(published_course)
    published_co.update!(assignable: false)

    # Course offering that only satisfies the 'for teacher' condition
    for_teacher_course = create(
      :single_unit_course,
      family_name: 'for-teacher',
      version_year: '1994',
      published_state: 'in_development',
      instructor_audience: 'universal_instructor',
      participant_audience: 'teacher'
    )
    for_teacher_co = CourseOffering.add_course_offering(for_teacher_course)
    for_teacher_co.update!(assignable: false)

    # Course offering that is a NON-self-paced assignable published teacher course offerings
    non_self_paced_course = create(
      :single_unit_course,
      family_name: 'non-self-paced',
      version_year: '1998',
      published_state: 'stable',
      instructor_audience: 'universal_instructor',
      participant_audience: 'teacher'
    )
    CourseOffering.add_course_offering(non_self_paced_course)

    # Course offering that satisfies all conditions
    self_paced_course = create(
      :single_unit_course,
      family_name: 'all',
      version_year: '1998',
      published_state: 'stable',
      instructor_audience: 'universal_instructor',
      instruction_type: 'self_paced',
      participant_audience: 'teacher'
    )
    self_paced_co = CourseOffering.add_course_offering(self_paced_course)

    assert_equal [self_paced_co.key], CourseOffering.self_paced_course_offerings_for_catalog.pluck(:key)
  end

  test 'can_be_assigned? is false if its an unassignable course' do
    unassignable_course_offering = create(:course_offering)
    refute unassignable_course_offering.can_be_assigned?(@student)
    refute unassignable_course_offering.can_be_assigned?(@teacher)
  end

  test 'can_be_assigned? is false if can not be instructor' do
    unit_tts_co = @unit_teacher_to_students.get_course_version.course_offering
    unit_ftt_co = @unit_facilitator_to_teacher.get_course_version.course_offering

    refute unit_tts_co.can_be_assigned?(@student)
    assert unit_tts_co.can_be_assigned?(@teacher)

    refute unit_ftt_co.can_be_assigned?(@teacher)
    assert unit_ftt_co.can_be_assigned?(@facilitator)
  end

  test 'can_be_assigned? is true if has pilot access and any course version is in pilot state' do
    pilot_unit_co = @pilot_unit.get_course_version.course_offering
    pilot_pl_unit_co = @pilot_pl_unit.get_course_version.course_offering

    refute pilot_unit_co.can_be_assigned?(@teacher)
    assert pilot_unit_co.can_be_assigned?(@pilot_teacher)
    refute pilot_unit_co.can_be_assigned?(@pilot_instructor)

    refute pilot_pl_unit_co.can_be_assigned?(@teacher)
    refute pilot_pl_unit_co.can_be_assigned?(@pilot_teacher)
    assert pilot_pl_unit_co.can_be_assigned?(@pilot_instructor)
  end

  test 'can_be_assigned? is true if any versions in development and user is levelbuilder' do
    unit1 = create(
      :single_unit_course,
      :with_course_offering,
      family_name: 'family-10',
      version_year: '1992',
      published_state: 'in_development'
    ).first_unit

    refute unit1.get_course_version.course_offering.can_be_assigned?(@teacher)
    assert unit1.get_course_version.course_offering.can_be_assigned?(@levelbuilder)
  end

  test 'get assignable course offerings for student should return no offerings' do
    assert_equal CourseOffering.assignable_course_offerings(@student).length, 0
  end

  test 'get assignable course offerings for levelbuilder should return all offerings' do
    expected_course_offering_info = [
      @unit_group.course_version.course_offering.id,
      @unit_teacher_to_students.get_course_version.course_offering.id,
      @pilot_unit.get_course_version.course_offering.id,
      @partner_unit.get_course_version.course_offering.id,
      @pilot_pl_unit.get_course_version.course_offering.id,
      @in_development_unit.get_course_version.course_offering.id,
      @beta_unit.get_course_version.course_offering.id,
      @unit_facilitator_to_teacher.get_course_version.course_offering.id
    ].sort

    assignable_course_offerings = CourseOffering.assignable_course_offerings_info(@levelbuilder)
    expected_course_offering_info.each {|co| assert assignable_course_offerings.key?(co)}
  end

  test 'in assignable course offerings summary display names of course offerings include star if they are not launched' do
    expected_course_offering_names = [
      @unit_group.course_version.course_offering.display_name,
      @unit_teacher_to_students.get_course_version.course_offering.display_name,
      @pilot_unit.get_course_version.course_offering.display_name + " *",
      @partner_unit.get_course_version.course_offering.display_name + " *",
      @pilot_pl_unit.get_course_version.course_offering.display_name + " *",
      @in_development_unit.get_course_version.course_offering.display_name + " *",
      @beta_unit.get_course_version.course_offering.display_name + " *",
      @unit_facilitator_to_teacher.get_course_version.course_offering.display_name
    ].sort

    assignable_course_offering_names = CourseOffering.assignable_course_offerings_info(@levelbuilder).values.pluck(:display_name)
    expected_course_offering_names.each {|name| assert_includes(assignable_course_offering_names, name)}
  end

  test 'get assignable course offerings for pilot teacher should return offerings where pilot teacher can be instructor' do
    expected_course_offering_info = [
      @unit_group.course_version.course_offering.id,
      @unit_teacher_to_students.get_course_version.course_offering.id,
      @pilot_unit.get_course_version.course_offering.id
    ].sort

    assignable_course_offerings = CourseOffering.assignable_course_offerings_info(@pilot_teacher)
    expected_course_offering_info.each {|co| assert assignable_course_offerings.key?(co)}
  end

  test 'get assignable course offerings for partner should return offerings where partner can be instructor and partners courses' do
    expected_course_offering_info = [
      @unit_group.course_version.course_offering.id,
      @unit_teacher_to_students.get_course_version.course_offering.id,
      @partner_unit.get_course_version.course_offering.id
    ].sort

    assignable_course_offerings = CourseOffering.assignable_course_offerings_info(@partner)
    expected_course_offering_info.each {|co| assert assignable_course_offerings.key?(co)}
  end

  test 'get assignable course offerings for pl pilot instructor should return offerings where pl pilot instructor can be instructor' do
    expected_course_offering_info = [
      @unit_group.course_version.course_offering.id,
      @unit_teacher_to_students.get_course_version.course_offering.id,
      @pilot_pl_unit.get_course_version.course_offering.id,
      @unit_facilitator_to_teacher.get_course_version.course_offering.id
    ].sort

    assignable_course_offerings = CourseOffering.assignable_course_offerings_info(@pilot_instructor)
    expected_course_offering_info.each {|co| assert assignable_course_offerings.key?(co)}
  end

  test 'get assignable course offerings for teacher should return offerings where teacher can be instructor' do
    expected_course_offering_info = [
      @unit_group.course_version.course_offering.id,
      @unit_teacher_to_students.get_course_version.course_offering.id
    ].sort

    assignable_course_offerings = CourseOffering.assignable_course_offerings_info(@teacher)
    expected_course_offering_info.each {|co| assert assignable_course_offerings.key?(co)}
  end

  test 'get assignable course offerings for facilitator should return all offerings, versions, amd units where facilitator can be instructor' do
    expected_course_offering_info = [
      @unit_group.course_version.course_offering.id,
      @unit_teacher_to_students.get_course_version.course_offering.id,
      @unit_facilitator_to_teacher.get_course_version.course_offering.id
    ].sort

    assignable_course_offerings = CourseOffering.assignable_course_offerings_info(@facilitator)

    expected_course_offering_info.each {|co| assert assignable_course_offerings.key?(co)}

    unit_group_course_versions = assignable_course_offerings[@unit_group.course_version.course_offering.id][:course_versions]
    assert_equal unit_group_course_versions.keys, [@unit_group.course_version.id]
    assert_equal unit_group_course_versions[@unit_group.course_version.id][:units].keys, [@unit_in_course.id]

    teacher_to_student_course_versions = assignable_course_offerings[@unit_teacher_to_students.get_course_version.course_offering.id][:course_versions]
    assert_equal teacher_to_student_course_versions.keys, [@unit_teacher_to_students.get_course_version.id, @unit_teacher_to_students2.get_course_version.id]
    assert_equal teacher_to_student_course_versions[@unit_teacher_to_students.get_course_version.id][:units].keys, [@unit_teacher_to_students.id]
    assert_equal teacher_to_student_course_versions[@unit_teacher_to_students2.get_course_version.id][:units].keys, [@unit_teacher_to_students2.id]

    facilitator_to_teacher_course_versions = assignable_course_offerings[@unit_facilitator_to_teacher.get_course_version.course_offering.id][:course_versions]
    assert_equal facilitator_to_teacher_course_versions.keys, [@unit_facilitator_to_teacher.get_course_version.id]
    assert_equal facilitator_to_teacher_course_versions[@unit_facilitator_to_teacher.get_course_version.id][:units].keys, [@unit_facilitator_to_teacher.id]
  end

  test 'query count for assignable_course_offerings' do
    Unit.stubs(:should_cache?).returns true

    assert_cached_queries(0) do
      CourseOffering.assignable_course_offerings_info(@teacher)
    end

    assert_cached_queries(0) do
      CourseOffering.assignable_course_offerings_info(@facilitator)
    end

    Unit.clear_cache
  end

  test 'missing_required_device_compatibility? returns false for pl course offerings' do
    pl_co = create(:course_offering)
    pl_course = create(:single_unit_course, :pl_course)
    create(:course_version, content_root: pl_course, course_offering: pl_co)
    co = create(:course_offering, self_paced_pl_course_offering: pl_co)

    refute(co.missing_required_device_compatibility?)
  end

  test 'missing_required_device_compatibility? returns true for student course offering with nil device_compatibility' do
    co = create(:course_offering, device_compatibility: nil)
    unit = create(:script, :in_single_unit_course)
    create(:course_version, content_root: unit.original_unit_group, course_offering: co)

    assert(co.missing_required_device_compatibility?)
  end

  test 'missing_required_device_compatibility? returns true for student course offering missing a device_compatibility' do
    co = create(:course_offering, device_compatibility: '{"computer":"","chromebook":"not_recommended","tablet":"incompatible","mobile":"incompatible","no_device":"incompatible"}')
    unit = create(:script, :in_single_unit_course)
    create(:course_version, content_root: unit.original_unit_group, course_offering: co)

    assert(co.missing_required_device_compatibility?)
  end

  test 'missing_required_device_compatibility? returns false for student course offering not missing any device_compatibility' do
    co = create(:course_offering, device_compatibility: '{"computer":"ideal","chromebook":"not_recommended","tablet":"incompatible","mobile":"incompatible","no_device":"incompatible"}')
    unit = create(:script, :in_single_unit_course)
    create(:course_version, content_root: unit.original_unit_group, course_offering: co)

    refute(co.missing_required_device_compatibility?)
  end

  test 'duration_in_minutes returns nil if latest_published_version does not exist' do
    course = create(
      :single_unit_course,
      family_name: 'test-duration',
      version_year: '1997',
      published_state: 'in_development'
    )
    co = CourseOffering.add_course_offering(course)

    assert_nil co.latest_published_version
    assert_nil co.duration_in_minutes
  end

  test 'duration_in_minutes returns sum of units duration in minutes' do
    unit = create(
      :single_unit_course,
      unit: unit,
      published_state: 'stable',
      version_year: '1997',
      family_name: 'test-duration'
    ).first_unit
    lesson_group = create(:lesson_group, script: unit)

    lesson1 = create(:lesson, script: unit, lesson_group: lesson_group)
    create(:lesson_activity, lesson: lesson1, duration: 40)

    lesson2 = create(:lesson, script: unit, lesson_group: lesson_group)
    create(:lesson_activity, lesson: lesson2, duration: 40)
    create(:lesson_activity, lesson: lesson2, duration: 40)

    co = CourseOffering.add_course_offering(unit.original_unit_group)
    assert_equal 120, co.duration_in_minutes
  end

  test 'duration_in_hours returns nil if latest_published_version does not exist' do
    course = create(
      :single_unit_course,
      family_name: 'test-duration',
      version_year: '1997',
      published_state: 'in_development'
    )
    co = CourseOffering.add_course_offering(course)

    assert_nil co.latest_published_version
    assert_nil co.duration_in_hours
  end

  test 'duration_in_hours returns 1 hour as the minimum if latest_published_version exists' do
    unit = create(
      :single_unit_course,
      unit: unit,
      published_state: 'stable',
      version_year: '1997',
      family_name: 'test-duration'
    ).first_unit
    lesson_group = create(:lesson_group, script: unit)

    lesson1 = create(:lesson, script: unit, lesson_group: lesson_group)
    create(:lesson_activity, lesson: lesson1, duration: 20)

    co = CourseOffering.add_course_offering(unit.original_unit_group)
    assert_equal 1, co.duration_in_hours
  end

  test 'duration_in_hours returns sum of units duration in hours (rounded down using integer math)' do
    unit = create(
      :single_unit_course,
      unit: unit,
      published_state: 'stable',
      version_year: '1997',
      family_name: 'test-duration'
    ).first_unit
    lesson_group = create(:lesson_group, script: unit)

    lesson1 = create(:lesson, script: unit, lesson_group: lesson_group)
    create(:lesson_activity, lesson: lesson1, duration: 50)

    lesson2 = create(:lesson, script: unit, lesson_group: lesson_group)
    create(:lesson_activity, lesson: lesson2, duration: 50)
    create(:lesson_activity, lesson: lesson2, duration: 50)

    co = CourseOffering.add_course_offering(unit.original_unit_group)
    assert_equal 2, co.duration_in_hours
  end

  test 'duration returns nil if latest_published_version does not exist' do
    course = create(:single_unit_course, family_name: 'test-duration', version_year: '1997', published_state: 'in_development')
    co = CourseOffering.add_course_offering(course)

    assert_nil co.latest_published_version
    assert_nil co.duration
  end

  test 'duration returns label associated with sum of units duration' do
    # Create a unit with multiple lessons, each with a different number of lesson activities.
    unit = create(:single_unit_course, unit: unit, published_state: 'stable', version_year: '1997', family_name: 'test-duration').first_unit
    lesson_group = create(:lesson_group, script: unit)

    lesson1 = create(:lesson, script: unit, lesson_group: lesson_group)
    create(:lesson_activity, lesson: lesson1, duration: 40)

    lesson2 = create(:lesson, script: unit, lesson_group: lesson_group)
    create(:lesson_activity, lesson: lesson2, duration: 40)
    create(:lesson_activity, lesson: lesson2, duration: 40)

    # A course_offering of this unit should have a 'week' duration since a week is labeled as 91-250 minutes.
    co = CourseOffering.add_course_offering(unit.original_unit_group)
    assert_equal 120, co.latest_published_version.units.sum(&:duration_in_minutes)
    assert_equal :week, co.duration
  end

  test 'duration returns lesson if sum of units duration is 0' do
    # Create a unit with single lesson with an unspecified duration (defaults to 0).
    unit = create(:single_unit_course, family_name: 'test-duration', version_year: '1997', published_state: 'stable').first_unit
    lesson_group = create(:lesson_group, script: unit)

    lesson = create(:lesson, script: unit, lesson_group: lesson_group)
    create(:lesson_activity, lesson: lesson)

    # A course_offering of this unit should have a 'lesson' duration since a lesson is labeled as 0-90 minutes.
    co = CourseOffering.add_course_offering(unit.original_unit_group)
    assert_equal 0, co.latest_published_version.units.sum(&:duration_in_minutes)
    assert_equal :lesson, co.duration
  end

  test 'duration returns school_year if sum of units duration is greater than 5000' do
    # Create a unit with multiple lessons with durations that sum up to >5000.
    unit = create(:single_unit_course, family_name: 'test-duration', version_year: '1997', published_state: 'stable').first_unit
    lesson_group = create(:lesson_group, script: unit)

    lesson = create(:lesson, script: unit, lesson_group: lesson_group)
    6.times {create(:lesson_activity, lesson: lesson, duration: 1000)}

    # A course_offering of this unit should have a 'school_year' duration since a school year is labeled as 5000+ minutes.
    co = CourseOffering.add_course_offering(unit.original_unit_group)
    assert_equal 6000, co.latest_published_version.units.sum(&:duration_in_minutes)
    assert_equal :school_year, co.duration
  end

  test 'translated? returns true if user locale is in English' do
    script = create(:script, supported_locales: ['fake-locale'])
    create(:single_unit_course, unit: script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '2050', family_name: 'ss')
    offering = CourseOffering.add_course_offering(script.original_unit_group)
    assert offering.translated?('en-us')
  end

  test 'translated? returns true only if course offering has a stable version supported in user locale' do
    script1 = create(:script, supported_locales: ['fake-locale', 'second-fake-locale'])
    create(:single_unit_course, :with_course_offering, unit: script1, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '2051', family_name: 'ss')
    script2 = create(:script, supported_locales: ['fake-locale'])
    create(:single_unit_course, unit: script2, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '2052', family_name: 'ss')
    offering = CourseOffering.add_course_offering(script2.original_unit_group)

    assert offering.translated?('fake-locale')
    assert offering.translated?('second-fake-locale')
    refute offering.translated?('unsupported-locale')
  end

  test "can serialize and seed course offerings" do
    course_offering = create(:course_offering, key: 'course-offering-1', grade_levels: 'K,1,2', curriculum_type: 'Course', marketing_initiative: 'HOC', header: 'Popular Media', image: 'https://images.code.org/spritelab.JPG', cs_topic: 'Artificial Intelligence,Cybersecurity', school_subject: 'Math,Science', device_compatibility: "{'computer':'ideal','chromebook':'not_recommended','tablet':'incompatible','mobile':'incompatible','no_device':'incompatible'}", description: "An introductory course that empowers students to engage with computer science as a medium for creativity, communication, an problem solving.", professional_learning_program: "https://code.org/apply", video: "https://youtu.be/T45kEEBzrT8", published_date: DateTime.new(2023, 7, 5, 4, 30), self_paced_pl_course_offering_id: nil)
    serialization = course_offering.serialize
    previous_course_offering = course_offering.freeze
    course_offering.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_course_offering_key = CourseOffering.seed_record("config/course_offerings/course-offering-1.json")
    new_course_offering = CourseOffering.find_by(key: new_course_offering_key)
    assert_equal previous_course_offering.attributes.except('id', 'created_at', 'updated_at'),
      new_course_offering.attributes.except('id', 'created_at', 'updated_at')
  end

  test "can seed correct self paced pl id based on self paced pl key" do
    course_offering = create(:course_offering, key: 'course-offering-1')
    self_paced_pl_course = create(:course_offering, key: 'self-paced-test-course')
    serialization = course_offering.serialize
    serialization[:self_paced_pl_course_offering_key] = "self-paced-test-course"

    File.stubs(:read).returns(serialization.to_json)

    CourseOffering.seed_record("config/course_offerings/course-offering-1.json")
    new_course_offering = CourseOffering.find_by(key: course_offering.key)
    assert_equal new_course_offering.self_paced_pl_course_offering_id,
      self_paced_pl_course.id
  end

  test "can seed ai_teaching_assistant_available" do
    course_offering = create(:course_offering, key: 'course-offering-1')
    refute course_offering.ai_teaching_assistant_available
    serialization = course_offering.serialize
    serialization[:ai_teaching_assistant_available] = true

    File.stubs(:read).returns(serialization.to_json)

    CourseOffering.seed_record("config/course_offerings/course-offering-1.json")
    new_course_offering = CourseOffering.find_by(key: course_offering.key)
    assert new_course_offering.ai_teaching_assistant_available
  end

  test "validates grade_levels" do
    assert_raises ActiveRecord::RecordInvalid do
      CourseOffering.create!(key: 'test-key', display_name: 'Test', grade_levels: '1,2,3, 4')
    end

    assert_raises ActiveRecord::RecordInvalid do
      CourseOffering.create!(key: 'test-key', display_name: 'Test', grade_levels: '1,2,3,K')
    end

    assert_raises ActiveRecord::RecordInvalid do
      CourseOffering.create!(key: 'test-key', display_name: 'Test', grade_levels: '10,11,12,13')
    end

    assert_raises ActiveRecord::RecordInvalid do
      CourseOffering.create!(key: 'test-key', display_name: 'Test', grade_levels: '0')
    end

    assert_raises ActiveRecord::RecordInvalid do
      CourseOffering.create!(key: 'test-key', display_name: 'Test', grade_levels: 'K1')
    end

    assert_raises ActiveRecord::RecordInvalid do
      CourseOffering.create!(key: 'test-key', display_name: 'Test', grade_levels: 'K,K,1')
    end

    assert_creates CourseOffering do
      CourseOffering.create!(key: 'one-grade', display_name: 'Test One Grade', grade_levels: 'K')
    end

    assert_creates CourseOffering do
      CourseOffering.create!(key: 'middle-grades', display_name: 'Test Middle Grades', grade_levels: '7,8')
    end

    assert_creates CourseOffering do
      CourseOffering.create!(key: 'high-grades', display_name: 'Test High Grades', grade_levels: '10,11,12')
    end

    assert_creates CourseOffering do
      CourseOffering.create!(key: 'all-grades', display_name: 'Test All Grades', grade_levels: 'K,1,2,3,4,5,6,7,8,9,10,11,12')
    end
  end

  test "validates curriculum_type value" do
    assert_raises do
      CourseOffering.create!(key: 'test-key', display_name: 'Test', curriculum_type: 'Invalid Curriculum Type')
    end
  end

  test "validates marketing_initiative value" do
    assert_raises do
      CourseOffering.create!(key: 'test-key', display_name: 'Test', marketing_initiative: 'Invalid Marketing Initiative')
    end
  end

  test "elementary_school_level?" do
    course1 = create(:course_offering, grade_levels: 'K,1')
    course2 = create(:course_offering, grade_levels: 'K,1,2,3,4,5')
    course3 = create(:course_offering, grade_levels: '5,6,7')
    course4 = create(:course_offering, grade_levels: '6,7,8')
    course5 = create(:course_offering, grade_levels: '8,9,10')
    course6 = create(:course_offering, grade_levels: '9,10,11,12')
    course7 = create(:course_offering, grade_levels: '11,12')

    assert course1.elementary_school_level?
    assert course2.elementary_school_level?
    assert course3.elementary_school_level?
    refute course4.elementary_school_level?
    refute course5.elementary_school_level?
    refute course6.elementary_school_level?
    refute course7.elementary_school_level?
  end

  test "middle_school_level?" do
    course1 = create(:course_offering, grade_levels: 'K,1')
    course2 = create(:course_offering, grade_levels: 'K,1,2,3,4,5')
    course3 = create(:course_offering, grade_levels: '5,6,7')
    course4 = create(:course_offering, grade_levels: '6,7,8')
    course5 = create(:course_offering, grade_levels: '8,9,10')
    course6 = create(:course_offering, grade_levels: '9,10,11,12')
    course7 = create(:course_offering, grade_levels: '11,12')

    refute course1.middle_school_level?
    refute course2.middle_school_level?
    assert course3.middle_school_level?
    assert course4.middle_school_level?
    assert course5.middle_school_level?
    refute course6.middle_school_level?
    refute course7.middle_school_level?
  end

  test "high_school_level?" do
    course1 = create(:course_offering, grade_levels: 'K,1')
    course2 = create(:course_offering, grade_levels: 'K,1,2,3,4,5')
    course3 = create(:course_offering, grade_levels: '5,6,7')
    course4 = create(:course_offering, grade_levels: '6,7,8')
    course5 = create(:course_offering, grade_levels: '8,9,10')
    course6 = create(:course_offering, grade_levels: '9,10,11,12')
    course7 = create(:course_offering, grade_levels: '11,12')

    refute course1.high_school_level?
    refute course2.high_school_level?
    refute course3.high_school_level?
    refute course4.high_school_level?
    assert course5.high_school_level?
    assert course6.high_school_level?
    assert course7.high_school_level?
  end

  test 'finds corresponding offerings for pl course' do
    pl_course_offering =create(:course_offering)
    pl_course = create(:single_unit_course, :pl_course)
    create(:course_version, content_root: pl_course, course_offering: pl_course_offering)

    course_offering = create(:course_offering, self_paced_pl_course_offering: pl_course_offering)

    assert_equal [course_offering], pl_course_offering.find_corresponding_offerings_for_pl_course
  end

  test 'does not find corresponding offerings for non-pl course' do
    course_offering = create(:course_offering)

    assert_nil course_offering.find_corresponding_offerings_for_pl_course
  end

  test 'pl_for_elementary_school? returns true if non-pl offering is targeted at elementary' do
    pl_course_offering = create(:course_offering)
    pl_course = create(:single_unit_course, :pl_course)
    create(:course_version, content_root: pl_course, course_offering: pl_course_offering)

    non_pl_course_offering = create(:course_offering, grade_levels: 'K,1,2,3,4,5', self_paced_pl_course_offering: pl_course_offering)

    assert non_pl_course_offering.elementary_school_level?
    assert pl_course_offering.pl_for_elementary_school?
  end

  test 'pl_for_elementary_school? returns false if non-pl offering is not targeted at elementary' do
    pl_course_offering = create(:course_offering)
    pl_course = create(:single_unit_course, :pl_course)
    create(:course_version, content_root: pl_course, course_offering: pl_course_offering)

    non_pl_course_offering = create(:course_offering, grade_levels: '9,10,11,12', self_paced_pl_course_offering: pl_course_offering)

    refute non_pl_course_offering.elementary_school_level?
    refute pl_course_offering.pl_for_elementary_school?
  end

  def course_offering_with_versions(num_versions, content_root_trait = :with_unit_group)
    create(:course_offering) do |offering|
      create_list(:course_version, num_versions, content_root_trait, course_offering: offering)
    end
  end
end
