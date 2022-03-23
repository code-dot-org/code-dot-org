require 'test_helper'

class CourseTypesTests < ActiveSupport::TestCase
  setup_all do
    @student = create :student
    @teacher = create :teacher
    @facilitator = create :facilitator
    @universal_instructor = create :universal_instructor
    @plc_reviewer = create :plc_reviewer
    @levelbuilder = create :levelbuilder

    # Unit Groups with Units
    @unit_group = create(:unit_group, name: 'course-instructed-by-teacher', family_name: 'teacher-unit-groups')
    @unit_in_course = create(:script, name: 'unit-in-teacher-instructed-course')
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @unit_in_course.reload

    @unit_group_2 = create(:unit_group, name: 'course-instructed-by-teacher-2', family_name: 'teacher-unit-groups')
    @unit_in_course_2 = create(:script, name: 'unit-in-teacher-instructed-course-2')
    create(:unit_group_unit, script: @unit_in_course_2, unit_group: @unit_group_2, position: 1)
    @unit_in_course_2.reload

    # UnitGroups without Units
    @course_teacher_to_students = create(:unit_group, name: 'course-teacher-to-student', family_name: 'teacher-unit-groups')
    @course_facilitator_to_teacher = create(:unit_group, name: 'course-facilitator-to-teacher', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    @course_universal_instructor_to_teacher = create(:unit_group, name: 'course-universal-instructor-to-teacher', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.universal_instructor, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    @course_plc_reviewer_to_facilitator = create(:unit_group, name: 'course-plc-reviewer-to-facilitator', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator)

    # Units not in UnitGroup
    @unit_teacher_to_students = create(:script, name: 'unit-teacher-to-student', family_name: 'teacher-units')
    @unit_facilitator_to_teacher = create(:script, name: 'unit-facilitator-to-teacher', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    @unit_universal_instructor_to_teacher = create(:script, name: 'universal-instructor-to-teacher', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.universal_instructor, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    @unit_plc_reviewer_to_facilitator = create(:script, name: 'plc-reviewer-to-facilitator', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator)

    @unit_teacher_to_students_2 = create(:script, name: 'unit-teacher-to-student-2', family_name: 'teacher-units')
  end

  test 'create unit_group with same audiences raises error' do
    e = assert_raises do
      create(:unit_group, name: 'same-audiences', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    end
    assert_equal "Validation failed: Instructor audience should be different from participant audiences.", e.message
  end
  test 'create script with same audiences raises error' do
    e = assert_raises do
      create(:script, name: 'same-audiences', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    end
    assert_equal "Validation failed: Instructor audience should be different from participant audiences.", e.message
  end

  test 'unit in course should check course for if it is a pl course' do
    assert_equal @unit_group.pl_course?, @unit_in_course.pl_course?
    refute @unit_in_course.pl_course?
  end

  test 'pl_course? returns true for any unit that does not have students as participants' do
    refute @unit_teacher_to_students.pl_course?
    assert @unit_facilitator_to_teacher.pl_course?
    assert @unit_universal_instructor_to_teacher.pl_course?
    assert @unit_plc_reviewer_to_facilitator.pl_course?
  end

  test 'pl_course? returns true for any course that does not have students as participants' do
    refute @course_teacher_to_students.pl_course?
    assert @course_facilitator_to_teacher.pl_course?
    assert @course_universal_instructor_to_teacher.pl_course?
    assert @course_plc_reviewer_to_facilitator.pl_course?
  end

  test 'a signed out user can not be an instructor' do
    refute @unit_group.can_be_instructor?(nil)
    refute @unit_teacher_to_students.can_be_instructor?(nil)
  end

  test 'unit in course should check course for participant and instructor audience' do
    assert_equal @unit_group.can_be_instructor?(@teacher), @unit_in_course.can_be_instructor?(@teacher)
    assert @unit_in_course.can_be_instructor?(@teacher)

    assert_equal @unit_group.can_be_participant?(@teacher), @unit_in_course.can_be_participant?(@teacher)
    assert @unit_in_course.can_be_participant?(@student)
  end

  test 'universal instructor should be able to instruct any unit' do
    assert @unit_teacher_to_students.can_be_instructor?(@universal_instructor)
    assert @unit_facilitator_to_teacher.can_be_instructor?(@universal_instructor)
    assert @unit_universal_instructor_to_teacher.can_be_instructor?(@universal_instructor)
    assert @unit_plc_reviewer_to_facilitator.can_be_instructor?(@universal_instructor)
  end

  test 'levelbuilder should be able to see instructor view for any unit' do
    assert @unit_teacher_to_students.can_be_instructor?(@levelbuilder)
    assert @unit_facilitator_to_teacher.can_be_instructor?(@levelbuilder)
    assert @unit_universal_instructor_to_teacher.can_be_instructor?(@levelbuilder)
    assert @unit_plc_reviewer_to_facilitator.can_be_instructor?(@levelbuilder)
  end

  test 'plc reviewer should be able to instruct units with plc_reviewer as instructor audience ' do
    # Since the plc reviewer is a teacher account it will also be able to teach any teacher course
    assert @unit_teacher_to_students.can_be_instructor?(@plc_reviewer)
    refute @unit_facilitator_to_teacher.can_be_instructor?(@plc_reviewer)
    refute @unit_universal_instructor_to_teacher.can_be_instructor?(@plc_reviewer)
    assert @unit_plc_reviewer_to_facilitator.can_be_instructor?(@plc_reviewer)
  end

  test 'facilitator should be able to instruct units with facilitator as instructor audience ' do
    # Since the facilitator is a teacher account it will also be able to teach any teacher course
    assert @unit_teacher_to_students.can_be_instructor?(@facilitator)
    assert @unit_facilitator_to_teacher.can_be_instructor?(@facilitator)
    refute @unit_universal_instructor_to_teacher.can_be_instructor?(@facilitator)
    refute @unit_plc_reviewer_to_facilitator.can_be_instructor?(@facilitator)
  end

  test 'teachers should be able to instruct units with teacher as instructor audience ' do
    assert @unit_teacher_to_students.can_be_instructor?(@teacher)
    refute @unit_facilitator_to_teacher.can_be_instructor?(@teacher)
    refute @unit_universal_instructor_to_teacher.can_be_instructor?(@teacher)
    refute @unit_plc_reviewer_to_facilitator.can_be_instructor?(@teacher)
  end

  test 'students can not instruct units' do
    refute @unit_teacher_to_students.can_be_instructor?(@student)
    refute @unit_facilitator_to_teacher.can_be_instructor?(@student)
    refute @unit_universal_instructor_to_teacher.can_be_instructor?(@student)
    refute @unit_plc_reviewer_to_facilitator.can_be_instructor?(@student)
  end

  test 'facilitator should be able to participate in units with facilitator as participant audience' do
    refute @unit_teacher_to_students.can_be_participant?(@facilitator)
    refute @unit_facilitator_to_teacher.can_be_participant?(@facilitator)

    assert @unit_universal_instructor_to_teacher.can_be_participant?(@facilitator)
    assert @unit_plc_reviewer_to_facilitator.can_be_participant?(@facilitator)
  end

  test 'teacher should be able to participate in units with teacher as participant audience' do
    refute @unit_teacher_to_students.can_be_participant?(@teacher)

    assert @unit_facilitator_to_teacher.can_be_participant?(@teacher)
    assert @unit_universal_instructor_to_teacher.can_be_participant?(@teacher)

    refute @unit_plc_reviewer_to_facilitator.can_be_participant?(@teacher)
  end

  test 'student should be able to participate in units with student as participant audience' do
    assert @unit_teacher_to_students.can_be_participant?(@student)

    refute @unit_facilitator_to_teacher.can_be_participant?(@student)
    refute @unit_universal_instructor_to_teacher.can_be_participant?(@student)
    refute @unit_plc_reviewer_to_facilitator.can_be_participant?(@student)
  end

  test 'universal instructor should be able to instruct any course' do
    assert @course_teacher_to_students.can_be_instructor?(@universal_instructor)
    assert @course_facilitator_to_teacher.can_be_instructor?(@universal_instructor)
    assert @course_universal_instructor_to_teacher.can_be_instructor?(@universal_instructor)
    assert @course_plc_reviewer_to_facilitator.can_be_instructor?(@universal_instructor)
  end

  test 'levelbuilder should be able to see instructor view for any course' do
    assert @course_teacher_to_students.can_be_instructor?(@levelbuilder)
    assert @course_facilitator_to_teacher.can_be_instructor?(@levelbuilder)
    assert @course_universal_instructor_to_teacher.can_be_instructor?(@levelbuilder)
    assert @course_plc_reviewer_to_facilitator.can_be_instructor?(@levelbuilder)
  end

  test 'plc reviewer should be able to instruct courses with plc_reviewer as instructor audience ' do
    # Since the plc reviewer is a teacher account it will also be able to teach any teacher course
    assert @course_teacher_to_students.can_be_instructor?(@plc_reviewer)
    refute @course_facilitator_to_teacher.can_be_instructor?(@plc_reviewer)
    refute @course_universal_instructor_to_teacher.can_be_instructor?(@plc_reviewer)
    assert @course_plc_reviewer_to_facilitator.can_be_instructor?(@plc_reviewer)
  end

  test 'facilitator should be able to instruct courses with facilitator as instructor audience ' do
    # Since the facilitator is a teacher account it will also be able to teach any teacher course
    assert @course_teacher_to_students.can_be_instructor?(@facilitator)
    assert @course_facilitator_to_teacher.can_be_instructor?(@facilitator)
    refute @course_universal_instructor_to_teacher.can_be_instructor?(@facilitator)
    refute @course_plc_reviewer_to_facilitator.can_be_instructor?(@facilitator)
  end

  test 'teachers should be able to instruct courses with teacher as instructor audience ' do
    assert @course_teacher_to_students.can_be_instructor?(@teacher)
    refute @course_facilitator_to_teacher.can_be_instructor?(@teacher)
    refute @course_universal_instructor_to_teacher.can_be_instructor?(@teacher)
    refute @course_plc_reviewer_to_facilitator.can_be_instructor?(@teacher)
  end

  test 'students can not instruct courses' do
    refute @course_teacher_to_students.can_be_instructor?(@student)
    refute @course_facilitator_to_teacher.can_be_instructor?(@student)
    refute @course_universal_instructor_to_teacher.can_be_instructor?(@student)
    refute @course_plc_reviewer_to_facilitator.can_be_instructor?(@student)
  end

  test 'facilitator should be able to participate in courses with facilitator as participant audience' do
    refute @course_teacher_to_students.can_be_participant?(@facilitator)
    refute @course_facilitator_to_teacher.can_be_participant?(@facilitator)

    assert @course_universal_instructor_to_teacher.can_be_participant?(@facilitator)
    assert @course_plc_reviewer_to_facilitator.can_be_participant?(@facilitator)
  end

  test 'teacher should be able to participate in courses with teacher as participant audience' do
    refute @course_teacher_to_students.can_be_participant?(@teacher)

    assert @course_facilitator_to_teacher.can_be_participant?(@teacher)
    assert @course_universal_instructor_to_teacher.can_be_participant?(@teacher)

    refute @course_plc_reviewer_to_facilitator.can_be_participant?(@teacher)
  end

  test 'student should be able to participate in courses with student as participant audience' do
    assert @course_teacher_to_students.can_be_participant?(@student)

    refute @course_facilitator_to_teacher.can_be_participant?(@student)
    refute @course_universal_instructor_to_teacher.can_be_participant?(@student)
    refute @course_plc_reviewer_to_facilitator.can_be_participant?(@student)
  end

  test 'signed out users should be able to participate in courses with student as participant audience' do
    assert @course_teacher_to_students.can_be_participant?(nil)

    refute @course_facilitator_to_teacher.can_be_participant?(nil)
    refute @course_universal_instructor_to_teacher.can_be_participant?(nil)
    refute @course_plc_reviewer_to_facilitator.can_be_participant?(nil)
  end

  test 'get_family_courses should get all UnitGroups with the same family name if called for UnitGroup' do
    assert_equal @unit_group_2.get_family_courses.map(&:name).sort!, ['course-instructed-by-teacher', 'course-instructed-by-teacher-2', 'course-teacher-to-student']
  end

  test 'get_family_courses should get all Unit with the same family name if called for Unit not in UnitGroup' do
    assert_equal @unit_teacher_to_students_2.get_family_courses.map(&:name).sort!, ['unit-teacher-to-student', 'unit-teacher-to-student-2']
  end

  test 'get_family_courses should return nil if there is no family name' do
    unit_without_family_name = create :script, name: 'no-family-name'
    assert_equal unit_without_family_name.get_family_courses, nil
  end

  test 'should raise error if instruction type does not match rest of course family' do
    error = assert_raises do
      @unit_group_2.instruction_type = SharedCourseConstants::INSTRUCTION_TYPE.self_paced
      @unit_group_2.save!
    end

    assert_includes error.message, 'Instruction type must be the same for all courses in a family.'
  end

  test 'should raise error if instructor audience does not match rest of course family' do
    error = assert_raises do
      @unit_group_2.instructor_audience = SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator
      @unit_group_2.save!
    end

    assert_includes error.message, 'Instructor audience must be the same for all courses in a family.'
  end

  test 'should raise error if participant audience does not match rest of course family' do
    error = assert_raises do
      @unit_group_2.participant_audience = SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator
      @unit_group_2.save!
    end

    assert_includes error.message, 'Participant audience must be the same for all courses in a family.'
  end

  test 'should not raise error when changing course type values for a course that is the only one in its family' do
    solo_unit_in_family_name = create :script, name: 'solo-family-name', family_name: 'solo-family-name'
    assert_nothing_raised do
      solo_unit_in_family_name.participant_audience = SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator
      solo_unit_in_family_name.save!
    end
  end

  # A unit without a family is in a unit group
  test 'should not raise error when changing unit wihtout family' do
    unit_without_family_name = create :script, name: 'solo-family-name', family_name: nil
    assert_nothing_raised do
      unit_without_family_name.participant_audience = SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator
      unit_without_family_name.save!
    end
  end
end
