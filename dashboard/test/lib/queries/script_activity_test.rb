require 'test_helper'

class Queries::ScriptActivityTest < ActiveSupport::TestCase
  setup do
    @user = create(:user)
  end

  test 'user is working on student scripts' do
    s1 = create(:user_script, user: @user, started_at: (Time.now - 10.days), last_progress_at: (Time.now - 4.days))
    s2 = create(:user_script, user: @user, started_at: (Time.now - 50.days), last_progress_at: (Time.now - 3.days))
    c = create(:user_script, user: @user, started_at: (Time.now - 10.days), completed_at: (Time.now - 8.days))

    # all scripts
    assert_equal [s2, s1, c], @user.user_scripts
    assert_equal [s2.script, s1.script, c.script], @user.scripts

    # working on scripts
    assert_equal [s2.script, s1.script], Queries::ScriptActivity.working_on_student_units(@user)

    # add an assigned script that's more recent
    a = create(:user_script, user: @user, started_at: (Time.now - 1.day))
    assert_equal [a.script, s2.script, s1.script], Queries::ScriptActivity.working_on_student_units(@user)

    unit_group = create(:unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    course_script = create(:script)
    create(:unit_group_unit, unit_group: unit_group, script: course_script, position: 1)
    course_script.reload
    create(:user_script, user: @user, started_at: Time.now - 12.hours, script: course_script)
    assert_equal [course_script, a.script, s2.script, s1.script], Queries::ScriptActivity.working_on_student_units(@user)

    # make progress on an older script
    s1.update_attribute(:last_progress_at, Time.now - 3.hours)
    assert_equal [s1.script, course_script, a.script, s2.script], Queries::ScriptActivity.working_on_student_units(@user)
  end

  test 'primary_student_unit_context returns correct unit and unit_group_unit' do
    # Create scripts without original_unit_group so unit_group_unit will be nil
    s1 = create(:user_script, user: @user, script: create(:script), started_at: (Time.now - 10.days), last_progress_at: (Time.now - 4.days))
    s2 = create(:user_script, user: @user, script: create(:script), started_at: (Time.now - 50.days), last_progress_at: (Time.now - 3.days))

    # primary unit context -- most recently progressed in
    context = Queries::ScriptActivity.primary_student_unit_context(@user)
    assert_equal s2.script, context[:unit]
    assert_nil context[:unit_group_unit]

    # add a script with a unit_group
    unit_group = create(:unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    course_script = create(:script)
    unit_group_unit = create(:unit_group_unit, unit_group: unit_group, script: course_script, position: 1)
    course_script.reload
    create(:user_script, user: @user, started_at: Time.now - 12.hours, script: course_script, unit_group: unit_group)

    context = Queries::ScriptActivity.primary_student_unit_context(@user)
    assert_equal course_script, context[:unit]
    assert_equal unit_group_unit, context[:unit_group_unit]

    # make progress on an older script
    s1.update_attribute(:last_progress_at, Time.now - 3.hours)
    context = Queries::ScriptActivity.primary_student_unit_context(@user)
    assert_equal s1.script, context[:unit]
    assert_nil context[:unit_group_unit]
  end

  test 'primary_student_unit_context with UserScript unit_group different from script original_unit_group' do
    original_unit_group = create(:unit_group, name: 'original-course', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    different_unit_group = create(:unit_group, name: 'different-course', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    script = create(:script, original_unit_group: original_unit_group)

    create(:unit_group_unit, unit_group: original_unit_group, script: script, position: 1)
    different_ugu = create(:unit_group_unit, unit_group: different_unit_group, script: script, position: 1)
    script.reload

    # Create a user_script with the different unit_group (not the original)
    user_script = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: script, unit_group: different_unit_group)
    user_script.update!(started_at: Time.now)

    context = Queries::ScriptActivity.primary_student_unit_context(@user)
    assert_equal script, context[:unit]
    # Should return the unit_group_unit for the different_unit_group, not the original
    assert_equal different_ugu, context[:unit_group_unit]
    assert_equal different_unit_group, context[:unit_group_unit].unit_group
  end

  test 'primary_student_unit_context returns nil when user has no activity' do
    context = Queries::ScriptActivity.primary_student_unit_context(@user)
    assert_nil context
  end

  test 'primary_student_unit_context handles multiple user_scripts with different progress' do
    unit_group_1 = create(:unit_group, name: 'course-1', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)
    unit_group_2 = create(:unit_group, name: 'course-2', published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable)

    script_1 = create(:script)
    script_2 = create(:script)

    create(:unit_group_unit, unit_group: unit_group_1, script: script_1, position: 1)
    ugu_2 = create(:unit_group_unit, unit_group: unit_group_2, script: script_2, position: 1)

    script_1.reload
    script_2.reload

    # Create user_scripts with different progress times
    us1 = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: script_1, unit_group: unit_group_1)
    us1.update!(started_at: Time.now - 2.days, last_progress_at: Time.now - 2.days)

    us2 = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: script_2, unit_group: unit_group_2)
    us2.update!(started_at: Time.now - 1.day, last_progress_at: Time.now - 1.day)

    # Should return the most recently progressed script's context
    context = Queries::ScriptActivity.primary_student_unit_context(@user)
    assert_equal script_2, context[:unit]
    assert_equal ugu_2, context[:unit_group_unit]
    assert_equal unit_group_2, context[:unit_group_unit].unit_group
  end

  test 'user is working on pl scripts' do
    teacher = create(:teacher)
    script1 = create(:single_unit_course, :pl_course, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable).first_unit
    script2 = create(:single_unit_course, :pl_course, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable).first_unit
    script3 = create(:single_unit_course, :pl_course, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable).first_unit
    s1 = create(:user_script, user: teacher, script: script1, started_at: (Time.now - 10.days), last_progress_at: (Time.now - 4.days))
    s2 = create(:user_script, user: teacher, script: script2, started_at: (Time.now - 50.days), last_progress_at: (Time.now - 3.days))
    c = create(:user_script, user: teacher, script: script3, started_at: (Time.now - 10.days), completed_at: (Time.now - 8.days))

    # all scripts
    assert_equal [s2, s1, c], teacher.user_scripts
    assert_equal [s2.script, s1.script, c.script], teacher.scripts

    # working on scripts
    assert_equal [s2.script, s1.script], Queries::ScriptActivity.working_on_pl_units(teacher)
    # primary script -- most recently progressed in
    assert_equal s2.script, Queries::ScriptActivity.primary_pl_unit(teacher)

    # add an assigned script that's more recent
    script4 = create(:single_unit_course, :pl_course, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable).first_unit
    a = create(:user_script, user: teacher, script: script4, started_at: (Time.now - 1.day))
    assert_equal [a.script, s2.script, s1.script], Queries::ScriptActivity.working_on_pl_units(teacher)
    assert_equal a.script, Queries::ScriptActivity.primary_pl_unit(teacher)

    unit_group = create(:unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher)
    course_script = create(:script)
    create(:unit_group_unit, unit_group: unit_group, script: course_script, position: 1)
    course_script.reload
    create(:user_script, user: teacher, started_at: Time.now - 12.hours, script: course_script)
    assert_equal [course_script, a.script, s2.script, s1.script], Queries::ScriptActivity.working_on_pl_units(teacher)
    assert_equal course_script, Queries::ScriptActivity.primary_pl_unit(teacher)

    # make progress on an older script
    s1.update_attribute(:last_progress_at, Time.now - 3.hours)
    assert_equal [s1.script, course_script, a.script, s2.script], Queries::ScriptActivity.working_on_pl_units(teacher)
    assert_equal s1.script, Queries::ScriptActivity.primary_pl_unit(teacher)
  end

  test 'in_progress_and_completed_scripts does not include deleted scripts' do
    real_script = Unit.starwars_unit
    fake_script = create(:script)

    user_script_1 = create(:user_script, user: @user, script: real_script)
    user_script_2 = create(:user_script, user: @user, script: fake_script)

    fake_script.destroy!

    # Preconditions for test: The script is gone, but the associated UserScript still exists.
    # If we start failing this setup assertion (that is, we do automated cleanup
    # when deleting a script) then we can probably delete this test.
    refute Unit.exists?(fake_script.id), "Precondition for test: Expected Unit #{fake_script.id} to be deleted."
    assert UserScript.exists?(user_script_2.id), "Precondition for test: Expected UserScript #{user_script_2.id} to still exist."

    # Test: We only get back the userscript for the script that still exists
    scripts = Queries::ScriptActivity.in_progress_and_completed_scripts(@user)
    assert_equal scripts.size, 1
    assert_includes(scripts, user_script_1)
  end
end
