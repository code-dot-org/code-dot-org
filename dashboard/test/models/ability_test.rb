require 'test_helper'

class AbilityTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @public_script = create(:script).tap do |script|
      @public_script_level = create(:script_level, script: script)
    end

    @login_required_script = create(:script, login_required: true).tap do |script|
      @login_required_script_level = create(:script_level, script: script)
    end

    @login_required_migrated_script = create(:script, login_required: true, is_migrated: true).tap do |script|
      @login_required_migrated_lesson = create(:lesson, script: script, has_lesson_plan: true)
    end
  end

  setup do
    # It's important that we mimic production as closely as possible for these tests
    CDO.stubs(:rack_env).returns(:production)
    Rails.application.config.stubs(:levelbuilder_mode).returns false
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

    assert ability.can?(:read, @public_script)
    assert ability.can?(:read, @login_required_script)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @public_script_level)
    refute ability.can?(:read, @public_script_level, {login_required: "true"})
    refute ability.can?(:read, @login_required_script_level)
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

    assert ability.can?(:read, @public_script)
    assert ability.can?(:read, @login_required_script)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @public_script_level)
    assert ability.can?(:read, @public_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)
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

    assert ability.can?(:read, @public_script)
    assert ability.can?(:read, @login_required_script)

    assert ability.can?(:read, @login_required_migrated_lesson)
    assert ability.can?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.can?(:read, @public_script_level)
    assert ability.can?(:read, @public_script_level, {login_required: "true"})
    assert ability.can?(:read, @login_required_script_level)
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

    assert ability.cannot?(:read, @public_script)
    assert ability.cannot?(:read, @login_required_script)

    assert ability.cannot?(:read, @login_required_migrated_lesson)
    assert ability.cannot?(:student_lesson_plan, @login_required_migrated_lesson)

    assert ability.cannot?(:read, @public_script_level)
    assert ability.cannot?(:read, @login_required_script_level)
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

  test 'student in same CSA code review enabled section and code review group as student seeking code review can view as peer' do
    # We enable read only access to other student work only on Javalab levels
    javalab_script_level = create :script_level,
      levels: [create(:javalab)]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    put_students_in_section_and_code_review_group([project_owner, peer_reviewer], section)
    create :reviewable_project,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id

    assert Ability.new(peer_reviewer).can? :view_as_user, javalab_script_level, project_owner
    assert Ability.new(peer_reviewer).can? :view_as_user_for_code_review, javalab_script_level, project_owner
  end

  test 'student in same CSA code review enabled section and code review group as student seeking code review can view as peer on bubble choice level' do
    javalab_sublevel = create(:javalab)
    bubble_choice_level = create :bubble_choice_level, sublevels: [javalab_sublevel]
    bubble_choice_script_level = create :script_level,
      levels: [bubble_choice_level]

    project_owner = create :student
    peer_reviewer = create :student
    section = create :section, code_review_expires_at: Time.now.utc + 1.day
    put_students_in_section_and_code_review_group([project_owner, peer_reviewer], section)
    create :reviewable_project,
      user_id: project_owner.id,
      script_id: bubble_choice_script_level.script_id,
      level_id: javalab_sublevel.id

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
    create :reviewable_project,
      user_id: project_owner.id,
      script_id: javalab_script_level.script_id,
      level_id: javalab_script_level.levels[0].id

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

  private

  def put_students_in_section_and_code_review_group(students, section)
    code_review_group = create :code_review_group, section: section
    students.each do |student|
      follower = create :follower, student_user: student, section: section
      create :code_review_group_member, follower: follower, code_review_group: code_review_group
    end
  end
end
