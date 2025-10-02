require 'test_helper'

class UserScriptTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @script = create(:script, :in_single_unit_course)
    @unit_group = create(:unit_group, :with_unit, unit: @script)
    @lesson_group = create(:lesson_group, script: @script)
    @lesson = create(:lesson, script: @script, lesson_group: @lesson_group)
    @script_levels = 1.upto(10).map do
      create(:script_level, script: @script, lesson: @lesson)
    end
  end

  setup do
    @user = create(:user)
    @user_script = create(:user_script, user: @user, script: @script)
  end

  def complete_level(script_level, unit_group, result = 100)
    User.track_level_progress(user_id: @user.id, script_id: script_level.script.id, new_result: result, submitted: false, level_source_id: nil, level_id: script_level.oldest_active_level.id, unit_group: unit_group)
  end

  def complete_all_levels
    @script_levels.each do |script_level|
      complete_level(script_level, @unit_group)
    end
  end

  test "check completed for script with no levels completed" do
    refute @user_script.check_completed?
  end

  test "check completed for script with some levels completed" do
    # complete some levels
    create(:user_level, user: @user, level: @script_levels.first.level, best_result: 100)
    create(:user_level, user: @user, level: @script_levels.second.level, best_result: 100)

    refute @user_script.check_completed?
  end

  test "check completed for script with all levels completed but some not passed" do
    # complete some levels
    @script_levels[0...8].each do |script_level|
      complete_level(script_level, @unit_group)
    end

    # attempt some levels
    @script_levels[8..].each do |script_level|
      complete_level(script_level, @unit_group, 10)
    end

    refute @user_script.check_completed?
  end

  test "check completed for script with all levels completed" do
    complete_all_levels
    assert @user_script.check_completed?
  end

  test "check completed for soft-deleted users" do
    complete_all_levels
    @user.destroy
    refute @user_script.reload.check_completed?
  end

  test "empty?" do
    assert UserScript.new.empty?

    # still empty when it has script and user
    assert UserScript.new(user_id: @user.id, script_id: 1).empty?

    # not when you start, complete, assign, or progress in it
    refute UserScript.new(user_id: @user.id, script_id: 1, started_at: Time.now).empty?
    refute UserScript.new(user_id: @user.id, script_id: 1, assigned_at: Time.now).empty?

    # a more normal case:
    refute UserScript.new(
      user_id: @user.id,
      script_id: 1,
      started_at: Time.now - 5.days,
      completed_at: Time.now,
      last_progress_at: Time.now
    ).empty?
  end

  test "lookup hash" do
    assert_equal ({'foo' => false, @script.name => true}), UserScript.lookup_hash(@user, ['foo', @script.name])
  end
end

# Additional tests for find_and_migrate_or_create_by!
class UserScriptFindAndMigrateMethodsTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup do
    @user = create(:user)

    # Unit with an original unit group
    @unit_in_course = create(:script, :in_single_unit_course)
    @original_unit_group = @unit_in_course.original_unit_group

    # Add a non-original unit group that also contains the unit
    @other_unit_group = create(:single_unit_course, :stable, unit: @unit_in_course)
    @unit_in_course.reload

    # Unit with no original unit group
    @unit_without_course = create(:script)
  end

  test "find_and_migrate_or_create_by! raises when provided unit_group is not in unit" do
    bogus_unit_group = create(:unit_group)

    error = assert_raises RuntimeError do
      UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course, unit_group: bogus_unit_group)
    end
    assert_match(/Unit .* must belong to Unit Group .*/, error.message)
  end

  test "find_and_migrate_or_create_by! finds or creates for non-original unit_group without migration" do
    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course, unit_group: @other_unit_group)
    assert_equal @other_unit_group, result.unit_group

    result2 = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course, unit_group: @other_unit_group)
    assert_equal result.id, result2.id
  end

  test "find_and_migrate_or_create_by! creates with nil unit_group when unit has no original unit_group" do
    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_without_course, unit_group: nil)

    assert_nil result.unit_group
    assert_equal @unit_without_course, result.script
    assert_equal @user, result.user
  end

  test "find_and_migrate_or_create_by! migrates when no unit group is given" do
    us = UserScript.create!(user: @user, script: @unit_in_course, unit_group: nil)

    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course)

    assert_equal us.id, result.id
    assert_equal @original_unit_group, result.unit_group
  end

  test "find_and_migrate_or_create_by! migrates when original unit group is given" do
    us = UserScript.create!(user: @user, script: @unit_in_course, unit_group: nil)

    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course, unit_group: @original_unit_group)

    assert_equal us.id, result.id
    assert_equal @original_unit_group, result.unit_group
  end

  test "find_and_migrate_or_create_by! migrates to non-original unit group when specified" do
    us = UserScript.create!(user: @user, script: @unit_in_course, unit_group: nil)

    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course, unit_group: @other_unit_group)

    assert_equal us.id, result.id
    assert_equal @other_unit_group, result.unit_group
  end

  test "find_and_migrate_or_create_by! creates when no unit group is given" do
    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course)

    assert_equal @original_unit_group, result.unit_group
    assert_equal @user, result.user
  end

  test "find_and_migrate_or_create_by! creates when original unit group is given" do
    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course, unit_group: @original_unit_group)

    assert_equal @original_unit_group, result.unit_group
    assert_equal @user, result.user
  end

  test "find_and_migrate_or_create_by! allows PLC unit group for PLC course unit" do
    # Create a PLC course unit (old professional learning course) using the PLC factories
    plc_course_unit = create(:plc_course_unit, :with_course_name)
    plc_unit = plc_course_unit.script
    assert plc_unit.old_professional_learning_course?

    # Obtain the PLC unit group, which does not directly contain the PLC unit
    plc_unit_group = plc_course_unit.plc_course.unit_group
    refute plc_unit.unit_groups.include?(plc_unit_group)

    # Should not raise even though the unit_group is not one of the unit's unit groups,
    # because old_professional_learning_course? bypasses the membership validation.
    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: plc_unit, unit_group: plc_unit_group)

    assert_equal @user, result.user
    assert_equal plc_unit, result.script
    assert_equal plc_unit_group, result.unit_group
  end

  test "find_and_migrate_or_create_by! returns existing UserScript with original unit group when no unit group specified" do
    existing_us = UserScript.create!(user: @user, script: @unit_in_course, unit_group: @original_unit_group)

    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course)
    assert_equal existing_us.id, result.id
    assert_equal @original_unit_group, result.unit_group

    assert_equal 1, UserScript.where(user: @user, script: @unit_in_course).count
  end

  test "find_and_migrate_or_create_by! returns existing UserScript with original unit group when explicitly requested" do
    existing_us = UserScript.create!(user: @user, script: @unit_in_course, unit_group: @original_unit_group)

    result = UserScript.find_and_migrate_or_create_by!(user_id: @user.id, unit: @unit_in_course, unit_group: @original_unit_group)

    assert_equal existing_us.id, result.id
    assert_equal @original_unit_group, result.unit_group

    assert_equal 1, UserScript.where(user: @user, script: @unit_in_course).count
  end
end
