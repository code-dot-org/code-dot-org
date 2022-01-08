require 'test_helper'

class CourseTypesTests < ActiveSupport::TestCase
  setup_all do
    @student = create :student
    @teacher = create :teacher
    @facilitator = create :facilitator
    @universal_instructor = create :universal_instructor
    @plc_reviewer = create :plc_reviewer
    @levelbuilder = create :levelbuilder

    @unit_group = create(:unit_group, name: 'course-instructed-by-teacher', family_name: 'family-1', version_year: '1991', published_state: 'stable')
    @unit_in_course = create(:script, name: 'unit-in-teacher-instructed-course')
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @unit_in_course.reload
    @unit_group.reload
    CourseOffering.add_course_offering(@unit_group)

    @unit_teacher_to_students = create(:script, name: 'unit-teacher-to-student', family_name: 'family-2', version_year: '1991', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(@unit_teacher_to_students)
    @unit_teacher_to_students2 = create(:script, name: 'unit-teacher-to-student2', family_name: 'family-2', version_year: '1992', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(@unit_teacher_to_students2)
    @unit_facilitator_to_teacher = create(:script, name: 'unit-facilitator-to-teacher', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher, family_name: 'family-3', version_year: '1991', is_course: true, published_state: 'stable')
    CourseOffering.add_course_offering(@unit_facilitator_to_teacher)
  end

  test 'item_assignable? is true if item is launched' do
    launched_course = create(:script, published_state: 'stable')
    assert launched_course.item_assignable?(@teacher)
  end

  test 'item_assignable? is false if published state is beta' do
    beta_course = create(:script, published_state: 'beta')
    refute beta_course.item_assignable?(@teacher)
  end

  test 'item_assignable? is false if can not be instructor of course' do
    pl_course = create :script, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher

    refute pl_course.item_assignable?(@teacher)
  end

  test 'item_assignable? is true if user has pilot access to item' do
    pilot_teacher = create :teacher, pilot_experiment: 'my-experiment'
    pilot_course = create :script, pilot_experiment: 'my-experiment'

    assert pilot_course.item_assignable?(pilot_teacher)
  end

  test 'item_assignable? is false if user does not have pilot access to item' do
    pilot_course = create :script, pilot_experiment: 'my-experiment'

    refute pilot_course.item_assignable?(@teacher)
  end

  test 'item_assignable? if levelbuilder and item is in development' do
    in_development_course = create(:script, published_state: 'in_development')
    assert in_development_course.item_assignable?(@levelbuilder)
  end

  test 'item_assignable? is false if not a levelbuilder and item is in development' do
    in_development_course = create(:script, published_state: 'in_development')
    refute in_development_course.item_assignable?(@teacher)
  end

  test 'get assignable pl course offerings for teacher should return no offerings' do
    assert_equal Curriculum::AssignableCourseOffering.assignable_pl_course_offerings(@teacher).length, 0
  end

  test 'get assignable course offerings for student should return no offerings' do
    assert_equal Curriculum::AssignableCourseOffering.assignable_course_offerings(@student).length, 0
  end

  test 'get assignable course offerings for teacher should return offerings where teacher can be instructor' do
    expected_course_offering_info = [{
      id: @unit_teacher_to_students.course_version.course_offering.id,
      display_name: @unit_teacher_to_students.course_version.course_offering.display_name,
      course_versions: [
        {
          id: @unit_teacher_to_students.course_version.id,
          display_name: @unit_teacher_to_students.course_version.display_name,
          units: [{id: @unit_teacher_to_students.id, name: @unit_teacher_to_students.name}]
        },
        {
          id: @unit_teacher_to_students2.course_version.id,
          display_name: @unit_teacher_to_students2.course_version.display_name,
          units: [{id: @unit_teacher_to_students2.id, name: @unit_teacher_to_students2.name}]
        }
      ]
    }]

    assert_equal Curriculum::AssignableCourseOffering.assignable_course_offerings_info(@teacher), expected_course_offering_info
  end

  test 'get assignable pl course offerings for facilitator should return pl offerings where facilitator can be instructor' do
    expected_course_offering_info = [{
      id: @unit_facilitator_to_teacher.course_version.course_offering.id,
      display_name: @unit_facilitator_to_teacher.course_version.course_offering.display_name,
      course_versions: [
        {
          id: @unit_facilitator_to_teacher.course_version.id,
          display_name: @unit_facilitator_to_teacher.course_version.display_name,
          units: [{id: @unit_facilitator_to_teacher.id, name: @unit_facilitator_to_teacher.name}]
        }
      ]
    }]

    assert_equal Curriculum::AssignableCourseOffering.assignable_pl_course_offerings_info(@facilitator), expected_course_offering_info
  end

  test 'get assignable course offerings for facilitator should return all offerings where facilitator can be instructor' do
    expected_course_offering_info = [
      {
        id: @unit_teacher_to_students.course_version.course_offering.id,
        display_name: @unit_teacher_to_students.course_version.course_offering.display_name,
        course_versions: [
          {
            id: @unit_teacher_to_students.course_version.id,
            display_name: @unit_teacher_to_students.course_version.display_name,
            units: [{id: @unit_teacher_to_students.id, name: @unit_teacher_to_students.name}]
          },
          {
            id: @unit_teacher_to_students2.course_version.id,
            display_name: @unit_teacher_to_students2.course_version.display_name,
            units: [{id: @unit_teacher_to_students2.id, name: @unit_teacher_to_students2.name}]
          }
        ]
      },
      {
        id: @unit_facilitator_to_teacher.course_version.course_offering.id,
        display_name: @unit_facilitator_to_teacher.course_version.course_offering.display_name,
        course_versions: [
          {
            id: @unit_facilitator_to_teacher.course_version.id,
            display_name: @unit_facilitator_to_teacher.course_version.display_name,
            units: [{id: @unit_facilitator_to_teacher.id, name: @unit_facilitator_to_teacher.name}]
          }
        ]
      }
    ]

    assert_equal Curriculum::AssignableCourseOffering.assignable_pl_course_offerings_info(@facilitator), expected_course_offering_info
  end
end
