require 'test_helper'

class Queries::ScriptActivityTest < ActiveSupport::TestCase
  setup do
    @user = create :user
  end

  test 'user is working on student scripts' do
    s1 = create :user_script, user: @user, started_at: (Time.now - 10.days), last_progress_at: (Time.now - 4.days)
    s2 = create :user_script, user: @user, started_at: (Time.now - 50.days), last_progress_at: (Time.now - 3.days)
    c = create :user_script, user: @user, started_at: (Time.now - 10.days), completed_at: (Time.now - 8.days)

    # all scripts
    assert_equal [s2, s1, c], @user.user_scripts
    assert_equal [s2.script, s1.script, c.script], @user.scripts

    # working on scripts
    assert_equal [s2.script, s1.script], Queries::ScriptActivity.working_on_student_units(@user)
    # primary script -- most recently progressed in
    assert_equal s2.script, Queries::ScriptActivity.primary_student_unit(@user)

    # add an assigned script that's more recent
    a = create :user_script, user: @user, started_at: (Time.now - 1.day)
    assert_equal [a.script, s2.script, s1.script], Queries::ScriptActivity.working_on_student_units(@user)
    assert_equal a.script, Queries::ScriptActivity.primary_student_unit(@user)

    unit_group = create :unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    course_script = create :script, published_state: nil
    create :unit_group_unit, unit_group: unit_group, script: course_script, position: 1
    course_script.reload
    create :user_script, user: @user, started_at: Time.now - 12.hours, script: course_script
    assert_equal [course_script, a.script, s2.script, s1.script], Queries::ScriptActivity.working_on_student_units(@user)
    assert_equal course_script, Queries::ScriptActivity.primary_student_unit(@user)

    # make progress on an older script
    s1.update_attribute(:last_progress_at, Time.now - 3.hours)
    assert_equal [s1.script, course_script, a.script, s2.script], Queries::ScriptActivity.working_on_student_units(@user)
    assert_equal s1.script, Queries::ScriptActivity.primary_student_unit(@user)
  end

  test 'user is working on pl scripts' do
    teacher = create :teacher
    script1 = create :script, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    script2 = create :script, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    script3 = create :script, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    s1 = create :user_script, user: teacher, script: script1, started_at: (Time.now - 10.days), last_progress_at: (Time.now - 4.days)
    s2 = create :user_script, user: teacher, script: script2, started_at: (Time.now - 50.days), last_progress_at: (Time.now - 3.days)
    c = create :user_script, user: teacher, script: script3, started_at: (Time.now - 10.days), completed_at: (Time.now - 8.days)

    # all scripts
    assert_equal [s2, s1, c], teacher.user_scripts
    assert_equal [s2.script, s1.script, c.script], teacher.scripts

    # working on scripts
    assert_equal [s2.script, s1.script], Queries::ScriptActivity.working_on_pl_units(teacher)
    # primary script -- most recently progressed in
    assert_equal s2.script, Queries::ScriptActivity.primary_pl_unit(teacher)

    # add an assigned script that's more recent
    script4 = create :script, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    a = create :user_script, user: teacher, script: script4, started_at: (Time.now - 1.day)
    assert_equal [a.script, s2.script, s1.script], Queries::ScriptActivity.working_on_pl_units(teacher)
    assert_equal a.script, Queries::ScriptActivity.primary_pl_unit(teacher)

    unit_group = create :unit_group, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable, instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.facilitator, participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
    course_script = create :script, published_state: nil
    create :unit_group_unit, unit_group: unit_group, script: course_script, position: 1
    course_script.reload
    create :user_script, user: teacher, started_at: Time.now - 12.hours, script: course_script
    assert_equal [course_script, a.script, s2.script, s1.script], Queries::ScriptActivity.working_on_pl_units(teacher)
    assert_equal course_script, Queries::ScriptActivity.primary_pl_unit(teacher)

    # make progress on an older script
    s1.update_attribute(:last_progress_at, Time.now - 3.hours)
    assert_equal [s1.script, course_script, a.script, s2.script], Queries::ScriptActivity.working_on_pl_units(teacher)
    assert_equal s1.script, Queries::ScriptActivity.primary_pl_unit(teacher)
  end

  test 'user should prefer working on 20hour instead of hoc' do
    twenty_hour = Unit.twenty_hour_unit
    hoc = Unit.find_by(name: 'hourofcode')

    # do a level that is both in script 1 and hoc
    [twenty_hour, hoc].each do |script|
      UserScript.create! user: @user, script: script
    end

    assert_equal [twenty_hour, hoc], Queries::ScriptActivity.working_on_units(@user)
  end

  test 'in_progress_and_completed_scripts does not include deleted scripts' do
    real_script = Unit.starwars_unit
    fake_script = create :script

    user_script_1 = create :user_script, user: @user, script: real_script
    user_script_2 = create :user_script, user: @user, script: fake_script

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
