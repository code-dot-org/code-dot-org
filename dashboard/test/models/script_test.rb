require 'test_helper'

class ScriptTest < ActiveSupport::TestCase
  def setup
    @game = create(:game)
    @script_file = File.join(self.class.fixture_path, "test_fixture.script")
    # Level names match those in 'test.script'
    @levels = (1..5).map { |n| create(:level, :name => "Level #{n}", :game => @game) }
  end

  test 'create script from DSL' do
    scripts, _ = Script.setup([], [@script_file])
    script = scripts[0]
    assert_equal 'Level 1', script.levels[0].name
    assert_equal 'Stage2', script.script_levels[3].stage.name
  end

  test 'should not change Script[Level] ID when reseeding' do
    scripts, _ = Script.setup([], [@script_file])
    script = scripts[0]
    script_id = script.script_levels[4].script_id
    script_level_id = script.script_levels[4].id

    scripts,_ = Script.setup([], [@script_file])
    assert_equal script_id, scripts[0].script_levels[4].script_id
    assert_equal script_level_id, scripts[0].script_levels[4].id
  end

  test 'should not change Script ID when changing script levels and options' do
    scripts,_ = Script.setup([], [@script_file])
    script_id = scripts[0].script_levels[4].script_id
    script_level_id = scripts[0].script_levels[4].id

    parsed_script = ScriptDSL.parse_file(@script_file)[0][:stages].map{|stage| stage[:levels]}.flatten

    # Set different level name in tested script
    parsed_script[4]['name'] = "Level 1"

    # Set different 'trophies' and 'hidden' options from defaults in Script.setup
    options = {name: File.basename(@script_file, ".script"), trophies: true, hidden: false}
    script = Script.add_script(options, parsed_script)
    assert_equal script_id, script.script_levels[4].script_id
    assert_not_equal script_level_id, script.script_levels[4].id
  end

  test 'should remove empty stages' do
    scripts,_ = Script.setup([], [@script_file])
    assert_equal 2, scripts[0].stages.count

    # Reupload a script of the same filename / name, but lacking the second stage.
    stage = scripts[0].stages.last
    script_file_empty_stage = File.join(self.class.fixture_path, "duplicate_scripts", "test_fixture.script")
    scripts,_ = Script.setup([], [script_file_empty_stage])
    assert_equal 1, scripts[0].stages.count
    assert_not Stage.exists?(stage.id)
  end

  test 'should remove empty stages, reordering stages' do
    script_file_3_stages = File.join(self.class.fixture_path, "test_fixture_3_stages.script")
    script_file_middle_missing_reversed = File.join(self.class.fixture_path, "duplicate_scripts", "test_fixture_3_stages.script")
    scripts,_ = Script.setup([], [script_file_3_stages])
    assert_equal 3, scripts[0].stages.count
    first = scripts[0].stages[0]
    second = scripts[0].stages[1]
    third = scripts[0].stages[2]
    assert_equal 'Stage1', first.name
    assert_equal 'Stage2', second.name
    assert_equal 'Stage3', third.name
    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal 3, third.position

    # Reupload a script of the same filename / name, but lacking the middle stage.
    scripts,_ = Script.setup([], [script_file_middle_missing_reversed])
    assert_equal 2, scripts[0].stages.count
    assert_not Stage.exists?(second.id)

    first = scripts[0].stages[0]
    second = scripts[0].stages[1]
    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal 'Stage3', first.name
    assert_equal 'Stage1', second.name
  end

  test 'should not create two scripts with same name' do
    create(:script, :name => 'script')
    raise = assert_raises ActiveRecord::RecordInvalid do
      create(:script, :name => 'Script')
    end
    assert_equal 'Validation failed: Name has already been taken', raise.message
  end

  test 'stages are in order' do
    script = create(:script, name: 's1')
    create(:stage, script: script)
    last = create(:stage, script: script)
    create(:stage, script: script)

    last.move_to_bottom

    script.stages

    assert_equal [1, 2, 3], script.stages.collect(&:position)
  end

  test 'script_levels are in order' do
    script = create(:script, name: 's1')
    s1 = create(:stage, script: script, position: 1)
    last = create(:script_level, script:script, stage:s1, chapter:3)
    second = create(:script_level, script:script, stage:s1, chapter:2)
    create(:script_level, script:script, stage:s1, chapter:1)
    second.move_to_bottom
    last.move_to_bottom

    s2 = create(:stage, script: script, position: 2)
    create(:script_level, script:script, stage:s2, chapter:4)
    create(:script_level, script:script, stage:s2, chapter:5)

    s3 = create(:stage, script: script, position: 3)
    last = create(:script_level, script:script, stage:s3, chapter:7)
    create(:script_level, script:script, stage:s3, chapter:6)
    last.move_to_bottom

    assert_equal [1, 2, 3], script.stages.collect(&:position)

    assert_equal [1, 1, 1, 2, 2, 3, 3], script.script_levels.collect(&:stage).collect(&:position)
    assert_equal [1, 2, 3, 1, 2, 1, 2], script.script_levels.collect(&:position)
  end

  test 'calling next_level on last script_level points to next stage' do
    script = create(:script, name: 's1')
    first_stage = create(:stage, script: script, position: 1)
    first_stage_last_level = create(:script_level, script: script, stage: first_stage, position: 1)
    second_stage = create(:stage, script: script, position: 2)
    second_stage_first_level = create(:script_level, script: script, stage: second_stage, position:1)
    second_stage_last_level = create(:script_level, script: script, stage: second_stage, position:2)

    assert_equal second_stage_first_level, first_stage_last_level.next_progression_level
  end

  test 'script_level positions should reset' do
    scripts,_ = Script.setup([], [@script_file])
    first = scripts[0].stages[0].script_levels[0]
    second = scripts[0].stages[0].script_levels[1]
    assert_equal 1, first.position
    assert_equal 2, second.position
    promoted_level = second.level
    script_file_remove_level = File.join(self.class.fixture_path, "duplicate_scripts", "test_fixture.script")

    scripts,_ = Script.setup([], [script_file_remove_level])
    new_first_script_level = ScriptLevel.where(script: scripts[0], level: promoted_level).first
    assert_equal 1, new_first_script_level.position
  end

  test 'script import is idempotent w.r.t. positions and count' do
    scripts,_ = Script.setup([], [@script_file])
    original_count = ScriptLevel.count
    first = scripts[0].stages[0].script_levels[0]
    second = scripts[0].stages[0].script_levels[1]
    third = scripts[0].stages[0].script_levels[2]
    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal 3, third.position
    scripts,_ = Script.setup([], [@script_file])
    first = scripts[0].stages[0].script_levels[0]
    second = scripts[0].stages[0].script_levels[1]
    third = scripts[0].stages[0].script_levels[2]
    assert_equal 1, first.position
    assert_equal 2, second.position
    assert_equal 3, third.position
    assert_equal original_count, ScriptLevel.count
  end

  test 'unplugged in script' do
    @script_file = File.join(self.class.fixture_path, 'test_unplugged.script')
    scripts, _ = Script.setup([], [@script_file])
    assert_equal 'Unplugged', scripts[0].script_levels[1].level['type']
  end

  test 'blockly level in custom script' do
    script_data, i18n = ScriptDSL.parse(
                     "stage 'Stage1'; level 'Level 1'; level 'blockly:Studio:100'", 'a filename')

    script = Script.add_script({name: 'test script'},
                               script_data[:stages].map{|stage| stage[:levels]}.flatten)

    assert_equal 'Studio', script.script_levels[1].level.game.name
    assert_equal '100', script.script_levels[1].level.level_num
  end

  test "scripts are hidden or not" do
    visible_scripts = ['20-hour', 'Hour of Code', 'flappy', 'playlab', 'artist', 'course1', 'course2', 'course3']
    visible_scripts.each do |s|
      assert !Script.find_by_name(s).hidden?, "#{s} is hidden when it should not be"
    end

    hidden_scripts = %w{edit-code events builder jigsaw step msm test}
    hidden_scripts.each do |s|
      assert Script.find_by_name(s).hidden?, "#{s} is not hidden when it should be"
    end
  end
end
