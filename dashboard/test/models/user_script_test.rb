require 'test_helper'

class UserScriptTest < ActiveSupport::TestCase
  setup do
    @script = create :script
    @script_levels = 1.upto(10).map do
      create :script_level, script: @script
    end

    @user = create :user
    @user_script = create :user_script, user: @user, script: @script
  end

  test "check completed for script with no levels completed" do
    assert !@user_script.check_completed?
  end

  test "check completed for script with some levels completed" do
    # complete some levels
    create :user_level, user: @user, level: @script_levels.first.level, best_result: 100
    create :user_level, user: @user, level: @script_levels.second.level, best_result: 100

    assert !@user_script.check_completed?
  end

  test "check completed for script with all levels completed but some not passed" do
    # complete some levels
    @script_levels[0...8].each do |script_level|
      user_level = UserLevel.where(user: @user, level: script_level.level).create
      user_level.best_result = 100
      user_level.save
    end

    # attempt some levels
    @script_levels[8..-1].each do |script_level|
      user_level = UserLevel.where(user: @user, level: script_level.level).create
      user_level.best_result = 10
      user_level.save
    end

    assert !@user_script.check_completed?
  end

  test "check completed for script with all levels completed" do
    # complete all levels
    @script_levels.each do |script_level|
      user_level = UserLevel.where(user: @user, level: script_level.level, script: @script).create
      user_level.best_result = 100
      user_level.save
    end

    assert @user_script.check_completed?
  end

  test "empty?" do
    assert UserScript.new.empty?

    # still empty when it has script and user
    assert UserScript.new(user_id: @user.id, script_id: 1).empty?

    # not when you start, complete, assign, or progress in it
    assert !UserScript.new(user_id: @user.id, script_id: 1, started_at: Time.now).empty?
    assert !UserScript.new(user_id: @user.id, script_id: 1, assigned_at: Time.now).empty?

    # the following should be impossible (since you can't complete or
    # progress in a script without starting it, but being impossible
    # doesn't always stop things from happening)
    assert !UserScript.new(user_id: @user.id, script_id: 1, completed_at: Time.now).empty?
    assert !UserScript.new(user_id: @user.id, script_id: 1, last_progress_at: Time.now).empty?

    # a more normal case:
    assert !UserScript.new(user_id: @user.id, script_id: 1,
                              started_at: Time.now - 5.days,
                              completed_at: Time.now,
                              last_progress_at: Time.now).empty?
  end

  test "Completing a script updates script completion levels" do
    #If I have to do this boilerplate setup a lot, put this in a common file
    @script.update(pd: true)
    course = create(:plc_course)
    course_unit = create(:plc_course_unit, plc_course: course)
    learning_module = create(:plc_learning_module, plc_course_unit: course_unit)
    task1 = create(:plc_script_completion_task, plc_learning_modules: [learning_module], script_id: @script.id, name: 'script 1')
    task2 = create(:plc_script_completion_task, plc_learning_modules: [learning_module], script_id: @script.id + 50, name: 'script 2')

    enrollment = Plc::UserCourseEnrollment.create(user: @user, plc_course: course)
    unit_enrollment = Plc::EnrollmentUnitAssignment.create(
      plc_user_course_enrollment: enrollment,
      plc_course_unit: course_unit,
      status: Plc::EnrollmentUnitAssignment::PENDING_EVALUATION
    )
    unit_enrollment.enroll_user_in_unit_with_learning_modules([learning_module])

    #First should be completed, second should not
    task_assignment = unit_enrollment.plc_task_assignments.find_by(plc_task: task1)
    never_completed_task_assignment = unit_enrollment.plc_task_assignments.find_by(plc_task: task2)

    assert_equal 'not_started', task_assignment.status
    @script_levels.each do |script_level|
      user_level = UserLevel.where(user: @user, level: script_level.level, script: @script).create
      user_level.best_result = 100
      user_level.save
      User.track_script_progress(@user, @script)
      task_assignment.reload
      if script_level == @script_levels.last
        assert @user_script.check_completed?
        assert_equal 'completed', task_assignment.status
        assert_equal 'not_started', never_completed_task_assignment.status
      else
        assert !@user_script.check_completed?
        assert_equal 'not_started', task_assignment.status
      end
    end
  end
end
