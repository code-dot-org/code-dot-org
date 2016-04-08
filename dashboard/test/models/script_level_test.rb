require 'test_helper'

class ScriptLevelTest < ActiveSupport::TestCase
  include Rails.application.routes.url_helpers

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

  test "should not destroy when related level is destroyed" do
    @script_level = create(:script_level)
    @script_level.level.destroy
    assert ScriptLevel.exists?(@script_level.id)
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
    assert_equal 1, sl.position
    assert_equal 20, sl.stage_total

    # new script
    sl = create(:script_level)
    sl2 = create(:script_level, stage: sl.stage, script: sl.script)

    assert_equal 1, sl.position
    assert_equal 2, sl.stage_total

    assert_equal 2, sl2.position
    assert_equal 2, sl2.stage_total
  end

  test 'summarize with default route' do
    sl = create(:script_level)
    sl2 = create(:script_level, stage: sl.stage, script: sl.script)

    summary = sl.summarize
    assert_match Regexp.new("^#{root_url.chomp('/')}/s/bogus_script_[0-9]+/stage/1/puzzle/1$"), summary[:url]
    assert_equal false, summary[:previous]
    assert_equal 1, summary[:position]
    assert_equal 'puzzle', summary[:kind]
    assert_equal 1, summary[:title]

    summary = sl2.summarize
    assert_match Regexp.new("^#{root_url.chomp('/')}/s/bogus_script_[0-9]+/stage/1/puzzle/2$"), summary[:url]
    assert_equal false, summary[:next]
    assert_equal 2, summary[:position]
    assert_equal 'puzzle', summary[:kind]
    assert_equal 2, summary[:title]
  end

  test 'summarize with custom route' do
    summary = Script.hoc_2014_script.script_levels.first.summarize
    assert_equal "#{root_url.chomp('/')}/hoc/1", summary[:url]  # Make sure we use the canonical /hoc/1 URL.
    assert_equal false, summary[:previous]
    assert_equal 1, summary[:position]
    assert_equal 'puzzle', summary[:kind]
    assert_equal 1, summary[:title]
  end

  test 'calling next_level when next level is unplugged skips the level for script without stages' do
    last_20h_maze_1_level = ScriptLevel.joins(:levels).find_by(levels: {level_num: '2_19'}, script_id: 1)
    first_20h_artist_1_level = ScriptLevel.joins(:levels).find_by(levels: {level_num: '1_1'}, script_id: 1)

    assert_equal first_20h_artist_1_level, last_20h_maze_1_level.next_progression_level
  end

  test 'calling next_level when next level is not unplugged does not skip the level for script without stages' do
    first_20h_artist_1_level = ScriptLevel.joins(:levels).find_by(levels: {level_num: '1_1'}, script_id: 1)
    second_20h_artist_1_level = ScriptLevel.joins(:levels).find_by(levels: {level_num: '1_2'}, script_id: 1)

    assert_equal second_20h_artist_1_level, first_20h_artist_1_level.next_progression_level
  end

  test 'calling next_level when next level is unplugged skips the level' do
    script = create(:script, name: 's1')
    stage = create(:stage, script: script, position: 1)
    script_level_first = create(:script_level, script: script, stage: stage, position: 1)
    create(:script_level, levels: [create(:unplugged)], script: script, stage: stage, position: 2)
    script_level_after = create(:script_level, script: script, stage: stage, position: 3)

    assert_equal script_level_after, script_level_first.next_progression_level
  end

  test 'calling next_level when next level is unplugged skips the entire unplugged stage' do
    script = create(:script, name: 's1')
    first_stage = create(:stage, script: script, position: 1)
    script_level_first = create(:script_level, script: script, stage: first_stage, position: 1, chapter: 1)

    unplugged_stage = create(:stage, script: script, position: 2)
    create(:script_level, levels: [create(:unplugged)], script: script, stage: unplugged_stage, position: 1, chapter: 2)
    create(:script_level, levels: [create(:match)], script: script, stage: unplugged_stage, position: 2, chapter: 3)
    create(:script_level, levels: [create(:match)], script: script, stage: unplugged_stage, position: 3, chapter: 4)

    plugged_stage = create(:stage, script: script, position: 3)
    script_level_after = create(:script_level, script: script, stage: plugged_stage, position: 1, chapter: 5)

    # make sure everything is in the order we want it to be
    script.reload
    assert_equal [first_stage, unplugged_stage, plugged_stage], script.stages
    assert_equal script_level_first, script.script_levels.first
    assert_equal script_level_after, script.script_levels.last

    assert_equal script_level_after, script_level_first.next_progression_level
  end

  test 'calling next_level on an unplugged level works' do
    script = create(:script, name: 's1')
    stage = create(:stage, script: script, position: 1)
    script_level_unplugged = create(:script_level, levels: [create(:unplugged)], script: script, stage: stage, position: 1, chapter: 1)
    script_level_after = create(:script_level, script: script, stage: stage, position: 2, chapter: 2)

    assert_equal script_level_after, script_level_unplugged.next_level
  end

  test 'end of stage' do
    script = Script.find_by_name('course1')

    assert script.stages[0].script_levels.last.end_of_stage?
    assert script.stages[1].script_levels.last.end_of_stage?
    assert script.stages[2].script_levels.last.end_of_stage?
    assert script.stages[3].script_levels.last.end_of_stage?
    assert !script.stages[3].script_levels.first.end_of_stage?
    assert !script.stages[3].script_levels[1].end_of_stage?
  end

  test 'cached_find' do
    script_level = ScriptLevel.cache_find(Script.twenty_hour_script.script_levels[0].id)
    assert_equal(Script.twenty_hour_script.script_levels[0], script_level)

    script_level2 = ScriptLevel.cache_find(Script.course1_script.script_levels.last.id)
    assert_equal(Script.course1_script.script_levels.last, script_level2)

    # Make sure that we can also locate a newly created level.
    script_level3 = create(:script_level)
    assert_equal(script_level3, ScriptLevel.cache_find(script_level3.id))
  end

end
