require 'test_helper'

class StageTest < ActiveSupport::TestCase
  test "lockable_state with swapped level without user_level" do
    student = create :student

    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    stage = create :stage, name: 'stage1', script: script, lockable: true
    create :script_level, script: script, levels: [level1, level2], assessment: true, stage: stage

    lockable_state = stage.lockable_state [student]

    assert_equal true, lockable_state[0][:locked], 'stage without userlevel should be locked'
    assert_equal level1.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level in reverse order without userlevel" do
    student = create :student

    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    stage = create :stage, name: 'stage1', script: script, lockable: true
    create :script_level, script: script, levels: [level1, level2], assessment: true, stage: stage,
      properties: {level1: {active: false}}.to_json

    lockable_state = stage.lockable_state [student]

    assert_equal true, lockable_state[0][:locked], 'stage without userlevel should be locked'
    assert_equal level2.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level with user_level for inactive level" do
    student = create :student

    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    stage = create :stage, name: 'stage1', script: script, lockable: true
    create :script_level, script: script, levels: [level1, level2], assessment: true, stage: stage
    create :user_level, user: student, script: script, level: level2, unlocked_at: Time.now

    lockable_state = stage.lockable_state [student]

    assert_equal false, lockable_state[0][:locked], 'unlocked user_level should unlock old level'
    assert_equal level2.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level in reverse order with user_level for inactive level" do
    student = create :student

    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    stage = create :stage, name: 'stage1', script: script, lockable: true
    create :script_level, script: script, levels: [level1, level2], assessment: true, stage: stage,
      properties: {level1: {active: false}}.to_json
    create :user_level, user: student, script: script, level: level1, unlocked_at: Time.now

    lockable_state = stage.lockable_state [student]

    assert_equal false, lockable_state[0][:locked], 'unlocked user_level should unlock old level'
    assert_equal level1.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level with user_level for active level" do
    student = create :student

    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    stage = create :stage, name: 'stage1', script: script, lockable: true
    create :script_level, script: script, levels: [level1, level2], assessment: true, stage: stage
    create :user_level, user: student, script: script, level: level1, unlocked_at: Time.now

    lockable_state = stage.lockable_state [student]

    assert_equal false, lockable_state[0][:locked], 'unlocked user_level should unlock new level'
    assert_equal level1.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level in reverse order with user_level for active level" do
    student = create :student

    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    stage = create :stage, name: 'stage1', script: script, lockable: true
    create :script_level, script: script, levels: [level1, level2], assessment: true, stage: stage,
      properties: {level1: {active: false}}.to_json
    create :user_level, user: student, script: script, level: level2, unlocked_at: Time.now

    lockable_state = stage.lockable_state [student]

    assert_equal false, lockable_state[0][:locked], 'unlocked user_level should unlock new level'
    assert_equal level2.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end
end
