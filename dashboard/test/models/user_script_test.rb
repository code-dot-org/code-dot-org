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

  def complete_level(script_level, result = 100)
    @user.track_level_progress_async(script_level: script_level, new_result: result, submitted: false, level_source_id: nil)
  end

  def complete_all_levels
    @script_levels.each do |script_level|
      complete_level(script_level)
    end
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
      complete_level(script_level)
    end

    # attempt some levels
    @script_levels[8..-1].each do |script_level|
      complete_level(script_level, 10)
    end

    assert !@user_script.check_completed?
  end

  test "check completed for script with all levels completed" do
    complete_all_levels
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
end
