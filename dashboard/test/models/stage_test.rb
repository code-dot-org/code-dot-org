require 'test_helper'

class StageTest < ActiveSupport::TestCase
  setup do
    @student = create :student
  end
  test "lockable_state with swapped level without user_level" do
    _, level1, _, stage, _ = create_swapped_lockable_stage

    lockable_state = stage.lockable_state [@student]

    assert_equal true, lockable_state[0][:locked], 'stage without userlevel should be locked'
    assert_equal level1.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level in reverse order without userlevel" do
    _, _, level2, stage, script_level = create_swapped_lockable_stage
    script_level.properties = {variants: {level1: {active: false}}}
    script_level.save!

    lockable_state = stage.lockable_state [@student]

    assert_equal true, lockable_state[0][:locked], 'stage without userlevel should be locked'
    assert_equal level2.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level with user_level for inactive level" do
    script, _, level2, stage, _ = create_swapped_lockable_stage
    create :user_level, user: @student, script: script, level: level2, unlocked_at: Time.now

    lockable_state = stage.lockable_state [@student]

    assert_equal false, lockable_state[0][:locked], 'unlocked user_level should unlock old level'
    assert_equal level2.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "lockable_state with swapped level with user_level for active level" do
    script, level1, _, stage, _ = create_swapped_lockable_stage
    create :user_level, user: @student, script: script, level: level1, unlocked_at: Time.now

    lockable_state = stage.lockable_state [@student]

    assert_equal false, lockable_state[0][:locked], 'unlocked user_level should unlock new level'
    assert_equal level1.id, lockable_state[0][:user_level_data][:level_id], 'level id should correspond to active level'
  end

  test "summary for single page long assessment" do
    script = create :script
    properties = {pages: [{levels: ['level_free_response', 'level_multi_unsubmitted']}]}
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true, properties: properties
    stage = create :stage, name: 'stage1', script: script, lockable: true
    create :script_level, script: script, levels: [level1], assessment: true, stage: stage

    # Ensure that a single page long assessment has a uid that ends with "_0".
    assert_equal stage.summarize[:levels].first[:uid], "#{stage.summarize[:levels].first[:ids].first}_0"
  end

  test "summary for stage with and without extras" do
    script = create :script, stage_extras_available: true
    level = create :level
    stage = create :stage, script: script
    create :script_level, script: script, stage: stage, levels: [level]
    level2 = create :level
    stage2 = create :stage, script: script, stage_extras_disabled: true
    create :script_level, script: script, stage: stage2, levels: [level2]

    assert_match /extras$/, stage.summarize[:stage_extras_level_url]
    assert_nil stage2.summarize[:stage_extras_level_url]
  end

  test "last_progression_script_level" do
    stage = create :stage
    create :script_level, stage: stage
    last_script_level = create :script_level, stage: stage

    assert_equal last_script_level, stage.last_progression_script_level
  end

  test "last_progression_script_level with a bonus level" do
    stage = create :stage
    last_script_level = create :script_level, stage: stage
    create :script_level, stage: stage, bonus: true

    assert_equal last_script_level, stage.last_progression_script_level
  end

  test "next_level_path_for_stage_extras" do
    script = create :script
    stage1 = create :stage, script: script
    create :script_level, script: script, stage: stage1
    create :script_level, script: script, stage: stage1
    stage2 = create :stage, script: script
    create :script_level, script: script, stage: stage2
    create :script_level, script: script, stage: stage2

    assert_match /\/s\/bogus-script-\d+\/stage\/2\/puzzle\/1/, stage1.next_level_path_for_stage_extras(@student)
    assert_equal '/', stage2.next_level_path_for_stage_extras(@student)
  end

  def create_swapped_lockable_stage
    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    stage = create :stage, name: 'stage1', script: script, lockable: true
    script_level = create :script_level, script: script, levels: [level1, level2], assessment: true, stage: stage

    [script, level1, level2, stage, script_level]
  end
end
