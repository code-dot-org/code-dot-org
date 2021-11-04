require 'test_helper'

class Policies::InlineAnswerTest < ActiveSupport::TestCase
  setup_all do
    @authorized_teacher = create :authorized_teacher
    @teacher = create :teacher
    @student = create :student
    @facilitator = create :facilitator
    @code_instructor = create :code_instructor
    @plc_reviewer = create :plc_reviewer
    @levelbuilder = create :levelbuilder

    unit_group = create(:unit_group, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher)
    unit_in_course = create(:script, name: 'unit-in-course')
    create(:unit_group_unit, script: unit_in_course, unit_group: unit_group, position: 1)
    unit_in_course.reload
    @script_level_teacher_instructed_in_course = create(:script_level, script: unit_in_course)

    teacher_instructed_unit = create(:script, name: 'teacher-instructed-unit', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher)
    @script_level_teacher_instructed = create(:script_level, script: teacher_instructed_unit)
    facilitator_instructed_unit = create(:script, name: 'facilitator-instructed-unit', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator)
    @script_level_facilitator_instructed = create(:script_level, script: facilitator_instructed_unit)
    plc_reviewer_instructed_unit = create(:script, name: 'plc-reviewer-instructed-unit', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer)
    @script_level_plc_reviewer_instructed = create(:script_level, script: plc_reviewer_instructed_unit)
    code_instructor_instructed_unit = create(:script, name: 'code-instructor-instructed-unit', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.code_instructor)
    @script_level_code_instructor_instructed = create(:script_level, script: code_instructor_instructed_unit)
  end

  test 'visible? returns true for authorized teachers in unit instructed by teacher' do
    assert Policies::InlineAnswer.visible?(@authorized_teacher, @script_level_teacher_instructed)
  end

  test 'visible? returns true for authorized teachers in course instructed by teacher' do
    assert Policies::InlineAnswer.visible?(@authorized_teacher, @script_level_teacher_instructed_in_course)
  end

  test 'visible? returns true for facilitator in unit instructed by facilitator' do
    assert Policies::InlineAnswer.visible?(@facilitator, @script_level_facilitator_instructed)
  end

  test 'visible? returns true for plc reviewer in unit instructed by plc reviewer' do
    assert Policies::InlineAnswer.visible?(@plc_reviewer, @script_level_plc_reviewer_instructed)
  end

  test 'visible? returns true for code instructor in unit instructed by code instructor' do
    assert Policies::InlineAnswer.visible?(@code_instructor, @script_level_code_instructor_instructed)
  end

  test 'visible? returns false for if user can not instruct unit' do
    refute Policies::InlineAnswer.visible?(@authorized_teacher, @script_level_facilitator_instructed)
  end

  test 'visible? returns true for if teacher in a K5 course' do
    Script.any_instance.stubs(:k5_course?).returns(true)
    assert Policies::InlineAnswer.visible?(@teacher, @script_level_teacher_instructed)
  end

  test 'visible? returns false for non teachers' do
    refute Policies::InlineAnswer.visible?(@student, @script_level_teacher_instructed)
  end

  test 'visible? returns false for non-authorized teachers' do
    refute Policies::InlineAnswer.visible?(@teacher, @script_level_teacher_instructed)
  end

  test 'visible? returns true in levelbuilder' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    assert Policies::InlineAnswer.visible?(@student, nil)
    assert Policies::InlineAnswer.visible?(@student, @script_level_teacher_instructed)
  end

  test 'visible? returns true for all kinds of users if the lesson is in readonly mode for that user' do
    unit_with_readonly = create(:script, name: 'unit-with-readonly')
    script_level = create(:script_level, script: unit_with_readonly)
    create(:user_level, user: @student, level: script_level.level, script: unit_with_readonly, submitted: true, readonly_answers: true)
    assert Policies::InlineAnswer.visible?(@student, script_level)
  end
end
