require 'test_helper'

class Policies::InlineAnswerTest < ActiveSupport::TestCase
  setup_all do
    @authorized_teacher = create :authorized_teacher
    @teacher = create :teacher
    @student = create :student
    @facilitator = create :facilitator
    @universal_instructor = create :universal_instructor
    @plc_reviewer = create :plc_reviewer
    @levelbuilder = create :levelbuilder

    unit_group = create(:unit_group, name: 'teacher-instructed-course', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher)
    @unit_in_course = create(:script, name: 'unit-in-course')
    create(:unit_group_unit, script: @unit_in_course, unit_group: unit_group, position: 1)
    @unit_in_course.reload
    @script_level_teacher_instructed_in_course = create(:script_level, script: @unit_in_course)

    @teacher_instructed_unit = create(:script, name: 'teacher-instructed-unit', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher)
    @script_level_teacher_instructed = create(:script_level, script: @teacher_instructed_unit)
    @facilitator_instructed_unit = create(:script, name: 'facilitator-instructed-unit', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator)
    @script_level_facilitator_instructed = create(:script_level, script: @facilitator_instructed_unit)
    @plc_reviewer_instructed_unit = create(:script, name: 'plc-reviewer-instructed-unit', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer)
    @script_level_plc_reviewer_instructed = create(:script_level, script: @plc_reviewer_instructed_unit)
    @universal_instructor_instructed_unit = create(:script, name: 'universal-instructor-instructed-unit', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.universal_instructor)
    @script_level_universal_instructor_instructed = create(:script_level, script: @universal_instructor_instructed_unit)

    @plc_models_script = create(:script, name: 'old-style-pl-course', professional_learning_course: true)
  end

  test 'visible_for_script_level? returns true for authorized teachers in unit instructed by teacher' do
    assert Policies::InlineAnswer.visible_for_script_level?(@authorized_teacher, @script_level_teacher_instructed)
  end

  test 'visible_for_script_level? returns true for authorized teachers in course instructed by teacher' do
    assert Policies::InlineAnswer.visible_for_script_level?(@authorized_teacher, @script_level_teacher_instructed_in_course)
  end

  test 'visible_for_script_level? returns true for facilitator in unit instructed by facilitator' do
    assert Policies::InlineAnswer.visible_for_script_level?(@facilitator, @script_level_facilitator_instructed)
  end

  test 'visible_for_script_level? returns true for plc reviewer in unit instructed by plc reviewer' do
    assert Policies::InlineAnswer.visible_for_script_level?(@plc_reviewer, @script_level_plc_reviewer_instructed)
  end

  test 'visible_for_script_level? returns true for universal instructor in unit instructed by universal instructor' do
    assert Policies::InlineAnswer.visible_for_script_level?(@universal_instructor, @script_level_universal_instructor_instructed)
  end

  test 'visible_for_script_level? returns false for if user can not instruct unit' do
    refute Policies::InlineAnswer.visible_for_script_level?(@authorized_teacher, @script_level_facilitator_instructed)
  end

  test 'visible_for_script_level? returns true for if teacher in a K5 course' do
    Script.any_instance.stubs(:k5_course?).returns(true)
    assert Policies::InlineAnswer.visible_for_script_level?(@teacher, @script_level_teacher_instructed)
  end

  test 'visible_for_script_level? returns true for if verified instructor and can view as instructor in training' do
    User.any_instance.stubs(:verified_instructor?).returns(true)
    ScriptLevel.any_instance.stubs(:view_as_instructor_in_training?).returns(true)
    assert Policies::InlineAnswer.visible_for_script_level?(@teacher, @script_level_facilitator_instructed)
  end

  test 'visible_for_script_level? returns false for non teachers' do
    refute Policies::InlineAnswer.visible_for_script_level?(@student, @script_level_teacher_instructed)
  end

  test 'visible_for_script_level? returns false for non-authorized teachers' do
    refute Policies::InlineAnswer.visible_for_script_level?(@teacher, @script_level_teacher_instructed)
  end

  test 'visible_for_script_level? returns false for signed out user' do
    refute Policies::InlineAnswer.visible_for_script_level?(nil, @script_level_teacher_instructed)
  end

  test 'visible_for_script_level? returns true in levelbuilder' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    assert Policies::InlineAnswer.visible_for_script_level?(@student, nil)
    assert Policies::InlineAnswer.visible_for_script_level?(@student, @script_level_teacher_instructed)
  end

  test 'visible_for_script_level? returns false for PLC courses which use the PLC Course models (even for authorized teachers)' do
    refute Policies::InlineAnswer.visible_for_script_level?(@authorized_teacher, create(:script_level, script: @plc_models_script))
  end

  test 'visible_for_script_level? returns true for all kinds of users if the lesson is in readonly mode for that user' do
    unit_with_readonly = create(:script, name: 'unit-with-readonly')
    script_level = create(:script_level, script: unit_with_readonly)
    create(:user_level, user: @student, level: script_level.level, script: unit_with_readonly, submitted: true, readonly_answers: true)
    assert Policies::InlineAnswer.visible_for_script_level?(@student, script_level)
  end

  test 'visible_for_unit? returns true for authorized teachers in unit instructed by teacher' do
    assert Policies::InlineAnswer.visible_for_unit?(@authorized_teacher, @teacher_instructed_unit)
  end

  test 'visible_for_unit? returns true for authorized teachers in course instructed by teacher' do
    assert Policies::InlineAnswer.visible_for_unit?(@authorized_teacher, @unit_in_course)
  end

  test 'visible_for_unit? returns true for facilitator in unit instructed by facilitator' do
    assert Policies::InlineAnswer.visible_for_unit?(@facilitator, @facilitator_instructed_unit)
  end

  test 'visible_for_unit? returns true for plc reviewer in unit instructed by plc reviewer' do
    assert Policies::InlineAnswer.visible_for_unit?(@plc_reviewer, @plc_reviewer_instructed_unit)
  end

  test 'visible_for_unit? returns true for universal instructor in unit instructed by universal instructor' do
    assert Policies::InlineAnswer.visible_for_unit?(@universal_instructor, @universal_instructor_instructed_unit)
  end

  test 'visible_for_unit? returns false for if user can not instruct unit' do
    refute Policies::InlineAnswer.visible_for_unit?(@authorized_teacher, @facilitator_instructed_unit)
  end

  test 'visible_for_unit? returns true for if teacher in a K5 course' do
    Script.any_instance.stubs(:k5_course?).returns(true)
    assert Policies::InlineAnswer.visible_for_unit?(@teacher, @teacher_instructed_unit)
  end

  test 'visible_for_unit? returns false for non teachers' do
    refute Policies::InlineAnswer.visible_for_unit?(@student, @teacher_instructed_unit)
  end

  test 'visible_for_unit? returns false for non-authorized teachers' do
    refute Policies::InlineAnswer.visible_for_unit?(@teacher, @teacher_instructed_unit)
  end

  test 'visible_for_unit? returns false for signed out user' do
    refute Policies::InlineAnswer.visible_for_unit?(nil, @teacher_instructed_unit)
  end

  test 'visible_for_unit? returns true in levelbuilder' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    assert Policies::InlineAnswer.visible_for_unit?(@student, nil)
    assert Policies::InlineAnswer.visible_for_unit?(@student, @teacher_instructed_unit)
  end

  test 'visible_for_unit? returns false for PLC courses which use the PLC Course models (even for authorized teachers)' do
    refute Policies::InlineAnswer.visible_for_unit?(@authorized_teacher, @plc_models_script)
  end
end
