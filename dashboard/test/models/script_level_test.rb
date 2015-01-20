require 'test_helper'

class ScriptLevelTest < ActiveSupport::TestCase
  def setup
    @script_level = create(:script_level)
    @script_level2 = create(:script_level)
    @stage = create(:stage)
    @stage2 = create(:stage)
  end

  test "setup should work" do
    assert_not_nil @script_level.script
    assert_not_nil @script_level.level
  end

  test "should get position when assigned to stage" do
    @script_level.update(stage: @stage)
    @script_level.move_to_bottom
    assert_equal 1, @script_level.position
  end

  test "should return position when assigned to stage" do
    @script_level.update(stage: @stage)
    @script_level.move_to_bottom
    @script_level.update(game_chapter: 2)
    assert_equal 1, @script_level.stage_or_game_position
  end

  test "should return chapter when no stage" do
    @script_level.update(game_chapter: 1)
    @script_level.update(position: 2)
    assert_equal 1, @script_level.stage_or_game_position
  end

  test "should destroy when related level is destroyed" do
    @script_level = create(:script_level)
    @script_level.level.destroy
    assert_not ScriptLevel.exists?(@script_level.id)
  end

  test "destroying should not destroy related level" do
    @script_level = create(:script_level)
    level = @script_level.level
    @script_level.destroy

    assert Level.exists?(level.id)
  end

  test 'counts puzzle position and total in stage' do
    # default script
    sl = Script.twenty_hour_script.script_levels[1]
    assert_equal 1, sl.stage_or_game_position
    assert_equal 20, sl.stage_or_game_total

    # custom script
    sl = @script_level
    sl.update(stage: @stage)
    sl.move_to_bottom
    @script_level2.update(stage: @stage)
    @script_level2.move_to_bottom
    assert_equal 1, sl.stage_or_game_position
    assert_equal 2, sl.stage_or_game_total
  end


  test 'calling next_level when next level is unplugged skips the level for script without stages' do
    last_20h_maze_1_level = ScriptLevel.find_by(level: Level.find_by_level_num('2_19'), script_id: 1)
    first_20h_artist_1_level = ScriptLevel.find_by(level: Level.find_by_level_num('1_1'), script_id: 1)

    assert_equal first_20h_artist_1_level, last_20h_maze_1_level.next_progression_level
  end

  test 'calling next_level when next level is not unplugged does not skip the level for script without stages' do
    first_20h_artist_1_level = ScriptLevel.find_by(level: Level.find_by_level_num('1_1'), script_id: 1)
    second_20h_artist_1_level = ScriptLevel.find_by(level: Level.find_by_level_num('1_2'), script_id: 1)

    assert_equal second_20h_artist_1_level, first_20h_artist_1_level.next_progression_level
  end

  test 'calling next_level when next level is unplugged skips the level' do
    script = create(:script, name: 's1')
    stage = create(:stage, script: script, position: 1)
    script_level_first = create(:script_level, script: script, stage: stage, position: 1)
    create(:script_level, level: create(:unplugged), script: script, stage: stage, position: 2)
    script_level_after = create(:script_level, script: script, stage: stage, position: 3)

    assert_equal script_level_after, script_level_first.next_progression_level
  end

  test 'calling next_level when next level is unplugged skips the entire unplugged stage' do
    script = create(:script, name: 's1')
    first_stage = create(:stage, script: script, position: 1)
    script_level_first = create(:script_level, script: script, stage: first_stage, position: 1, chapter: 1)
    unplugged_stage = create(:stage, script: script, position: 1)
    create(:script_level, level: create(:unplugged), script: script, stage: unplugged_stage, position: 1, chapter: 2)
    create(:script_level, level: create(:match), script: script, stage: unplugged_stage, position: 2, chapter: 3)
    create(:script_level, level: create(:match), script: script, stage: unplugged_stage, position: 3, chapter: 4)
    plugged_stage = create(:stage, script: script, position: 2)
    script_level_after = create(:script_level, script: script, stage: plugged_stage, position: 1, chapter: 5)

    assert_equal script_level_after, script_level_first.next_progression_level
  end

  test 'calling next_level on an unplugged level works' do
    script = create(:script, name: 's1')
    stage = create(:stage, script: script, position: 1)
    script_level_unplugged = create(:script_level, level: create(:unplugged), script: script, stage: stage, position: 1, chapter: 1)
    script_level_after = create(:script_level, script: script, stage: stage, position: 2, chapter: 2)

    assert_equal script_level_after, script_level_unplugged.next_level
  end
end
