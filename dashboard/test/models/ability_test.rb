require 'test_helper'

class AbilityTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @public_teacher_to_student_unit_group = create(:unit_group, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student) do |unit_group|
      CourseOffering.add_course_offering(unit_group)
      @reference_guide_student_unit_group = create(:reference_guide, course_version: unit_group.course_version)
    end

    @public_teacher_to_student_unit = create(:script, name: 'teacher-to-student', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student).tap do |script|
      @public_teacher_to_student_script_level = create(:script_level, script: script)
    end

    @public_facilitator_to_teacher_unit = create(:script, name: 'facilitator-to-teacher', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher).tap do |script|
      @public_facilitator_to_teacher_script_level = create(:script_level, script: script)
    end

    @public_facilitator_to_teacher_unit_group = create(:unit_group, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher) do |unit_group|
      CourseOffering.add_course_offering(unit_group)
      @reference_guide_teacher_unit_group = create(:reference_guide, course_version: unit_group.course_version)
    end

    @public_plc_reviewer_to_facilitator_unit = create(:script, name: 'reviewer-to-facilitator', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator).tap do |script|
      @public_plc_reviewer_to_facilitator_script_level = create(:script_level, script: script)
    end

    @public_universal_instructor_to_teacher_unit = create(:script, name: 'universal-to-teacher', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.universal_instructor, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher).tap do |script|
      @public_universal_instructor_to_teacher_script_level = create(:script_level, script: script)
    end

    @login_required_migrated_script = create(:script, login_required: true, is_migrated: true, name: 'migrated-login-required', instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student).tap do |script|
      @login_required_migrated_lesson = create(:lesson, script: script, has_lesson_plan: true).tap do |lesson|
        @login_required_script_level = create(:script_level, script: script, lesson: lesson)
      end
    end

    @pilot_course = create(:unit, pilot_experiment: 'my-experiment', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot).tap do |script|
      @pilot_course_script_level = create(:script_level, script: script)
    end

    @pl_pilot_course = create(:unit, pilot_experiment: 'my-experiment', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer).tap do |script|
      @pl_pilot_course_script_level = create(:script_level, script: script)
    end

    @in_development_unit_group = create(:unit_group, published_state: 'in_development')
    @in_development_script = create(:script, published_state: 'in_development').tap do |script|
      @in_development_lesson = create(:lesson, script: script, has_lesson_plan: true)
      @in_development_script_level = create(:script_level, script: script)
    end
  end

  setup do
    # It's important that we mimic production as closely as possible for these tests
    CDO.stubs(:rack_env).returns(:production)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
  end

  test "as pilot teacher" do
    ability = Ability.new(create(:teacher, pilot_experiment: 'my-experiment'))
    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)
    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)
    assert ability.can?(:read, Section)
    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    refute ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    assert ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    refute ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    assert ability.can?(:read, @pilot_course_script_level)
    refute ability.can?(:read, @pl_pilot_course_script_level)
  end

  test "as pilot facilitator" do
    ability = Ability.new(create(:facilitator, pilot_experiment: 'my-experiment'))
    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)
    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)
    assert ability.can?(:read, Section)
    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.can?(:read, @pilot_course)
    assert ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    assert ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    assert ability.can?(:read, @pilot_course_script_level)
    assert ability.can?(:read, @pl_pilot_course_script_level)
  end

  test "as pilot plc reviewer" do
    ability = Ability.new(create(:plc_reviewer, pilot_experiment: 'my-experiment'))
    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)
    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)
    assert ability.can?(:read, Section)
    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.can?(:read, @pilot_course)
    assert ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    assert ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    assert ability.can?(:read, @pilot_course_script_level)
    assert ability.can?(:read, @pl_pilot_course_script_level)
  end

  test "as guest" do
    ability = Ability.new(User.new)
    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)
    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)
    refute ability.can?(:read, Section)
    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    refute ability.can?(:read, @in_development_script)
    assert ability.can?(:read, @public_teacher_to_student_unit)

    refute ability.can?(:read, @public_facilitator_to_teacher_unit)
    refute ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    refute ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    refute ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    refute ability.can?(:read, @public_facilitator_to_teacher_script_level)
    refute ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    refute ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    refute ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    refute ability.can?(:read, @login_required_script_level)

    refute ability.can?(:read, @pilot_course_script_level)
    refute ability.can?(:read, @pl_pilot_course_script_level)

    assert ability.can?(:read, @public_teacher_to_student_unit_group)
    refute ability.can?(:read, @in_development_unit_group)

    refute ability.can?(:read, CourseOffering)
  end

  test "as student" do
    ability = Ability.new(create(:student))
    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)
    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)
    refute ability.can?(:read, Section)
    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    refute ability.can?(:read, @public_facilitator_to_teacher_unit)
    refute ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    refute ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    refute ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    refute ability.can?(:read, @public_facilitator_to_teacher_script_level)
    refute ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    refute ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    refute ability.can?(:read, @pilot_course_script_level)
    refute ability.can?(:read, @pl_pilot_course_script_level)
  end

  test "as teacher" do
    ability = Ability.new(create(:teacher))
    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)
    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)
    assert ability.can?(:read, Section)
    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    refute ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    assert ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    refute ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    refute ability.can?(:read, @pilot_course_script_level)
    refute ability.can?(:read, @pl_pilot_course_script_level)
  end

  test "as facilitator" do
    ability = Ability.new(create(:facilitator))

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)
    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)

    assert ability.can?(:read, Section)

    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    refute ability.can?(:read, @in_development_script)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    assert ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    refute ability.can?(:read, @pilot_course_script_level)
    refute ability.can?(:read, @pl_pilot_course_script_level)

    assert ability.can?(:read, @public_teacher_to_student_unit_group)
    refute ability.can?(:read, @in_development_unit_group)

    refute ability.can?(:read, CourseOffering)
  end

  test "as plc reviewer" do
    ability = Ability.new(create(:facilitator))

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)
    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)
    assert ability.can?(:read, Section)
    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    assert ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    refute ability.can?(:read, @pilot_course_script_level)
    refute ability.can?(:read, @pl_pilot_course_script_level)
  end

  test "as universal instructor" do
    ability = Ability.new(create(:universal_instructor))

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)

    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)

    assert ability.can?(:read, Section)

    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    refute ability.can?(:read, @in_development_script)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    assert ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    refute ability.can?(:read, @pilot_course_script_level)
    refute ability.can?(:read, @pl_pilot_course_script_level)

    assert ability.can?(:read, @public_teacher_to_student_unit_group)
    refute ability.can?(:read, @in_development_unit_group)

    refute ability.can?(:read, CourseOffering)
  end

  test "as admin" do
    ability = Ability.new(create(:admin))
    assert ability.cannot?(:read, Activity)
    assert ability.cannot?(:read, Game)
    assert ability.cannot?(:read, Level)
    assert ability.cannot?(:read, Unit)
    assert ability.cannot?(:read, ScriptLevel)
    assert ability.cannot?(:read, UserLevel)
    assert ability.cannot?(:read, UserScript)
    assert ability.cannot?(:destroy, Game)
    assert ability.cannot?(:destroy, Level)
    assert ability.cannot?(:destroy, Activity)
    assert ability.cannot?(:read, Unit.find_by_name('ECSPD'))
    assert ability.cannot?(:read, Unit.find_by_name('flappy'))

    assert ability.cannot?(:read, @public_teacher_to_student_unit)
    assert ability.cannot?(:read, @public_facilitator_to_teacher_unit)
    assert ability.cannot?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.cannot?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.cannot?(:read, @pilot_course)
    assert ability.cannot?(:read, @pl_pilot_course)

    assert ability.cannot?(:read, @in_development_script)

    assert ability.cannot?(:read, @login_required_migrated_lesson)
    assert ability.cannot?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.cannot?(:read, @reference_guide_student_unit_group)
    assert ability.cannot?(:read, @reference_guide_teacher_unit_group)

    assert ability.cannot?(:read, @public_teacher_to_student_script_level)
    assert ability.cannot?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.cannot?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.cannot?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.cannot?(:read, @login_required_script_level)

    assert ability.cannot?(:read, @pilot_course_script_level)
    assert ability.cannot?(:read, @pl_pilot_course_script_level)

    assert ability.cannot?(:read, @public_teacher_to_student_unit_group)
    assert ability.cannot?(:read, @in_development_unit_group)

    refute ability.can?(:read, CourseOffering)
  end

  test "as levelbuilder" do
    ability = Ability.new(create(:levelbuilder))

    assert ability.can?(:read, Game)
    assert ability.can?(:read, Level)
    assert ability.can?(:read, Activity)

    refute ability.can?(:destroy, Game)
    refute ability.can?(:destroy, Level)
    refute ability.can?(:destroy, Activity)

    assert ability.can?(:read, Section)

    assert ability.can?(:read, Unit.find_by_name('ECSPD'))
    assert ability.can?(:read, Unit.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.can?(:read, @pilot_course)
    assert ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @in_development_script)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @reference_guide_student_unit_group)
    assert ability.can?(:read, @reference_guide_teacher_unit_group)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    assert ability.can?(:read, @pilot_course_script_level)
    assert ability.can?(:read, @pl_pilot_course_script_level)

    assert ability.can?(:read, @public_teacher_to_student_unit_group)
    assert ability.can?(:read, @in_development_unit_group)
  end

  test 'teachers read their Section' do
    teacher = create :teacher
    ability = Ability.new teacher
    my_section = create :section, user_id: teacher.id
    not_my_section = create :section, user_id: create(:teacher).id

    # When checking a class, conditions are ignored.
    # See https://github.com/ryanb/cancan/wiki/checking-abilities#checking-with-class
    assert ability.can? :read, Section

    # A teacher can read their own section.
    assert ability.can? :read, my_section

    # A teacher cannot read another teacher's section.
    assert ability.cannot? :read, not_my_section
  end

  test 'non-admins can read only own UserPermission' do
    user = create :user
    user_permission = UserPermission.create(
      user_id: user.id,
      permission: UserPermission::PROJECT_VALIDATOR
    )
    ability = Ability.new user

    ability.cannot?(:create, UserPermission)
    ability.cannot?(:read, UserPermission)
    ability.cannot?(:update, UserPermission)
    ability.cannot?(:delete, UserPermission)

    ability.can?(:read, user_permission)
    ability.cannot?(:create, user_permission)
    ability.cannot?(:update, user_permission)
    ability.cannot?(:delete, user_permission)
  end

  test 'admins can manage UserPermission' do
    admin_ability = Ability.new(create(:admin))
    assert admin_ability.can?(:manage, UserPermission)
  end

  test 'levelbuilders cannot manage objects when not in levelbuilder mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns false

    user = create :levelbuilder
    ability = Ability.new user

    refute ability.can?(:manage, Game)
    refute ability.can?(:manage, Level)
    refute ability.can?(:manage, Unit)
    refute ability.can?(:manage, Lesson)
    refute ability.can?(:manage, ReferenceGuide)
    refute ability.can?(:manage, ScriptLevel)
    refute ability.can?(:manage, UnitGroup)
  end

  test 'levelbuilders can manage appropriate objects in levelbuilder mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    user = create :levelbuilder
    ability = Ability.new user

    assert ability.can?(:manage, Game)
    assert ability.can?(:manage, Level)
    assert ability.can?(:manage, Unit)
    assert ability.can?(:manage, Lesson)
    assert ability.can?(:manage, ReferenceGuide)
    assert ability.can?(:manage, ScriptLevel)
    assert ability.can?(:manage, UnitGroup)
    assert ability.can?(:manage, CourseOffering)
  end

  test 'teachers can manage feedback for students in a section they own' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student student
    feedback = create :teacher_feedback, student: student, teacher: teacher

    assert Ability.new(teacher).can? :create, feedback
    assert Ability.new(teacher).can? :get_feedback_from_teacher, feedback
  end

  test 'teachers cannot manage feedback for students not in a section they own' do
    teacher = create :teacher
    student = create :student
    section_with_student = create :section
    section_with_student.add_student student

    # teacher section, not the same one that contains the student
    create :section, user: teacher
    feedback = create :teacher_feedback, student: student

    refute Ability.new(teacher).can? :create, feedback
    refute Ability.new(teacher).can? :get_feedback_from_teacher, feedback
  end

  test 'student can get feedback for their work on a level' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student student
    feedback = create :teacher_feedback, student: student

    assert Ability.new(student).can? :get_feedbacks, feedback
  end

  test 'student cannot get feedback for the work of a different student on a level' do
    teacher = create :teacher
    student = create :student
    other_student = create :student
    section = create :section, user: teacher
    section.add_student student
    feedback = create :teacher_feedback, student: student

    refute Ability.new(other_student).can? :get_feedbacks, feedback
  end

  test 'teacher cannot get all the feedback for student work on a level' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student student
    feedback = create :teacher_feedback, student: student

    refute Ability.new(teacher).can? :get_feedbacks, feedback
  end

  test 'teacher can view as user for student in their section' do
    teacher = create :teacher
    student = create :student
    section = create :section, user: teacher
    section.add_student student

    assert Ability.new(teacher).can? :view_as_user, @login_required_script_level, student
  end

  test 'teacher cannot view as user for student not in their section' do
    teacher = create :teacher
    student = create :student

    refute Ability.new(teacher).can? :view_as_user, @login_required_script_level, student
  end

  test 'project validator can view as user for another user' do
    project_validator = create :project_validator
    student = create :student

    assert Ability.new(project_validator).can? :view_as_user, @login_required_script_level, student
  end

  test 'levelbuilder cannot view as user for student' do
    levelbuilder = create :levelbuilder
    student = create :student

    refute Ability.new(levelbuilder).can? :view_as_user, @login_required_script_level, student
  end

  test 'verified teacher can access main javabuilder' do
    verified_teacher = create :authorized_teacher
    assert Ability.new(verified_teacher).can? :use_unrestricted_javabuilder, :javabuilder_session
  end

  test 'student of verified teacher in CSA section can access main javabuilder' do
    teacher = create :authorized_teacher
    csa_script = create :csa_script
    section = create(:section, user: teacher, login_type: 'word', script: csa_script)
    student = create(:follower, section: section).student_user

    assert Ability.new(student).can? :use_unrestricted_javabuilder, :javabuilder_session
  end

  test 'unverified teacher cannot access main javabuilder' do
    teacher = create :teacher
    refute Ability.new(teacher).can? :use_unrestricted_javabuilder, :javabuilder_session
  end

  test 'student in section of unverified teacher cannot access main javabuilder' do
    student = create :student
    section = create :section
    create :follower, section: section, student_user: student
    refute Ability.new(student).can? :use_unrestricted_javabuilder, :javabuilder_session
  end

  test 'student in same CSA code review enabled section and code review group as student seeking code review can view as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    put_students_in_section_and_code_review_group([project_owner, peer_reviewer], section)
    create :code_review,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id,
      project_level_id: javalab_script_level.levels[0].id

    assert Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    assert Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student in same CSA code review enabled section and code review group as student seeking code review (v2) can view as peer on level with project template' do
    # Create two javalab levels that share the same project template level.
    # The first one will be used to create the code review and the second one
    # will be used to check the ability.
    script = create :script
    template_level = create :javalab
    javalab_level_1 = create :javalab, project_template_level_name: template_level.name
    javalab_level_2 = create :javalab, project_template_level_name: template_level.name
    javalab_script_level_2 = create :script_level, script: script,
      levels: [javalab_level_2]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    put_students_in_section_and_code_review_group([project_owner, peer_reviewer], section)
    create :code_review,
      user_id: project_owner.id,
      script_id: script.id,
      level_id: javalab_level_1.id,
      project_level_id: template_level.id

    assert Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level_2, project_owner
    assert Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level_2, project_owner
  end

  test 'student in same CSA code review enabled section and code review group as student seeking code review (v2) can view as peer on bubble choice level' do
    javalab_sublevel = create(:javalab)
    bubble_choice_level = create :bubble_choice_level, sublevels: [javalab_sublevel]
    bubble_choice_script_level = create :script_level,
      levels: [bubble_choice_level]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    put_students_in_section_and_code_review_group([project_owner, peer_reviewer], section)
    create :code_review,
      user_id: project_owner.id,
      script_id: bubble_choice_script_level.script_id,
      level_id: javalab_sublevel.id,
      project_level_id: javalab_sublevel.id

    assert Ability.new(peer_reviewer).can? :view_as_user, bubble_choice_script_level, project_owner, javalab_sublevel
    assert Ability.new(peer_reviewer).can? :view_as_user_for_code_review, bubble_choice_script_level, project_owner, javalab_sublevel
  end

  test 'student in same CSA non code review enabled section and code review group as student seeking code review cannot view as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc - 1.day
    put_students_in_section_and_code_review_group([project_owner, peer_reviewer], section)
    create :code_review,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id,
      project_level_id: javalab_script_level.levels[0].id

    refute Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    refute Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student in same CSA code review enabled section but different code review groups as student seeking code review cannot view as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    put_students_in_section_and_code_review_group([project_owner], section)
    put_students_in_section_and_code_review_group([peer_reviewer], section)
    create :code_review,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id,
      project_level_id: javalab_script_level.levels[0].id

    refute Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    refute Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student not in same section as student seeking code review cannot view as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    create :code_review,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id,
      project_level_id: javalab_script_level.levels[0].id

    refute Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    refute Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student in same section and code review group cannot view as peer if peer is not seeking code review' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    put_students_in_section_and_code_review_group([project_owner, peer_reviewer], section)

    refute Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    refute Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student cannot view their own work as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    put_students_in_section_and_code_review_group([project_owner], section)
    create :code_review,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id,
      project_level_id: javalab_script_level.levels[0].id

    refute Ability.new(project_owner).can? :view_as_user, javalab_script_level, project_owner
    refute Ability.new(project_owner).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'students cannot view as peer on non-Javalab levels' do
    student_1 = create :student
    student_2 = create :student

    refute Ability.new(student_1).can? :view_as_user, @login_required_script_level, student_2
    refute Ability.new(student_1).can? :view_as_user_for_code_review, @login_required_script_level, student_2
  end

  test 'levelbuilders cannot view as peer on non-Javalab levels' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    levelbuilder = create :levelbuilder
    student = create :student

    assert Ability.new(levelbuilder).can? :view_as_user, @login_required_script_level, student
    refute Ability.new(levelbuilder).can? :view_as_user_for_code_review, @login_required_script_level, student
  end

  test 'only the project owner can create a code review on that project' do
    skip 'tests that create a project'
    project_owner = create :student
    other_student = create :student
    project = create :project, owner: project_owner
    other_project = create :project, owner: other_student
    code_review = create :code_review, user_id: project_owner.id, project_id: project.id

    assert Ability.new(project_owner).can? :create, code_review, project
    refute Ability.new(project_owner).can? :create, code_review, other_project
    refute Ability.new(other_student).can? :create, code_review, project
    refute Ability.new(other_student).can? :create, code_review, other_project
  end

  test 'only the code review owner can edit the code review' do
    code_review_owner = create :student
    other_student = create :student
    code_review = create :code_review, user_id: code_review_owner.id

    assert Ability.new(code_review_owner).can? :edit, code_review
    refute Ability.new(other_student).can? :edit, code_review
  end

  test 'who can view code reviews on a given project' do
    skip 'tests that create a project'

    # Create the teacher and 3 students involved in this test.
    teacher = create :teacher
    project_owner = create :student
    student_in_group = create :student
    student_not_in_group = create :student

    # Create a section that's led by the teacher and has all 3 students.
    section = create :section, teacher: teacher
    followers = []
    followers[0] = create :follower, section: section, student_user: project_owner
    followers[1] = create :follower, section: section, student_user: student_in_group
    followers[2] = create :follower, section: section, student_user: student_not_in_group

    # Create a code review group includes 2 students (project_owner and student_in_group)
    code_review_group = create :code_review_group, section: section
    create :code_review_group_member, code_review_group: code_review_group, follower: followers[0]
    create :code_review_group_member, code_review_group: code_review_group, follower: followers[1]

    # Create the project owned by code_review_owner
    project = create :project, owner: project_owner

    # Now we're finally ready to verify who can index code reviews associated the project
    assert Ability.new(teacher).can? :index_code_reviews, project
    assert Ability.new(project_owner).can? :index_code_reviews, project
    assert Ability.new(student_in_group).can? :index_code_reviews, project
    refute Ability.new(student_not_in_group).can? :index_code_reviews, project
  end

  test 'workshop admins can update scholarship info' do
    workshop_admin = create :workshop_admin
    pd_enrollment = create :pd_enrollment

    assert Ability.new(workshop_admin).can? :update_scholarship_info, pd_enrollment
  end

  test 'workshop admins can see, update, and delete incomplete applications' do
    workshop_admin = create :workshop_admin
    incomplete_application = create :pd_teacher_application, status: 'incomplete'

    assert Ability.new(workshop_admin).can? :show, incomplete_application
    assert Ability.new(workshop_admin).can? :update, incomplete_application
    assert Ability.new(workshop_admin).can? :destroy, incomplete_application
  end

  test 'regional partners cannot see, update, or delete incomplete applications' do
    program_manager = create :program_manager
    incomplete_application = create :pd_teacher_application, status: 'incomplete'

    refute Ability.new(program_manager).can? :show, incomplete_application
    refute Ability.new(program_manager).can? :update, incomplete_application
    refute Ability.new(program_manager).can? :destroy, incomplete_application
  end

  test 'users with AI_TUTOR_ACCESS permission can access Open AI chat completion endpoint' do
    ai_tutor_access_user = create :ai_tutor_access
    assert Ability.new(ai_tutor_access_user).can? :chat_completion, :openai_chat
  end

  test 'users with ai tutor access through section enablement can access Open AI chat completion endpoint' do
    student = create :student_with_ai_tutor_access
    assert Ability.new(student).can? :chat_completion, :openai_chat
  end

  test 'user without ai tutor access cannot access Open AI chat completion endpoint' do
    student = create :student_without_ai_tutor_access
    refute Ability.new(student).can? :chat_completion, :openai_chat
  end

  test 'teacher meeting AI Chat access requirements can perform AI Chat actions' do
    teacher = create :teacher
    teacher.stubs(:teacher_can_access_ai_chat?).returns(true)
    [:log_chat_event, :start_chat_completion, :chat_request, :student_chat_history].each do |action|
      assert Ability.new(teacher).can? action, :aichat
    end
  end

  test 'teacher not meeting AI Chat access requirements cannot perform AI Chat actions' do
    teacher = create :teacher
    teacher.stubs(:teacher_can_access_ai_chat?).returns(false)
    [:log_chat_event, :start_chat_completion, :chat_request, :student_chat_history].each do |action|
      refute Ability.new(teacher).can? action, :aichat
    end
  end

  test 'student meeting AI Chat access requirements can perform AI Chat actions' do
    student = create :student
    student.stubs(:student_can_access_ai_chat?).returns(true)
    [:log_chat_event, :start_chat_completion, :chat_request].each do |action|
      assert Ability.new(student).can? action, :aichat
    end
  end

  test 'student not meeting AI Chat access requirements cannot perform AI Chat actions' do
    student = create :student
    student.stubs(:student_can_access_ai_chat?).returns(false)
    [:log_chat_event, :start_chat_completion, :chat_request].each do |action|
      refute Ability.new(student).can? action, :aichat
    end
  end

  private def put_students_in_section_and_code_review_group(students, section)
    code_review_group = create :code_review_group, section: section
    students.each do |student|
      follower = create :follower, student_user: student, section: section
      create :code_review_group_member, follower: follower, code_review_group: code_review_group
    end
  end
end
