require 'test_helper'

class AbilityTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @public_teacher_to_student_unit_group = create(:unit_group)
    @public_teacher_to_student_unit = create(:script, name: 'teacher-to-student', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.student).tap do |script|
      @public_teacher_to_student_script_level = create(:script_level, script: script)
    end

    @public_facilitator_to_teacher_unit = create(:script, name: 'facilitator-to-teacher', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher).tap do |script|
      @public_facilitator_to_teacher_script_level = create(:script_level, script: script)
    end

    @public_plc_reviewer_to_facilitator_unit = create(:script, name: 'reviewer-to-facilitator', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator).tap do |script|
      @public_plc_reviewer_to_facilitator_script_level = create(:script_level, script: script)
    end

    @public_universal_instructor_to_teacher_unit = create(:script, name: 'universal-to-teacher', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.universal_instructor, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher).tap do |script|
      @public_universal_instructor_to_teacher_script_level = create(:script_level, script: script)
    end

    @login_required_migrated_script = create(:script, login_required: true, is_migrated: true, name: 'migrated-login-required', instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.student).tap do |script|
      @login_required_migrated_lesson = create(:lesson, script: script, has_lesson_plan: true).tap do |lesson|
        @login_required_script_level = create(:script_level, script: script, lesson: lesson)
      end
    end

    @pilot_course = create(:unit, pilot_experiment: 'my-experiment', published_state: SharedCourseConstants::PUBLISHED_STATE.pilot).tap do |script|
      @pilot_course_script_level = create(:script_level, script: script)
    end

    @pl_pilot_course = create(:unit, pilot_experiment: 'my-experiment', published_state: SharedCourseConstants::PUBLISHED_STATE.pilot, participant_audience: SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator, instructor_audience: SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer).tap do |script|
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
    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.can?(:read, @pilot_course)
    assert ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)

    assert ability.can?(:read, @pilot_course_script_level)
    assert ability.can?(:read, @pl_pilot_course_script_level)
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
    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.can?(:read, @pilot_course)
    assert ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

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
    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.can?(:read, @pilot_course)
    assert ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

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
    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    refute ability.can?(:read, @in_development_script)
    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
    refute ability.can?(:read, @public_teacher_to_student_script_level, {login_required: "true"})
    refute ability.can?(:read, @login_required_script_level)

    refute ability.can?(:read, @pilot_course_script_level)
    refute ability.can?(:read, @pl_pilot_course_script_level)

    assert ability.can?(:read, @public_teacher_to_student_unit_group)
    refute ability.can?(:read, @in_development_unit_group)
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
    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
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
    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @public_teacher_to_student_script_level)
    assert ability.can?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_script_level)
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

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    refute ability.can?(:read, @in_development_script)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

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
    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

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

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    refute ability.can?(:read, @pilot_course)
    refute ability.can?(:read, @pl_pilot_course)

    refute ability.can?(:read, @in_development_script)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

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
  end

  test "as admin" do
    ability = Ability.new(create(:admin))
    assert ability.cannot?(:read, Activity)
    assert ability.cannot?(:read, Game)
    assert ability.cannot?(:read, Level)
    assert ability.cannot?(:read, Script)
    assert ability.cannot?(:read, ScriptLevel)
    assert ability.cannot?(:read, UserLevel)
    assert ability.cannot?(:read, UserScript)
    assert ability.cannot?(:destroy, Game)
    assert ability.cannot?(:destroy, Level)
    assert ability.cannot?(:destroy, Activity)
    assert ability.cannot?(:read, Script.find_by_name('ECSPD'))
    assert ability.cannot?(:read, Script.find_by_name('flappy'))

    assert ability.cannot?(:read, @public_teacher_to_student_unit)
    assert ability.cannot?(:read, @public_facilitator_to_teacher_unit)
    assert ability.cannot?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.cannot?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.cannot?(:read, @pilot_course)
    assert ability.cannot?(:read, @pl_pilot_course)

    assert ability.cannot?(:read, @in_development_script)

    assert ability.cannot?(:read, @login_required_migrated_lesson)
    assert ability.cannot?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.cannot?(:read, @public_teacher_to_student_script_level)
    assert ability.cannot?(:read, @public_facilitator_to_teacher_script_level)
    assert ability.cannot?(:read, @public_universal_instructor_to_teacher_script_level)
    assert ability.cannot?(:read, @public_plc_reviewer_to_facilitator_script_level)
    assert ability.cannot?(:read, @login_required_script_level)

    assert ability.cannot?(:read, @pilot_course_script_level)
    assert ability.cannot?(:read, @pl_pilot_course_script_level)

    assert ability.cannot?(:read, @public_teacher_to_student_unit_group)
    assert ability.cannot?(:read, @in_development_unit_group)
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

    assert ability.can?(:read, Script.find_by_name('ECSPD'))
    assert ability.can?(:read, Script.find_by_name('flappy'))

    assert ability.can?(:read, @public_teacher_to_student_unit)
    assert ability.can?(:read, @public_facilitator_to_teacher_unit)
    assert ability.can?(:read, @public_universal_instructor_to_teacher_unit)
    assert ability.can?(:read, @public_plc_reviewer_to_facilitator_unit)

    assert ability.can?(:read, @pilot_course)
    assert ability.can?(:read, @pl_pilot_course)

    assert ability.can?(:read, @in_development_script)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

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
    refute ability.can?(:manage, Script)
    refute ability.can?(:manage, Lesson)
    refute ability.can?(:manage, ScriptLevel)
    refute ability.can?(:manage, UnitGroup)
  end

  test 'levelbuilders can manage appropriate objects in levelbuilder mode' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    user = create :levelbuilder
    ability = Ability.new user

    assert ability.can?(:manage, Game)
    assert ability.can?(:manage, Level)
    assert ability.can?(:manage, Script)
    assert ability.can?(:manage, Lesson)
    assert ability.can?(:manage, ScriptLevel)
    assert ability.can?(:manage, UnitGroup)
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

  test 'student in same CSA code review enabled section as student seeking code review can view as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_enabled: true
    section.add_student project_owner
    section.add_student peer_reviewer
    create :reviewable_project,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id

    assert Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    assert Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student in same CSA code review enabled section as student seeking code review can view as peer on bubble choice level' do
    javalab_sublevel = create(:javalab)
    bubble_choice_level = create :bubble_choice_level, sublevels: [javalab_sublevel]
    bubble_choice_script_level = create :script_level,
      levels: [bubble_choice_level]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_enabled: true
    section.add_student project_owner
    section.add_student peer_reviewer
    create :reviewable_project,
      user_id: project_owner.id,
      script_id: bubble_choice_script_level.script_id,
      level_id: javalab_sublevel.id

    assert Ability.new(peer_reviewer).can? :view_as_user, bubble_choice_script_level, project_owner, javalab_sublevel
    assert Ability.new(peer_reviewer).can? :view_as_user_for_code_review, bubble_choice_script_level, project_owner, javalab_sublevel
  end

  test 'student in same CSA non code review enabled section as student seeking code review cannot view as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_enabled: false
    section.add_student project_owner
    section.add_student peer_reviewer
    create :reviewable_project,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id

    refute Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    refute Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student not in same section as student seeking code review cannot view as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    create :reviewable_project,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id

    refute Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    refute Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student in same section cannot view as peer if peer is not seeking code review' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_enabled: true
    section.add_student project_owner
    section.add_student peer_reviewer

    refute Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    refute Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student cannot view their own work as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    section = create :section, code_review_enabled: true
    section.add_student project_owner
    create :reviewable_project,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id

    refute Ability.new(project_owner).can? :view_as_user, javalab_script_level, project_owner
    refute Ability.new(project_owner).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'students cannot view as peer on non-Javalab levels' do
    student_1 = create :student
    student_2 = create :student

    refute Ability.new(student_1).can? :view_as_user, @login_required_script_level, student_2
    refute Ability.new(student_1).can? :view_as_user_for_code_review, @login_required_script_level, student_2
  end

  test 'workshop admin can update scholarship info' do
    workshop_admin = create :workshop_admin
    pd_enrollment = create :pd_enrollment

    assert Ability.new(workshop_admin).can? :update_scholarship_info, pd_enrollment
  end
end
