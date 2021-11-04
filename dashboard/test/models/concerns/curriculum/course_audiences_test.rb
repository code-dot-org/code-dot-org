require 'test_helper'

class InstructorAndParticipantAudienceTests < ActiveSupport::TestCase
  setup do
    @student = create :student
    @teacher = create :teacher
    @facilitator = create :facilitator
    @code_instructor = create :code_instructor
    @plc_reviewer = create :plc_reviewer
    @levelbuilder = create :levelbuilder

    @unit_group = create(:unit_group, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.student)
    @unit_in_course = create(:script)
    create(:unit_group_unit, script: @unit_in_course, unit_group: @unit_group, position: 1)
    @unit_in_course.reload

    @course_teacher_to_students = create(:unit_group, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.student)
    @course_facilitator_to_teacher = create(:unit_group, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    @course_code_instructor_to_teacher = create(:unit_group, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.code_instructor, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    @course_plc_reviewer_to_facilitator = create(:unit_group, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator)
    @course_code_instructor_to_teacher = create(:unit_group, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.code_instructor, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)

    @unit_teacher_to_students = create(:script, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.student)
    @unit_facilitator_to_teacher = create(:script, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    @unit_code_instructor_to_teacher = create(:script, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.code_instructor, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    @unit_plc_reviewer_to_facilitator = create(:script, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator)
    @unit_code_instructor_to_teacher = create(:script, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.code_instructor, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
  end

  test 'unit in course should check course for participant and instructor audience' do
    assert_equal @unit_group.can_be_instructor?(@teacher), @unit_in_course.can_be_instructor?(@teacher)
    assert @unit_in_course.can_be_instructor?(@teacher)

    assert_equal @unit_group.can_be_participant?(@teacher), @unit_in_course.can_be_participant?(@teacher)
    assert @unit_in_course.can_be_participant?(@student)
  end

  test 'code instructor should be able to instruct any unit' do
    assert @unit_teacher_to_students.can_be_instructor?(@code_instructor)
    assert @unit_facilitator_to_teacher.can_be_instructor?(@code_instructor)
    assert @unit_code_instructor_to_teacher.can_be_instructor?(@code_instructor)
    assert @unit_plc_reviewer_to_facilitator.can_be_instructor?(@code_instructor)
    assert @unit_code_instructor_to_teacher.can_be_instructor?(@code_instructor)
  end

  test 'levelbuilder should be able to see instructor view for any unit' do
    assert @unit_teacher_to_students.can_be_instructor?(@levelbuilder)
    assert @unit_facilitator_to_teacher.can_be_instructor?(@levelbuilder)
    assert @unit_code_instructor_to_teacher.can_be_instructor?(@levelbuilder)
    assert @unit_plc_reviewer_to_facilitator.can_be_instructor?(@levelbuilder)
    assert @unit_code_instructor_to_teacher.can_be_instructor?(@levelbuilder)
  end

  test 'plc reviewer should be able to instruct units with plc_reviewer as instructor audience ' do
    # Since the plc reviewer is a teacher account it will also be able to teach any teacher course
    assert @unit_teacher_to_students.can_be_instructor?(@plc_reviewer)
    refute @unit_facilitator_to_teacher.can_be_instructor?(@plc_reviewer)
    refute @unit_code_instructor_to_teacher.can_be_instructor?(@plc_reviewer)
    assert @unit_plc_reviewer_to_facilitator.can_be_instructor?(@plc_reviewer)
    refute @unit_code_instructor_to_teacher.can_be_instructor?(@plc_reviewer)
  end

  test 'facilitator should be able to instruct units with facilitator as instructor audience ' do
    # Since the facilitator is a teacher account it will also be able to teach any teacher course
    assert @unit_teacher_to_students.can_be_instructor?(@facilitator)
    assert @unit_facilitator_to_teacher.can_be_instructor?(@facilitator)
    refute @unit_code_instructor_to_teacher.can_be_instructor?(@facilitator)
    refute @unit_plc_reviewer_to_facilitator.can_be_instructor?(@facilitator)
    refute @unit_code_instructor_to_teacher.can_be_instructor?(@facilitator)
  end

  test 'teachers should be able to instruct units with teacher as instructor audience ' do
    assert @unit_teacher_to_students.can_be_instructor?(@teacher)
    refute @unit_facilitator_to_teacher.can_be_instructor?(@teacher)
    refute @unit_code_instructor_to_teacher.can_be_instructor?(@teacher)
    refute @unit_plc_reviewer_to_facilitator.can_be_instructor?(@teacher)
    refute @unit_code_instructor_to_teacher.can_be_instructor?(@teacher)
  end

  test 'students can not instruct units' do
    refute @unit_teacher_to_students.can_be_instructor?(@student)
    refute @unit_facilitator_to_teacher.can_be_instructor?(@student)
    refute @unit_code_instructor_to_teacher.can_be_instructor?(@student)
    refute @unit_plc_reviewer_to_facilitator.can_be_instructor?(@student)
    refute @unit_code_instructor_to_teacher.can_be_instructor?(@student)
  end

  test 'facilitator should be able to participate in units with facilitator as participant audience' do
    # anyone can be a participant in a student unit
    assert @unit_teacher_to_students.can_be_participant?(@facilitator)

    # Since the facilitator is a teacher account it will also be able to participate in any teacher unit
    assert @unit_facilitator_to_teacher.can_be_participant?(@facilitator)
    assert @unit_code_instructor_to_teacher.can_be_participant?(@facilitator)
    assert @unit_code_instructor_to_teacher.can_be_participant?(@facilitator)

    assert @unit_plc_reviewer_to_facilitator.can_be_participant?(@facilitator)
  end

  test 'teacher should be able to participate in units with teacher as participant audience' do
    # anyone can be a participant in a student unit
    assert @unit_teacher_to_students.can_be_participant?(@teacher)

    assert @unit_facilitator_to_teacher.can_be_participant?(@teacher)
    assert @unit_code_instructor_to_teacher.can_be_participant?(@teacher)
    assert @unit_code_instructor_to_teacher.can_be_participant?(@teacher)

    refute @unit_plc_reviewer_to_facilitator.can_be_participant?(@teacher)
  end

  test 'student should be able to participate in units with student as participant audience' do
    assert @unit_teacher_to_students.can_be_participant?(@student)

    refute @unit_facilitator_to_teacher.can_be_participant?(@student)
    refute @unit_code_instructor_to_teacher.can_be_participant?(@student)
    refute @unit_plc_reviewer_to_facilitator.can_be_participant?(@student)
    refute @unit_code_instructor_to_teacher.can_be_participant?(@student)
  end

  test 'code instructor should be able to instruct any course' do
    assert @course_teacher_to_students.can_be_instructor?(@code_instructor)
    assert @course_facilitator_to_teacher.can_be_instructor?(@code_instructor)
    assert @course_code_instructor_to_teacher.can_be_instructor?(@code_instructor)
    assert @course_plc_reviewer_to_facilitator.can_be_instructor?(@code_instructor)
    assert @course_code_instructor_to_teacher.can_be_instructor?(@code_instructor)
  end

  test 'levelbuilder should be able to see instructor view for any course' do
    assert @course_teacher_to_students.can_be_instructor?(@levelbuilder)
    assert @course_facilitator_to_teacher.can_be_instructor?(@levelbuilder)
    assert @course_code_instructor_to_teacher.can_be_instructor?(@levelbuilder)
    assert @course_plc_reviewer_to_facilitator.can_be_instructor?(@levelbuilder)
    assert @course_code_instructor_to_teacher.can_be_instructor?(@levelbuilder)
  end

  test 'plc reviewer should be able to instruct courses with plc_reviewer as instructor audience ' do
    # Since the plc reviewer is a teacher account it will also be able to teach any teacher course
    assert @course_teacher_to_students.can_be_instructor?(@plc_reviewer)
    refute @course_facilitator_to_teacher.can_be_instructor?(@plc_reviewer)
    refute @course_code_instructor_to_teacher.can_be_instructor?(@plc_reviewer)
    assert @course_plc_reviewer_to_facilitator.can_be_instructor?(@plc_reviewer)
    refute @course_code_instructor_to_teacher.can_be_instructor?(@plc_reviewer)
  end

  test 'facilitator should be able to instruct courses with facilitator as instructor audience ' do
    # Since the facilitator is a teacher account it will also be able to teach any teacher course
    assert @course_teacher_to_students.can_be_instructor?(@facilitator)
    assert @course_facilitator_to_teacher.can_be_instructor?(@facilitator)
    refute @course_code_instructor_to_teacher.can_be_instructor?(@facilitator)
    refute @course_plc_reviewer_to_facilitator.can_be_instructor?(@facilitator)
    refute @course_code_instructor_to_teacher.can_be_instructor?(@facilitator)
  end

  test 'teachers should be able to instruct courses with teacher as instructor audience ' do
    assert @course_teacher_to_students.can_be_instructor?(@teacher)
    refute @course_facilitator_to_teacher.can_be_instructor?(@teacher)
    refute @course_code_instructor_to_teacher.can_be_instructor?(@teacher)
    refute @course_plc_reviewer_to_facilitator.can_be_instructor?(@teacher)
    refute @course_code_instructor_to_teacher.can_be_instructor?(@teacher)
  end

  test 'students can not instruct courses' do
    refute @course_teacher_to_students.can_be_instructor?(@student)
    refute @course_facilitator_to_teacher.can_be_instructor?(@student)
    refute @course_code_instructor_to_teacher.can_be_instructor?(@student)
    refute @course_plc_reviewer_to_facilitator.can_be_instructor?(@student)
    refute @course_code_instructor_to_teacher.can_be_instructor?(@student)
  end

  test 'facilitator should be able to participate in courses with facilitator as participant audience' do
    # anyone can be a participant in a student course
    assert @course_teacher_to_students.can_be_participant?(@facilitator)

    # Since the facilitator is a teacher account it will also be able to participate in any teacher course
    assert @course_facilitator_to_teacher.can_be_participant?(@facilitator)
    assert @course_code_instructor_to_teacher.can_be_participant?(@facilitator)
    assert @course_code_instructor_to_teacher.can_be_participant?(@facilitator)

    assert @course_plc_reviewer_to_facilitator.can_be_participant?(@facilitator)
  end

  test 'teacher should be able to participate in courses with teacher as participant audience' do
    # anyone can be a participant in a student course
    assert @course_teacher_to_students.can_be_participant?(@teacher)

    assert @course_facilitator_to_teacher.can_be_participant?(@teacher)
    assert @course_code_instructor_to_teacher.can_be_participant?(@teacher)
    assert @course_code_instructor_to_teacher.can_be_participant?(@teacher)

    refute @course_plc_reviewer_to_facilitator.can_be_participant?(@teacher)
  end

  test 'student should be able to participate in courses with student as participant audience' do
    assert @course_teacher_to_students.can_be_participant?(@student)

    refute @course_facilitator_to_teacher.can_be_participant?(@student)
    refute @course_code_instructor_to_teacher.can_be_participant?(@student)
    refute @course_plc_reviewer_to_facilitator.can_be_participant?(@student)
    refute @course_code_instructor_to_teacher.can_be_participant?(@student)
  end
end
