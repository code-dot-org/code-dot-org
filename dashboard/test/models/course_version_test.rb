require 'test_helper'

class CourseVersionTest < ActiveSupport::TestCase
  setup_all do
    @student = create :student
    @teacher = create :teacher
    @facilitator = create :facilitator
    @universal_instructor = create :universal_instructor
    @plc_reviewer = create :plc_reviewer
    @levelbuilder = create :levelbuilder

    Rails.application.config.stubs(:levelbuilder_mode).returns false
  end

  setup do
    @unit_teacher_to_students = create(:script, name: 'unit-teacher-to-student22')
    create(:single_unit_course, :with_course_offering, unit: @unit_teacher_to_students, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '1991', family_name: 'family-22')
    @unit_teacher_to_students2 = create(:script, name: 'unit-teacher-to-student32')
    create(:single_unit_course, :with_course_offering, unit: @unit_teacher_to_students2, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '1992', family_name: 'family-22')
    @unit_facilitator_to_teacher = create(:script, name: 'unit-facilitator-to-teacher22')
    create(:single_unit_course, :pl_course, :with_course_offering, unit: @unit_facilitator_to_teacher, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, version_year: '1991', family_name: 'family-32')

    @beta_unit = create(:script, name: 'beta-unit2')
    create(:single_unit_course, :with_course_offering, unit: @beta_unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, version_year: '1991', family_name: 'beta2')

    @in_development_unit = create(:script, name: 'in-development-unit22')
    create(:single_unit_course, :with_course_offering, unit: @in_development_unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development, version_year: '1991', family_name: 'development2')

    @unit_group = create(:unit_group, name: 'course-instructed-by-teacher22', family_name: 'family-12', version_year: '1991', published_state: 'stable')
    @unit_in_course = create(:script, name: 'unit-in-teacher-instructed-course22', instructor_audience: nil, participant_audience: nil, instruction_type: nil, published_state: nil)
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @unit_in_course.reload
    @unit_group.reload
    CourseOffering.add_course_offering(@unit_group)

    @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    @pilot_unit = create :script, pilot_experiment: 'my-experiment'
    create(:single_unit_course, :with_course_offering, unit: @pilot_unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot, version_year: '1991', family_name: 'family-42', pilot_experiment: 'my-experiment')

    @pilot_instructor = create :facilitator, pilot_experiment: 'my-pl-experiment'
    @pilot_pl_unit = create :script, pilot_experiment: 'my-pl-experiment'
    create(:single_unit_course, :with_course_offering, :pl_course, unit: @pilot_pl_unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot, version_year: '1991', family_name: 'family-52', pilot_experiment: 'my-pl-experiment')

    @partner = create :teacher, pilot_experiment: 'my-editor-experiment', editor_experiment: 'ed-experiment'
    @partner_unit = create :script, pilot_experiment: 'my-editor-experiment', editor_experiment: 'ed-experiment'
    create(:single_unit_course, :with_course_offering, unit: @partner_unit, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot, version_year: '1991', family_name: 'family-112', pilot_experiment: 'my-editor-experiment')
  end

  test 'get courses with participant progress for student should return no courses' do
    assert_equal 0, CourseVersion.courses_for_unit_selector([], @student).length
  end

  test 'get courses with participant progress for levelbuilder should return all courses where followers in section have progress' do
    expected_course_info = [
      @unit_group.localized_title,
      @unit_teacher_to_students.original_unit_group.name,
      @pilot_unit.original_unit_group.name + " *",
      @partner_unit.original_unit_group.name + " *",
      @pilot_pl_unit.original_unit_group.name + " *",
      @in_development_unit.original_unit_group.name + " *",
      @beta_unit.original_unit_group.name + " *",
      @unit_facilitator_to_teacher.original_unit_group.name
    ].sort

    student_unit_ids = [
      @unit_in_course.id,
      @unit_teacher_to_students.id,
      @pilot_unit.id,
      @partner_unit.id,
      @pilot_pl_unit.id,
      @in_development_unit.id,
      @beta_unit.id,
      @unit_facilitator_to_teacher.id
    ]

    assert_equal expected_course_info, CourseVersion.courses_for_unit_selector(student_unit_ids, @levelbuilder).pluck(:display_name).sort
  end

  test 'get courses with participant progress for pilot teacher should return courses where pilot teacher can be instructor' do
    expected_course_info = [
      @pilot_unit.original_unit_group.name + " *",
    ].sort

    assert_equal expected_course_info, CourseVersion.courses_for_unit_selector([@pilot_unit.id], @pilot_teacher).pluck(:display_name).sort
  end

  test 'get courses with participant progress for teacher should only return courses where they can be the instructor' do
    expected_course_info = [
      @unit_group.localized_title,
      @unit_teacher_to_students.original_unit_group.name,
    ].sort

    student_unit_ids = [
      @unit_in_course.id,
      @unit_teacher_to_students.id
    ]

    assert_equal expected_course_info, CourseVersion.courses_for_unit_selector(student_unit_ids, @teacher).pluck(:display_name).sort
  end

  test 'get courses with participant progress for facilitator should return all courses, amd units where facilitator can be instructor and followers in section have progress' do
    expected_course_info = [
      @unit_group.localized_title,
      @unit_teacher_to_students.original_unit_group.name,
      @unit_facilitator_to_teacher.original_unit_group.name
    ].sort

    expected_unit_info = [
      @unit_in_course.localized_title,
      @unit_teacher_to_students.localized_title,
      @unit_facilitator_to_teacher.localized_title
    ].sort

    student_unit_ids = [
      @unit_in_course.id,
      @unit_teacher_to_students.id,
      @unit_facilitator_to_teacher.id
    ]

    courses_with_progress = CourseVersion.courses_for_unit_selector(student_unit_ids, @facilitator)

    assert_equal expected_course_info, courses_with_progress.pluck(:display_name).sort

    unit_names = courses_with_progress.pluck(:units).flatten.pluck(:name)
    assert_equal expected_unit_info, unit_names.sort
  end

  test "course version associations" do
    course_version = create :course_version
    assert_instance_of UnitGroup, course_version.content_root
    assert_equal course_version, course_version.content_root.course_version
  end

  test "recommended? is false if course_version is not stable" do
    single_unit_course = create(:single_unit_course, :with_course_offering, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta, family_name: 'ss', version_year: '2050')

    unit_group = create :unit_group, family_name: 'ug', version_year: '2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    CourseOffering.add_course_offering(unit_group)

    refute single_unit_course.course_version.recommended?
    refute unit_group.course_version.recommended?
  end

  test "recommended? is true if its the only course version in the course offering" do
    single_unit_course = create(:single_unit_course, :with_course_offering, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'ss', version_year: '2050')

    unit_group = create :unit_group, family_name: 'ug', version_year: '2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(unit_group)

    assert single_unit_course.course_version.recommended?
    assert unit_group.course_version.recommended?
  end

  test "recommended? is true if its the latest stable version of unit group in the family in user locale" do
    ug_2050 = create :unit_group, family_name: 'ug', version_year: '2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    ug_2050_unit = create(:script, name: 'ug1-2050', supported_locales: ['fake-locale'])
    create :unit_group_unit, unit_group: ug_2050, script: ug_2050_unit, position: 1
    CourseOffering.add_course_offering(ug_2050)

    ug_2051 = create :unit_group, family_name: 'ug', version_year: '2051', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    ug_2051_unit = create(:script, name: 'ug1-2051', supported_locales: [])
    create :unit_group_unit, unit_group: ug_2051, script: ug_2051_unit, position: 1
    CourseOffering.add_course_offering(ug_2051)

    refute ug_2050.course_version.recommended?('en-us')
    assert ug_2051.course_version.recommended?('en-us')
    assert_equal ug_2051.course_version.content_root, UnitGroup.latest_stable_version('ug')
    assert ug_2050.course_version.recommended?('fake-locale')
    refute ug_2051.course_version.recommended?('fake-locale')
    assert_equal ug_2050.course_version.content_root, UnitGroup.latest_stable_version('ug', locale: 'fake-locale')
  end

  test "recommended? is true if its the latest stable unit in the family in user locale across unitgroup" do
    ug_2050 = create :unit_group, family_name: 'family', version_year: '2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    ug_2050_unit = create(:script, name: 'family1-2050', supported_locales: ['fake-locale'])
    create :unit_group_unit, unit_group: ug_2050, script: ug_2050_unit, position: 1
    CourseOffering.add_course_offering(ug_2050)

    script = create :script, supported_locales: ['fake-locale']
    create(:single_unit_course, :with_course_offering, unit: script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'family', version_year: '2049')
    script2 = create :script, supported_locales: []
    create(:single_unit_course, :with_course_offering, unit: script2, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'family', version_year: '2052')

    refute ug_2050.course_version.recommended?('en-us')
    refute script.get_course_version.recommended?('en-us')
    assert script2.get_course_version.recommended?('en-us')

    refute script.get_course_version.recommended?('fake-locale')
    refute script2.get_course_version.recommended?('fake-locale')
    assert ug_2050.course_version.recommended?('fake-locale')
  end

  test "recommended? is true if its the latest stable unitgroup in the family in user locale across unit" do
    ug_2050 = create :unit_group, family_name: 'family', version_year: '2050', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    ug_2050_unit = create(:script, name: 'family1-2050')
    create :unit_group_unit, unit_group: ug_2050, script: ug_2050_unit, position: 1
    CourseOffering.add_course_offering(ug_2050)

    script = create :script, supported_locales: ['fake-locale']
    create(:single_unit_course, :with_course_offering, unit: script, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'family', version_year: '2048')
    script2 = create :script, supported_locales: []
    create(:single_unit_course, :with_course_offering, unit: script2, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, family_name: 'family', version_year: '2049')

    refute script.get_course_version.recommended?('en-us')
    refute script2.get_course_version.recommended?('en-us')
    assert ug_2050.course_version.recommended?('en-us')

    assert script.get_course_version.recommended?('fake-locale')
    refute script2.get_course_version.recommended?('fake-locale')
    refute ug_2050.course_version.recommended?('fake-locale')
  end

  test "add_course_version updates existing CourseVersion for script if properties change" do
    course_version = create :course_version, :with_single_unit_course
    script = course_version.content_root
    offering = course_version.course_offering

    script.version_year = '2060'
    script.save
    CourseVersion.add_course_version(offering, script)

    assert_equal '2060', script.course_version.key
    assert_equal '2060', script.course_version.display_name
    assert_equal script.course_version, CourseVersion.find_by(course_offering: course_version.course_offering, key: '2060')
    assert_nil CourseVersion.find_by(course_offering: offering, key: '2050') # old CourseVersion should be deleted
  end

  test "add_course_version does nothing for script without CourseVersion if is_course is false" do
    offering = create :course_offering
    script = create :script, family_name: 'csz', version_year: '2050'
    course_version = CourseVersion.add_course_version(offering, script)

    assert_nil course_version
    assert_nil script.course_version
    assert_nil CourseVersion.find_by(course_offering: offering, key: '2050')
  end

  test "cannot destroy course version if it has resources" do
    course_version = create :course_version
    create :resource, course_version: course_version
    assert_raises ActiveRecord::RecordNotDestroyed do
      course_version.destroy_and_destroy_parent_if_empty
    end
  end

  test "destroy_and_destroy_parent_if_empty destroys version and offering for offering with one version" do
    course_version = create :course_version
    offering = course_version.course_offering

    course_version.destroy_and_destroy_parent_if_empty
    assert_nil CourseVersion.find_by(course_offering: offering, key: course_version.key)
    assert_nil CourseOffering.find_by(id: offering.id)
  end

  test "destroy_and_destroy_parent_if_empty destroys version only for offering with multiple versions" do
    course_version = create :course_version
    offering = course_version.course_offering
    create :course_version, course_offering: offering

    course_version.destroy_and_destroy_parent_if_empty
    assert_nil CourseVersion.find_by(course_offering: offering, key: course_version.key)
    assert_equal offering, CourseOffering.find_by(id: offering.id)
  end

  test "destroy_and_destroy_parent_if_empty destroys version for version with no offering" do
    # This case shouldn't occur normally, but may exist temporarily because the CourseOffering model was added after CourseVersion.
    course_version = create :course_version, course_offering: nil
    assert_nil course_version.course_offering

    course_version.destroy_and_destroy_parent_if_empty
    assert_nil CourseVersion.find_by(course_offering: nil, key: course_version.key)
  end

  test "enforces key format" do
    course_version = build :course_version, key: 'invalid key'
    refute course_version.valid?
    course_version.key = '0123456789abcdefghijklmnopqrstuvwxyz-'
    assert course_version.valid?
  end

  test "throws exception if changing course version of content root that prevent course version change" do
    course = create(:course_version, :with_unit_group).content_root
    course.stubs(:prevent_course_version_change?).returns(true)
    course_offering = create :course_offering
    assert_raises do
      CourseVersion.add_course_version(course_offering, course)
    end
  end
end
