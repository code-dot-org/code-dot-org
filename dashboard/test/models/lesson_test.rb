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
    stage = create :lesson, name: 'stage1', script: script, lockable: true
    create :script_level, script: script, levels: [level1], assessment: true, lesson: stage

    # Ensure that a single page long assessment has a uid that ends with "_0".
    assert_equal stage.summarize[:levels].first[:uid], "#{stage.summarize[:levels].first[:ids].first}_0"
  end

  test "summary for stage with and without extras" do
    script = create :script, stage_extras_available: true
    level = create :level
    stage = create :lesson, script: script
    create :script_level, script: script, lesson: stage, levels: [level]
    level2 = create :level
    stage2 = create :lesson, script: script, stage_extras_disabled: true
    create :script_level, script: script, lesson: stage2, levels: [level2]

    assert_match /extras$/, stage.summarize[:stage_extras_level_url]
    assert_nil stage2.summarize[:stage_extras_level_url]
  end

  test "summary for stage with extras where include_bonus_levels is true" do
    script = create :script
    level = create :level
    stage = create :lesson, script: script
    create :script_level, lesson: stage, levels: [level], bonus: true

    summary = stage.summarize(true)
    assert_equal 1, summary[:levels].length
    assert_equal [level.id], summary[:levels].first[:ids]
  end

  test "summary of levels for lesson plan" do
    script = create :script
    level = create :level
    stage = create :lesson, script: script, name: 'My Stage'
    script_level = create :script_level, script: script, lesson: stage, levels: [level]

    expected_summary_of_levels = [
      {
        id: script_level.id,
        position: script_level.position,
        named_level: script_level.named_level?,
        bonus_level: !!script_level.bonus,
        assessment: script_level.assessment,
        progression: script_level.progression,
        path: script_level.path,
        level_id: level.id,
        type: level.class.to_s,
        name: level.name,
        display_name: level.display_name
      }
    ]

    assert_equal expected_summary_of_levels, stage.summary_for_lesson_plans[:levels]
  end

  test "last_progression_script_level" do
    stage = create :lesson
    create :script_level, lesson: stage
    last_script_level = create :script_level, lesson: stage

    assert_equal last_script_level, stage.last_progression_script_level
  end

  test "last_progression_script_level with a bonus level" do
    stage = create :lesson
    last_script_level = create :script_level, lesson: stage
    create :script_level, lesson: stage, bonus: true

    assert_equal last_script_level, stage.last_progression_script_level
  end

  test "next_level_path_for_stage_extras" do
    script = create :script
    stage1 = create :lesson, script: script
    create :script_level, script: script, lesson: stage1
    create :script_level, script: script, lesson: stage1
    stage2 = create :lesson, script: script
    create :script_level, script: script, lesson: stage2
    create :script_level, script: script, lesson: stage2

    assert_match /\/s\/bogus-script-\d+\/stage\/2\/puzzle\/1/, stage1.next_level_path_for_stage_extras(@student)
    assert_equal '/', stage2.next_level_path_for_stage_extras(@student)
  end

  def create_swapped_lockable_stage
    script = create :script
    level1 = create :level_group, name: 'level1', title: 'title1', submittable: true
    level2 = create :level_group, name: 'level2', title: 'title2', submittable: true
    stage = create :lesson, name: 'stage1', script: script, lockable: true
    script_level = create :script_level, script: script, levels: [level1, level2], assessment: true, lesson: stage

    [script, level1, level2, stage, script_level]
  end
end
