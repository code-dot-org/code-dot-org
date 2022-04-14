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

    @unit_teacher_to_students = create(:script, name: 'unit-teacher-to-student2', family_name: 'family-2', version_year: '1991', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(@unit_teacher_to_students)
    @unit_teacher_to_students2 = create(:script, name: 'unit-teacher-to-student3', family_name: 'family-2', version_year: '1992', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(@unit_teacher_to_students2)
    @unit_facilitator_to_teacher = create(:script, name: 'unit-facilitator-to-teacher2', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher, family_name: 'family-3', version_year: '1991', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(@unit_facilitator_to_teacher)

    @beta_unit = create(:script, name: 'beta-unit', family_name: 'beta', version_year: '1991', is_course: true, published_state: 'beta')
    CourseOffering.add_course_offering(@beta_unit)

    @in_development_unit = create(:script, name: 'in-development-unit2', family_name: 'development', version_year: '1991', is_course: true, published_state: 'in_development')
    CourseOffering.add_course_offering(@in_development_unit)
  end

  setup do
    @unit_group = create(:unit_group, name: 'course-instructed-by-teacher2', family_name: 'family-1', version_year: '1991', published_state: 'stable')
    @unit_in_course = create(:script, name: 'unit-in-teacher-instructed-course2', instructor_audience: nil, participant_audience: nil, instruction_type: nil, published_state: nil)
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @unit_in_course.reload
    @unit_group.reload
    CourseOffering.add_course_offering(@unit_group)

    @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    @pilot_unit = create :script, pilot_experiment: 'my-experiment', family_name: 'family-4', version_year: '1991', is_course: true, published_state: SharedCourseConstants::PUBLISHED_STATE.pilot
    CourseOffering.add_course_offering(@pilot_unit)

    @pilot_instructor = create :facilitator, pilot_experiment: 'my-pl-experiment'
    @pilot_pl_unit = create :script, pilot_experiment: 'my-pl-experiment', family_name: 'family-5', version_year: '1991', is_course: true, published_state: SharedCourseConstants::PUBLISHED_STATE.pilot, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    CourseOffering.add_course_offering(@pilot_pl_unit)

    @partner = create :teacher, pilot_experiment: 'my-editor-experiment', editor_experiment: 'ed-experiment'
    @partner_unit = create :script, pilot_experiment: 'my-editor-experiment', editor_experiment: 'ed-experiment', family_name: 'family-11', version_year: '1991', is_course: true, published_state: SharedCourseConstants::PUBLISHED_STATE.pilot
    CourseOffering.add_course_offering(@partner_unit)
  end
  test 'get course versions with student progress for student should return no versions' do
    assert_equal CourseVersion.course_versions_with_student_progress([], @student).length, 0
  end

  test 'get course versions with student progress for levelbuilder should return all versions where followers in section have progress' do
    expected_course_version_info = [
      @unit_group.course_version.id,
      @unit_teacher_to_students.course_version.id,
      @pilot_unit.course_version.id,
      @partner_unit.course_version.id,
      @pilot_pl_unit.course_version.id,
      @in_development_unit.course_version.id,
      @beta_unit.course_version.id,
      @unit_facilitator_to_teacher.course_version.id
    ].sort

    student_unit_ids = [
      @unit_group.id,
      @unit_teacher_to_students.id,
      @pilot_unit.id,
      @partner_unit.id,
      @pilot_pl_unit.id,
      @in_development_unit.id,
      @beta_unit.id,
      @unit_facilitator_to_teacher.id
    ]

    assert_equal CourseVersion.course_versions_with_student_progress_info(@levelbuilder, student_unit_ids).keys.sort, expected_course_version_info
  end

  test 'in course versions with progress summary display names of course version include star if they are not launched' do
    expected_course_version_names = [
      @unit_group.course_version.display_name,
      @unit_teacher_to_students.course_version.display_name,
      @pilot_unit.course_version.display_name + " *",
      @partner_unit.course_version.display_name + " *",
      @pilot_pl_unit.course_version.display_name + " *",
      @in_development_unit.course_version.display_name + " *",
      @beta_unit.course_version.display_name + " *",
      @unit_facilitator_to_teacher.course_version.display_name
    ].sort

    student_unit_ids = [
      @unit_group.id,
      @unit_teacher_to_students.id,
      @pilot_unit.id,
      @partner_unit.id,
      @pilot_pl_unit.id,
      @in_development_unit.id,
      @beta_unit.id,
      @unit_facilitator_to_teacher.id
    ]

    assert_equal CourseVersion.course_versions_with_student_progress_info(@levelbuilder, student_unit_ids).values.map {|co| co[:display_name]}.sort, expected_course_version_names
  end

  test 'get course versions with student progress for pilot teacher should return versions where pilot teacher can be instructor' do
    expected_course_version_info = [
      @pilot_unit.course_version.id
    ].sort

    assert_equal CourseVersion.course_versions_with_student_progress_info(@pilot_teacher, [@pilot_unit.id]).keys.sort, expected_course_version_info
  end

  test 'get course versions with student progress for teacher should only return versions where they can be the instructor' do
    expected_course_version_info = [
      @unit_group.course_version.id,
      @unit_teacher_to_students.course_version.id
    ].sort

    student_unit_ids = [
      @unit_group.id,
      @unit_teacher_to_students.id,
      @unit_facilitator_to_teacher.id
    ]

    assert_equal CourseVersion.course_versions_with_student_progress_info(@teacher, student_unit_ids).keys.sort, expected_course_version_info
  end

  test 'get course versions with student progress for facilitator should return all versions, amd units where facilitator can be instructor and followers in section have progress' do
    expected_course_version_info = [
      @unit_group.course_version.id,
      @unit_teacher_to_students.course_version.id,
      @unit_facilitator_to_teacher.course_version.id
    ].sort

    student_unit_ids = [
      @unit_group.id,
      @unit_teacher_to_students.id,
      @unit_facilitator_to_teacher.id
    ]

    assignable_course_versions = CourseVersion.course_versions_with_student_progress_info(@facilitator, student_unit_ids)

    assert_equal assignable_course_versions.keys.sort, expected_course_version_info

    unit_group_units = assignable_course_versions[@unit_group.course_version.id][:units]
    assert_equal unit_group_units.keys, [@unit_in_course.id]

    teacher_to_student_units = assignable_course_versions[@unit_teacher_to_students.course_version.id][:units]
    assert_equal teacher_to_student_units.keys, [@unit_teacher_to_students.id, @unit_teacher_to_students2.id]

    facilitator_to_teacher_units = assignable_course_versions[@unit_facilitator_to_teacher.course_version.id][:units]
    assert_equal facilitator_to_teacher_units.keys, [@unit_facilitator_to_teacher.id]
  end

  test "course version associations" do
    course_version = create :course_version
    assert_instance_of UnitGroup, course_version.content_root
    assert_equal course_version, course_version.content_root.course_version

    course_version = create :course_version, :with_unit
    assert_instance_of Script, course_version.content_root
    assert_equal course_version, course_version.content_root.course_version
  end

  test "recommended? is false if course_version is not stable" do
    script = create :script, family_name: 'ss', version_year: '2050', is_course: true, published_state: SharedCourseConstants::PUBLISHED_STATE.beta
    CourseOffering.add_course_offering(script)

    unit_group = create :unit_group, family_name: 'ug', version_year: '2050', published_state: SharedCourseConstants::PUBLISHED_STATE.beta
    CourseOffering.add_course_offering(unit_group)

    refute script.course_version.recommended?
    refute unit_group.course_version.recommended?
  end

  test "recommended? is true if its the only course version in the course offering" do
    script = create :script, family_name: 'ss', version_year: '2050', is_course: true, published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(script)

    unit_group = create :unit_group, family_name: 'ug', version_year: '2050', published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(unit_group)

    assert script.course_version.recommended?
    assert unit_group.course_version.recommended?
  end

  test "recommended? is true if its the latest stable version of unit in the family" do
    script = create :script, family_name: 'ss', version_year: '2050', is_course: true, supported_locales: ['fake-locale'], published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(script)
    script2 = create :script, family_name: 'ss', version_year: '2051', is_course: true, supported_locales: [], published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(script2)

    refute script.course_version.recommended?('en-us')
    assert script2.course_version.recommended?('en-us')
    assert_equal script2.course_version.content_root, Script.latest_stable_version('ss')
    assert script.course_version.recommended?('fake-locale')
    refute script2.course_version.recommended?('fake-locale')
    assert_equal script.course_version.content_root, Script.latest_stable_version('ss', locale: 'fake-locale')
  end

  test "recommended? is true if its the latest stable version of unit group in the family" do
    unit_group = create :unit_group, family_name: 'ug', version_year: '2050', published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(unit_group)
    unit_group2 = create :unit_group, family_name: 'ug', version_year: '2051', published_state: SharedCourseConstants::PUBLISHED_STATE.stable
    CourseOffering.add_course_offering(unit_group2)

    refute unit_group.course_version.recommended?
    assert unit_group2.course_version.recommended?
    assert_equal unit_group2.course_version.content_root, UnitGroup.latest_stable_version('ug')
  end

  test "add_course_version creates CourseVersion for script that doesn't have one if is_course is true" do
    offering = create :course_offering, key: 'csz'
    script = create :script, family_name: 'csz', version_year: '2050', is_course: true
    course_version = CourseVersion.add_course_version(offering, script)

    assert_equal course_version, CourseVersion.find_by(course_offering: offering, key: '2050')
  end

  test "add_course_version updates existing CourseVersion for script if properties change" do
    course_version = create :course_version, :with_unit
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

  test "add_course_version deletes CourseVersion for script if is_course is changed to false" do
    course_version = create :course_version, :with_unit
    script = course_version.content_root
    offering = course_version.course_offering

    script.is_course = false
    script.save
    course_version = CourseVersion.add_course_version(offering, script)

    assert_nil course_version
    assert_nil script.course_version
    assert_nil CourseVersion.find_by(course_offering: offering, key: '2050')
  end

  test "add_course_version does nothing for script without CourseVersion if is_course is false" do
    offering = create :course_offering
    script = create :script, family_name: 'csz', version_year: '2050'
    course_version = CourseVersion.add_course_version(offering, script)

    assert_nil course_version
    assert_nil script.course_version
    assert_nil CourseVersion.find_by(course_offering: offering, key: '2050')
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
    script = create :script, is_course: true
    script.stubs(:prevent_course_version_change?).returns(true)
    course_offering = create :course_offering
    assert_raises do
      CourseVersion.add_course_version(course_offering, script)
    end
  end
end
