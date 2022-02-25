require 'test_helper'

class CourseOfferingTest < ActiveSupport::TestCase
  setup_all do
    @student = create :student
    @teacher = create :teacher
    @facilitator = create :facilitator
    @universal_instructor = create :universal_instructor
    @plc_reviewer = create :plc_reviewer
    @levelbuilder = create :levelbuilder

    Rails.application.config.stubs(:levelbuilder_mode).returns false

    @unit_group = create(:unit_group, name: 'course-instructed-by-teacher2', family_name: 'family-1', version_year: '1991', published_state: 'stable')
    @unit_in_course = create(:script, name: 'unit-in-teacher-instructed-course2', instructor_audience: nil, participant_audience: nil, instruction_type: nil, published_state: nil)
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @unit_in_course.reload
    @unit_group.reload
    CourseOffering.add_course_offering(@unit_group)

    @unit_teacher_to_students = create(:script, name: 'unit-teacher-to-student2', family_name: 'family-2', version_year: '1991', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(@unit_teacher_to_students)
    @unit_teacher_to_students2 = create(:script, name: 'unit-teacher-to-student3', family_name: 'family-2', version_year: '1992', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(@unit_teacher_to_students2)
    @unit_facilitator_to_teacher = create(:script, name: 'unit-facilitator-to-teacher2', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher, family_name: 'family-3', version_year: '1991', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(@unit_facilitator_to_teacher)

    @pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    @pilot_unit = create :script, pilot_experiment: 'my-experiment', family_name: 'family-4', version_year: '1991', is_course: true, published_state: SharedCourseConstants::PUBLISHED_STATE.pilot
    CourseOffering.add_course_offering(@pilot_unit)

    @pilot_instructor = create :facilitator, pilot_experiment: 'my-pl-experiment'
    @pilot_pl_unit = create :script, pilot_experiment: 'my-pl-experiment', family_name: 'family-5', version_year: '1991', is_course: true, published_state: SharedCourseConstants::PUBLISHED_STATE.pilot, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    CourseOffering.add_course_offering(@pilot_pl_unit)
  end

  test "course offering associations" do
    course_offering = create :course_offering
    version1 = create :course_version, course_offering: course_offering
    version2 = create :course_version, course_offering: course_offering

    assert_equal [version1, version2].sort_by(&:key), course_offering.course_versions.sort_by(&:key)
    assert_equal course_offering, version1.course_offering
    assert_equal course_offering, version2.course_offering
  end

  test "ScriptSeed.seed_from_json_file creates CourseOffering and CourseVersion if is_course is true" do
    script_file = File.join(self.class.fixture_path, 'test-new-seed-course-offering.script_json')
    script = Services::ScriptSeed.seed_from_json_file(script_file)

    offering = script.course_version.course_offering
    assert_equal 'xyz', offering.key
    assert_equal CourseVersion.where(key: '1234'), offering.course_versions
  end

  test "UnitGroup.load_from_path creates CourseOffering and CourseVersion if is_course is true" do
    course_file = File.join(self.class.fixture_path, 'test-course-offering.course')
    unit_group = UnitGroup.load_from_path(course_file)

    offering = unit_group.course_version.course_offering
    assert_equal 'xyz', offering.key
    assert_equal CourseVersion.where(key: '1234'), offering.course_versions
  end

  # "Unit tests", parameterized so they test both types of content roots (Scripts and UnitGroups).
  [:unit, :unit_group].each do |content_root_type|
    test "add_course_offering creates CourseOffering and CourseVersion for #{content_root_type}" do
      family_name = 'csz'
      version_year = '2050'
      content_root = create content_root_type, family_name: family_name, version_year: version_year
      content_root.is_course = true if content_root_type == :unit

      offering = CourseOffering.add_course_offering(content_root)

      assert_equal offering.key, family_name
      assert_equal offering.display_name, family_name
      assert_equal offering, CourseOffering.find_by(key: family_name)
      assert_equal offering.course_versions, [CourseVersion.find_by(course_offering: offering, key: version_year)]
    end

    test "add_course_offering updates existing CourseOffering and CourseVersion for #{content_root_type}" do
      offering = course_offering_with_versions(1, "with_#{content_root_type}".to_sym)
      content_root = offering.course_versions.first.content_root
      old_offering_key = offering.key
      old_version_year = offering.course_versions.first.key

      content_root.family_name = 'csz'
      content_root.version_year = '2050'
      content_root.save
      CourseOffering.add_course_offering(content_root)
      content_root.reload

      assert_equal content_root.version_year, content_root.course_version.key
      assert_equal content_root.family_name, content_root.course_version.course_offering.key
      assert_nil CourseVersion.find_by(course_offering: offering, key: old_version_year) # old CourseVersion should be deleted
      assert_nil CourseOffering.find_by(key: old_offering_key) # old CourseOffering should be deleted
    end

    test "add_course_offering updates existing CourseOffering with multiple CourseVersion for #{content_root_type}" do
      offering = course_offering_with_versions(2, "with_#{content_root_type}".to_sym)
      content_root = offering.course_versions.first.content_root
      old_offering_key = offering.key
      old_version_year = offering.course_versions.first.key

      content_root.family_name = 'csz'
      content_root.version_year = '2050'
      content_root.save
      CourseOffering.add_course_offering(content_root)
      content_root.reload

      assert_equal content_root.version_year, content_root.course_version.key
      assert_equal content_root.family_name, content_root.course_version.course_offering.key
      assert_nil CourseVersion.find_by(course_offering: offering, key: old_version_year) # old CourseVersion should be deleted
      assert_equal 1, CourseOffering.find_by(key: old_offering_key).course_versions.length # old CourseOffering should have 1 version left
    end

    test "add_course_version deletes CourseOffering and CourseVersion if is_course is changed to false for #{content_root_type}" do
      offering = course_offering_with_versions(1, "with_#{content_root_type}".to_sym)
      content_root = offering.course_versions.first.content_root
      old_offering_key = offering.key
      old_version_year = offering.course_versions.first.key

      content_root.family_name = content_root.version_year = nil
      content_root.is_course = false if content_root_type == :unit
      content_root.save
      offering = CourseOffering.add_course_offering(content_root)

      assert_nil offering
      assert_nil content_root.course_version
      assert_nil CourseVersion.find_by(key: old_version_year)
      assert_nil CourseOffering.find_by(key: old_offering_key)
    end

    test "add_course_version deletes CourseVersion but not CourseOffering if is_course is changed to false for #{content_root_type} but other versions remain" do
      offering = course_offering_with_versions(2, "with_#{content_root_type}".to_sym)
      content_root = offering.course_versions.first.content_root
      old_offering_key = offering.key
      old_version_year = offering.course_versions.first.key

      content_root.family_name = content_root.version_year = nil
      content_root.is_course = false if content_root_type == :unit
      content_root.save
      offering = CourseOffering.add_course_offering(content_root)

      assert_nil offering
      assert_nil content_root.course_version
      assert_nil CourseVersion.find_by(key: old_version_year)
      assert_equal 1, CourseOffering.find_by(key: old_offering_key).course_versions.length # old CourseOffering should have 1 version left
    end
  end

  test "add_course_offering does nothing if is_course is false for unit" do
    num_course_offerings = CourseOffering.count
    num_course_versions = CourseVersion.count
    content_root = create :unit

    offering = CourseOffering.add_course_offering(content_root)

    assert_nil offering
    assert_nil content_root.course_version
    assert_equal num_course_offerings, CourseOffering.count
    assert_equal num_course_versions, CourseVersion.count
  end

  test "throws exception if removing course version of script that prevent course version change" do
    script = create :script, is_course: true, family_name: 'family', version_year: '2000'
    CourseOffering.add_course_offering(script)

    script.family_name = nil
    script.save!
    script.reload
    script.resources = [create(:resource)]
    assert script.prevent_course_version_change?
    assert_raises do
      CourseOffering.add_course_offering(script)
    end
  end

  test "throws exception if removing course version of course that prevent course version change" do
    course = create :unit_group, family_name: 'family', version_year: '2000'
    CourseOffering.add_course_offering(course)

    course.family_name = nil
    course.save!
    course.reload
    script = create :script
    create :unit_group_unit, unit_group: course, script: script, position: 1
    script.reload
    script.resources = [create(:resource)]
    assert course.prevent_course_version_change?

    assert_raises do
      CourseOffering.add_course_offering(course)
    end
  end

  test "enforces key format" do
    course_offering = build :course_offering, key: 'invalid key'
    refute course_offering.valid?
    course_offering.key = '0123456789abcdefghijklmnopqrstuvwxyz-'
    assert course_offering.valid?
  end

  test 'any_version_has_pilot_access? is true if user has pilot access to any course versions' do
    refute @unit_teacher_to_students.course_version.course_offering.any_version_has_pilot_access?(@student)
    refute @unit_teacher_to_students.course_version.course_offering.any_version_has_pilot_access?(@teacher)
    refute @unit_teacher_to_students.course_version.course_offering.any_version_has_pilot_access?(@pilot_teacher)
    refute @unit_teacher_to_students.course_version.course_offering.any_version_has_pilot_access?(@pilot_instructor)
    refute @unit_teacher_to_students.course_version.course_offering.any_version_has_pilot_access?(@levelbuilder)

    refute @unit_facilitator_to_teacher.course_version.course_offering.any_version_has_pilot_access?(@student)
    refute @unit_facilitator_to_teacher.course_version.course_offering.any_version_has_pilot_access?(@teacher)
    refute @unit_facilitator_to_teacher.course_version.course_offering.any_version_has_pilot_access?(@pilot_teacher)
    refute @unit_facilitator_to_teacher.course_version.course_offering.any_version_has_pilot_access?(@pilot_instructor)
    refute @unit_facilitator_to_teacher.course_version.course_offering.any_version_has_pilot_access?(@levelbuilder)

    refute @pilot_unit.course_version.course_offering.any_version_has_pilot_access?(@student)
    refute @pilot_unit.course_version.course_offering.any_version_has_pilot_access?(@teacher)
    assert @pilot_unit.course_version.course_offering.any_version_has_pilot_access?(@pilot_teacher)
    refute @pilot_unit.course_version.course_offering.any_version_has_pilot_access?(@pilot_instructor)
    assert @pilot_unit.course_version.course_offering.any_version_has_pilot_access?(@levelbuilder)

    refute @pilot_pl_unit.course_version.course_offering.any_version_has_pilot_access?(@student)
    refute @pilot_pl_unit.course_version.course_offering.any_version_has_pilot_access?(@teacher)
    refute @pilot_pl_unit.course_version.course_offering.any_version_has_pilot_access?(@pilot_teacher)
    assert @pilot_pl_unit.course_version.course_offering.any_version_has_pilot_access?(@pilot_instructor)
    assert @pilot_pl_unit.course_version.course_offering.any_version_has_pilot_access?(@levelbuilder)
  end

  test 'can_be_instructor? is true if user can be instructor of any course version' do
    refute @unit_teacher_to_students.course_version.course_offering.can_be_instructor?(@student)
    assert @unit_teacher_to_students.course_version.course_offering.can_be_instructor?(@teacher)

    refute @unit_facilitator_to_teacher.course_version.course_offering.can_be_instructor?(@student)
    refute @unit_facilitator_to_teacher.course_version.course_offering.can_be_instructor?(@teacher)
    assert @unit_facilitator_to_teacher.course_version.course_offering.can_be_instructor?(@facilitator)
  end

  test 'pl_course? is true if any course versions are pl courses' do
    refute @unit_teacher_to_students.course_version.course_offering.pl_course?
    refute @unit_teacher_to_students2.course_version.course_offering.pl_course?
    assert @unit_facilitator_to_teacher.course_version.course_offering.pl_course?
  end

  test 'any_versions_launched? is true if any course versions have been launched' do
    unit1 = create(:script, name: 'unit1', family_name: 'family-6', version_year: '1991', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(unit1)
    unit2 = create(:script, name: 'unit2', family_name: 'family-6', version_year: '1992', is_course: true, published_state: 'beta')
    CourseOffering.add_course_offering(unit2)

    assert unit1.course_version.course_offering.any_versions_launched?
  end

  test 'any_versions_launched? is false if none of the course versions have been launched' do
    unit1 = create(:script, name: 'unit1', family_name: 'family-7', version_year: '1991', is_course: true, published_state: 'beta')
    CourseOffering.add_course_offering(unit1)
    unit2 = create(:script, name: 'unit2', family_name: 'family-7', version_year: '1992', is_course: true, published_state: 'beta')
    CourseOffering.add_course_offering(unit2)

    refute unit1.course_version.course_offering.any_versions_launched?
  end

  test 'any_versions_in_development? is true if any course versions are in development' do
    unit1 = create(:script, name: 'unit1', family_name: 'family-8', version_year: '1991', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(unit1)
    unit2 = create(:script, name: 'unit2', family_name: 'family-8', version_year: '1992', is_course: true, published_state: 'in_development')
    CourseOffering.add_course_offering(unit2)

    assert unit1.course_version.course_offering.any_versions_in_development?
  end

  test 'any_versions_in_development? is false if none of the course versions are in development' do
    unit1 = create(:script, name: 'unit1', family_name: 'family-9', version_year: '1991', is_course: true, published_state: 'beta')
    CourseOffering.add_course_offering(unit1)
    unit2 = create(:script, name: 'unit2', family_name: 'family-9', version_year: '1992', is_course: true, published_state: 'beta')
    CourseOffering.add_course_offering(unit2)

    refute unit1.course_version.course_offering.any_versions_in_development?
  end

  test 'assignable? is false if can not be instructor' do
    refute @unit_teacher_to_students.course_version.course_offering.assignable?(@student)
    assert @unit_teacher_to_students.course_version.course_offering.assignable?(@teacher)

    refute @unit_facilitator_to_teacher.course_version.course_offering.assignable?(@teacher)
    assert @unit_facilitator_to_teacher.course_version.course_offering.assignable?(@facilitator)
  end

  test 'assignable? is true if has pilot access and any course version is in pilot state' do
    refute @pilot_unit.course_version.course_offering.assignable?(@teacher)
    assert @pilot_unit.course_version.course_offering.assignable?(@pilot_teacher)
    refute @pilot_unit.course_version.course_offering.assignable?(@pilot_instructor)

    refute @pilot_pl_unit.course_version.course_offering.assignable?(@teacher)
    refute @pilot_pl_unit.course_version.course_offering.assignable?(@pilot_teacher)
    assert @pilot_pl_unit.course_version.course_offering.assignable?(@pilot_instructor)
  end

  test 'assignable? is true if any versions in development and user is levelbuilder' do
    unit1 = create(:script, name: 'unit2', family_name: 'family-10', version_year: '1992', is_course: true, published_state: 'in_development')
    CourseOffering.add_course_offering(unit1)

    refute unit1.course_version.course_offering.assignable?(@teacher)
    assert unit1.course_version.course_offering.assignable?(@levelbuilder)
  end

  test 'get assignable pl course offerings for teacher should return no offerings' do
    assert_equal CourseOffering.assignable_pl_course_offerings(@teacher).length, 0
  end

  test 'get assignable course offerings for student should return no offerings' do
    assert_equal CourseOffering.assignable_course_offerings(@student).length, 0
  end

  test 'get assignable student course offerings for student should return no offerings' do
    assert_equal CourseOffering.assignable_student_course_offerings(@student).length, 0
  end

  test 'get assignable course offerings for teacher should return offerings where teacher can be instructor' do
    expected_course_offering_info = [
      {
        id: @unit_group.course_version.course_offering.id,
        display_name: @unit_group.course_version.course_offering.display_name,
        category: @unit_group.course_version.course_offering.category,
        is_featured: @unit_group.course_version.course_offering.is_featured?,
        course_versions: [
          {
            id: @unit_group.course_version.id,
            version_year: @unit_group.course_version.version_year,
            display_name: @unit_group.course_version.display_name,
            is_stable: true,
            is_recommended: true,
            locales: ["English"],
            units: [{id: @unit_in_course.id, name: @unit_in_course.name}]
          }
        ]
      },
      {
        id: @unit_teacher_to_students.course_version.course_offering.id,
        display_name: @unit_teacher_to_students.course_version.course_offering.display_name,
        category: @unit_teacher_to_students.course_version.course_offering.category,
        is_featured: @unit_teacher_to_students.course_version.course_offering.is_featured?,
        course_versions: [
          {
            id: @unit_teacher_to_students.course_version.id,
            version_year: @unit_teacher_to_students.course_version.version_year,
            display_name: @unit_teacher_to_students.course_version.display_name,
            is_stable: true,
            is_recommended: false,
            locales: ["English"],
            units: [{id: @unit_teacher_to_students.id, name: @unit_teacher_to_students.name}]
          },
          {
            id: @unit_teacher_to_students2.course_version.id,
            version_year: @unit_teacher_to_students2.course_version.version_year,
            display_name: @unit_teacher_to_students2.course_version.display_name,
            is_stable: true,
            is_recommended: true,
            locales: ["English"],
            units: [{id: @unit_teacher_to_students2.id, name: @unit_teacher_to_students2.name}]
          }
        ]
      }
    ]

    assert_equal CourseOffering.assignable_course_offerings_info(@teacher), expected_course_offering_info
  end

  test 'get assignable pl course offerings for facilitator should return pl offerings where facilitator can be instructor' do
    expected_course_offering_info = [
      {
        id: @unit_facilitator_to_teacher.course_version.course_offering.id,
        display_name: @unit_facilitator_to_teacher.course_version.course_offering.display_name,
        category: @unit_facilitator_to_teacher.course_version.course_offering.category,
        is_featured: @unit_facilitator_to_teacher.course_version.course_offering.is_featured?,
        course_versions: [
          {
            id: @unit_facilitator_to_teacher.course_version.id,
            version_year: @unit_facilitator_to_teacher.course_version.version_year,
            display_name: @unit_facilitator_to_teacher.course_version.display_name,
            is_stable: true,
            is_recommended: true,
            locales: ["English"],
            units: [{id: @unit_facilitator_to_teacher.id, name: @unit_facilitator_to_teacher.name}]
          }
        ]
      }
    ]

    assert_equal CourseOffering.assignable_pl_course_offerings_info(@facilitator), expected_course_offering_info
  end

  test 'get assignable student course offerings for facilitator should return only student facing offerings' do
    expected_course_offering_info = [
      {
        id: @unit_group.course_version.course_offering.id,
        display_name: @unit_group.course_version.course_offering.display_name,
        category: @unit_group.course_version.course_offering.category,
        is_featured: @unit_group.course_version.course_offering.is_featured?,
        course_versions: [
          {
            id: @unit_group.course_version.id,
            version_year: @unit_group.course_version.version_year,
            display_name: @unit_group.course_version.display_name,
            is_stable: true,
            is_recommended: true,
            locales: ["English"],
            units: [{id: @unit_in_course.id, name: @unit_in_course.name}]
          }
        ]
      },
      {
        id: @unit_teacher_to_students.course_version.course_offering.id,
        display_name: @unit_teacher_to_students.course_version.course_offering.display_name,
        category: @unit_teacher_to_students.course_version.course_offering.category,
        is_featured: @unit_teacher_to_students.course_version.course_offering.is_featured?,
        course_versions: [
          {
            id: @unit_teacher_to_students.course_version.id,
            version_year: @unit_teacher_to_students.course_version.version_year,
            display_name: @unit_teacher_to_students.course_version.display_name,
            is_stable: true,
            is_recommended: false,
            locales: ["English"],
            units: [{id: @unit_teacher_to_students.id, name: @unit_teacher_to_students.name}]
          },
          {
            id: @unit_teacher_to_students2.course_version.id,
            version_year: @unit_teacher_to_students2.course_version.version_year,
            display_name: @unit_teacher_to_students2.course_version.display_name,
            is_stable: true,
            is_recommended: true,
            locales: ["English"],
            units: [{id: @unit_teacher_to_students2.id, name: @unit_teacher_to_students2.name}]
          }
        ]
      }
    ]

    assert_equal CourseOffering.assignable_student_course_offerings_info(@facilitator), expected_course_offering_info
  end

  test 'get assignable course offerings for facilitator should return all offerings where facilitator can be instructor' do
    expected_course_offering_info = [
      {
        id: @unit_group.course_version.course_offering.id,
        display_name: @unit_group.course_version.course_offering.display_name,
        category: @unit_group.course_version.course_offering.category,
        is_featured: @unit_group.course_version.course_offering.is_featured?,
        course_versions: [
          {
            id: @unit_group.course_version.id,
            version_year: @unit_group.course_version.version_year,
            display_name: @unit_group.course_version.display_name,
            is_stable: true,
            is_recommended: true,
            locales: ["English"],
            units: [{id: @unit_in_course.id, name: @unit_in_course.name}]
          }
        ]
      },
      {
        id: @unit_teacher_to_students.course_version.course_offering.id,
        display_name: @unit_teacher_to_students.course_version.course_offering.display_name,
        category: @unit_teacher_to_students.course_version.course_offering.category,
        is_featured: @unit_teacher_to_students.course_version.course_offering.is_featured?,
        course_versions: [
          {
            id: @unit_teacher_to_students.course_version.id,
            version_year: @unit_teacher_to_students.course_version.version_year,
            display_name: @unit_teacher_to_students.course_version.display_name,
            is_stable: true,
            is_recommended: false,
            locales: ["English"],
            units: [{id: @unit_teacher_to_students.id, name: @unit_teacher_to_students.name}]
          },
          {
            id: @unit_teacher_to_students2.course_version.id,
            version_year: @unit_teacher_to_students2.course_version.version_year,
            display_name: @unit_teacher_to_students2.course_version.display_name,
            is_stable: true,
            is_recommended: true,
            locales: ["English"],
            units: [{id: @unit_teacher_to_students2.id, name: @unit_teacher_to_students2.name}]
          }
        ]
      },
      {
        id: @unit_facilitator_to_teacher.course_version.course_offering.id,
        display_name: @unit_facilitator_to_teacher.course_version.course_offering.display_name,
        category: @unit_facilitator_to_teacher.course_version.course_offering.category,
        is_featured: @unit_facilitator_to_teacher.course_version.course_offering.is_featured?,
        course_versions: [
          {
            id: @unit_facilitator_to_teacher.course_version.id,
            version_year: @unit_facilitator_to_teacher.course_version.version_year,
            display_name: @unit_facilitator_to_teacher.course_version.display_name,
            is_stable: true,
            is_recommended: true,
            locales: ["English"],
            units: [{id: @unit_facilitator_to_teacher.id, name: @unit_facilitator_to_teacher.name}]
          }
        ]
      }
    ]

    assert_equal CourseOffering.assignable_course_offerings_info(@facilitator), expected_course_offering_info
  end

  test "can serialize and seed course offerings" do
    course_offering = create :course_offering, key: 'course-offering-1'
    serialization = course_offering.serialize
    previous_course_offering = course_offering.freeze
    course_offering.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_course_offering_key = CourseOffering.seed_record("config/course_offerings/course-offering-1.json")
    new_course_offering = CourseOffering.find_by(key: new_course_offering_key)
    assert_equal previous_course_offering.attributes.except('id', 'created_at', 'updated_at'),
      new_course_offering.attributes.except('id', 'created_at', 'updated_at')
  end

  def course_offering_with_versions(num_versions, content_root_trait=:with_unit_group)
    create :course_offering do |offering|
      create_list :course_version, num_versions, content_root_trait, course_offering: offering
    end
  end
end
