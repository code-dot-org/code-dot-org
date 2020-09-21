require 'test_helper'

# When adding a new model, update the following:
# - serialize_seeding_json
# - get_counts
# - create_script_tree
# - assert_script_trees_equal
#
# Also add a new test case which tests adding, creating, and deleting your new model.
class ScriptSeedTest < ActiveSupport::TestCase
  # Tests serialization of a "full Script tree" - a Script with all of the associated models under it populated.
  # When adding a new model that is serialized, update this test to include the model, generate new json,
  # save it to test-serialize-seeding-json.script_json, and eyeball the changes to see that they look right.
  test 'serialize_seeding_json' do
    script = create_script_tree('test-serialize-seeding-json')

    filename = File.join(self.class.fixture_path, 'test-serialize-seeding-json.script_json')
    assert_equal File.read(filename), script.serialize_seeding_json
  end

  test 'seed new script' do
    script = create_script_tree
    script.freeze
    # Eager load the levels for each script level, so they can be used in assertions even after deletion
    script_levels = script.script_levels.to_a
    script_levels.map(&:levels).map(&:length)
    script_levels.each(&:freeze)
    json = script.serialize_seeding_json
    counts_before = get_counts

    script.destroy!
    # This is currently:
    #   3 misc queries - starting and stopping transaction, getting max_allowed_packet
    #   13 queries - two for each model, + one extra query each for Lessons, ScriptLevels and LevelsScriptLevels
    #   8 queries, one for each LevelsScriptLevel.
    # LevelsScriptLevels has queries which scale linearly with the number of rows.
    # As far as I know, to get rid of those queries per row, we'd need to load all Levels into memory. I think
    # this is slower for most individual Scripts, but there could be a savings when seeding multiple Scripts.
    # For now, leaving this as a potential future optimization, since it seems to be reasonably fast as is.
    assert_queries(24) do
      Script.seed_from_json(json)
    end

    assert_equal counts_before, get_counts
    script_after_seed = Script.find_by!(name: script.name)
    assert_script_trees_equal(script, script_after_seed, script_levels)
  end

  test 'seed with no changes is no-op' do
    script = create_script_tree
    counts_before = get_counts
    Script.seed_from_json(script.serialize_seeding_json)

    assert_equal counts_before, get_counts
    assert_script_trees_equal(script, Script.find_by!(name: script.name))
  end

  test 'seed updates lessons groups' do
    script = create_script_tree
    updated_lesson_group = script.lesson_groups.first
    updated_lesson_group.update!(big_questions: 'updated big questions')
    new_lesson_group = create :lesson_group, script: script, description: 'my description'
    script.freeze
    json = script.serialize_seeding_json

    new_lesson_group.destroy!
    updated_lesson_group.update!(big_questions: nil)
    Script.seed_from_json(json)

    assert_script_trees_equal(script, Script.find_by!(name: script.name))
  end

  test 'seed updates lessons' do
    script = create_script_tree
    updated_lesson = script.lessons.first
    updated_lesson.update!(visible_after: 'updated visible after')
    new_lesson = create :lesson, lesson_group: script.lesson_groups.first, script: script, overview: 'my overview'
    script.freeze
    json = script.serialize_seeding_json

    new_lesson.destroy!
    updated_lesson.update!(visible_after: nil)
    Script.seed_from_json(json)

    assert_script_trees_equal(script, Script.find_by!(name: script.name))
  end

  test 'seed updates script_levels' do
    script = create_script_tree
    updated_script_level = script.script_levels.first
    updated_script_level.update!(challenge: 'foo')
    new_script_level = create :script_level, lesson: script.lessons.first, script: script, challenge: true
    script.freeze
    # Eager load the levels for each script level, so they can be used in assertions even after deletion
    script_levels = script.script_levels.to_a
    script_levels.map(&:levels).map(&:length)
    script_levels.each(&:freeze)
    json = script.serialize_seeding_json

    new_script_level.destroy!
    updated_script_level.update!(challenge: nil)
    Script.seed_from_json(json)

    reloaded_script = Script.find_by!(name: script.name)
    assert_script_levels_equal script_levels, reloaded_script.script_levels
  end

  test 'seed deletes lesson_groups' do
    script = create_script_tree
    original_counts = get_counts

    script_with_deletion, json = get_script_tree_and_json_with_deletion(script) do
      script.lesson_groups.first.destroy!
      script.reload
      # TODO: should these be handled automatically by callbacks?
      script.lesson_groups.each {|lg| lg.update(position: lg.position - 1)}
      script.lessons.each_with_index {|l, i| l.update(relative_position: i + 1)}
    end

    Script.seed_from_json(json)
    script.reload

    assert_script_trees_equal script_with_deletion, script
    assert_equal [1], script.lesson_groups.map(&:position)
    assert_equal [1, 2], script.lessons.map(&:absolute_position)
    assert_equal [1, 2], script.lessons.map(&:relative_position)
    # Deleting the LessonGroup should also delete its two Lessons, each of their two ScriptLevels, and their LevelsScriptLevels.
    expected_counts = original_counts.clone
    expected_counts['LessonGroup'] -= 1
    expected_counts['Lesson'] -= 2
    expected_counts['ScriptLevel'] -= 4
    expected_counts['LevelsScriptLevel'] -= 4
    assert_equal expected_counts, get_counts
  end

  test 'seed deletes lessons' do
    script = create_script_tree
    original_counts = get_counts

    script_with_deletion, json = get_script_tree_and_json_with_deletion(script) do
      # TODO: should this be handled automatically by a callback? It is for absolute_position somehow.
      script.lessons.each {|l| l.update(relative_position: l.relative_position - 1)}
      script.lessons.first.destroy!
    end

    Script.seed_from_json(json)
    script.reload

    assert_script_trees_equal script_with_deletion, script
    assert_equal (1..3).to_a, script.lessons.map(&:absolute_position)
    assert_equal (1..3).to_a, script.lessons.map(&:relative_position)
    # Deleting the lesson should also delete its two ScriptLevels, and their LevelsScriptLevels.
    expected_counts = original_counts.clone
    expected_counts['Lesson'] -= 1
    expected_counts['ScriptLevel'] -= 2
    expected_counts['LevelsScriptLevel'] -= 2
    assert_equal expected_counts, get_counts
  end

  def get_script_tree_and_json_with_deletion(script, &deletion_block)
    script_with_deletion = json = nil
    Script.transaction do
      # TODO: should this be handled automatically by a callback? It is for absolute_position somehow.
      yield
      script_with_deletion = Script.includes(:lesson_groups, :lessons, :script_levels, :levels_script_levels).find(script.id)
      script_with_deletion.freeze
      json = script_with_deletion.serialize_seeding_json

      raise ActiveRecord::Rollback
    end
    return [script_with_deletion, json]
  end

  def get_counts
    [Script, LessonGroup, Lesson, ScriptLevel, LevelsScriptLevel].map {|c| [c.name, c.count]}.to_h
  end

  def assert_script_trees_equal(s1, s2, script_levels1=nil, script_levels2=nil)
    script_levels1 ||= s1.script_levels
    script_levels2 ||= s2.script_levels

    assert_attributes_equal s1, s2
    assert_lesson_groups_equal s1.lesson_groups, s2.lesson_groups
    assert_lessons_equal s1.lessons, s2.lessons
    assert_script_levels_equal script_levels1, script_levels2
  end

  def assert_lesson_groups_equal(lesson_groups1, lesson_groups2)
    lesson_groups1.zip(lesson_groups2).each do |lg1, lg2|
      assert_attributes_equal(lg1, lg2, ['script_id'])
    end
  end

  def assert_lessons_equal(lessons1, lessons2)
    lessons1.zip(lessons2).each do |l1, l2|
      assert_attributes_equal(l1, l2, ['script_id', 'lesson_group_id'])
    end
  end

  def assert_script_levels_equal(script_levels1, script_levels2)
    script_levels1.zip(script_levels2).each do |sl1, sl2|
      assert_attributes_equal(sl1, sl2, ['script_id', 'stage_id', 'properties'])
      # level_names is generated during seeding
      # TODO: should we use a callback or validation to verify that level_keys is always populated correctly?
      assert_equal sl1.properties, sl2.properties.except('level_keys')
      assert_equal sl1.levels, sl2.levels
    end
  end

  def assert_attributes_equal(a, b, additional_excludes=[])
    excludes = ['id', 'created_at', 'updated_at'] + additional_excludes
    assert_equal a.attributes.except(*excludes), b.attributes.except(*excludes)
  end

  def create_script_tree(name_prefix=nil, num_lesson_groups=2, num_lessons_per_group=2, num_script_levels_per_lesson=2)
    name_prefix ||= SecureRandom.uuid
    # TODO: how can this be simplified and/or moved into factories.rb?
    script = create :script, name: "#{name_prefix}-script", curriculum_path: 'my_curriculum_path'

    num_lesson_groups.times do |i|
      create :lesson_group, script: script, key: "#{name_prefix}-lesson-group-#{i + 1}", description: "description #{i + 1}"
    end

    script.lesson_groups.each_with_index do |lg, m|
      num_lessons_per_group.times do |n|
        name = "#{name_prefix}-lg-#{m + 1}-lesson-#{n + 1}"
        create :lesson, lesson_group: lg, script: script, name: name, key: name, overview: "overview #{m + 1} #{n + 1}"
      end
    end

    i = 1
    script.lessons.each do |lg|
      num_script_levels_per_lesson.times do
        level = create :level, name: "#{name_prefix}_Level_#{i}", level_num: "1_2_#{i}"
        create :script_level, lesson: lg, script: script, levels: [level], challenge: i.even?
        i += 1
      end
    end

    script
  end
end
