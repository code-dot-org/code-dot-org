require 'test_helper'

# When adding a new model, update the following:
# - serialize_seeding_json
# - seed new script
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

    script.destroy!
    Script.seed_from_json(json)

    script_after_seed = Script.find_by!(name: script.name)
    assert_attributes_equal script, script_after_seed
    assert_lesson_groups_equal script.lesson_groups, script_after_seed.lesson_groups
    assert_lessons_equal script.lessons, script_after_seed.lessons
    assert_script_levels_equal script_levels, script_after_seed.script_levels
  end

  test 'seed with no changes is no-op' do
    script = create_script_tree
    Script.seed_from_json(script.serialize_seeding_json)

    assert_script_trees_equal(script, Script.find_by!(name: script.name))
  end

  test 'seed updates lessons groups' do
    script = create_script_tree
    updated_lesson_group = script.lesson_groups.first
    updated_lesson_group.big_questions = 'updated big questions'
    updated_lesson_group.save!
    new_lesson_group = create :lesson_group, script: script, description: 'my description'
    script.freeze
    json = script.serialize_seeding_json

    new_lesson_group.destroy!
    updated_lesson_group.big_questions = nil
    updated_lesson_group.save!
    Script.seed_from_json(json)

    assert_script_trees_equal(script, Script.find_by!(name: script.name))
  end

  test 'seed updates lessons' do
    script = create_script_tree
    updated_lesson = script.lessons.first
    updated_lesson.visible_after = 'updated visible after'
    updated_lesson.save!
    new_lesson = create :lesson, lesson_group: script.lesson_groups.first, script: script, overview: 'my overview'
    script.freeze
    json = script.serialize_seeding_json

    new_lesson.destroy!
    updated_lesson.visible_after = nil
    updated_lesson.save!
    Script.seed_from_json(json)

    assert_script_trees_equal(script, Script.find_by!(name: script.name))
  end

  test 'seed updates script_levels' do
    script = create_script_tree
    updated_script_level = script.script_levels.first
    updated_script_level.challenge = 'foo'
    updated_script_level.save!
    new_script_level = create :script_level, lesson: script.lessons.first, script: script, challenge: true
    script.freeze
    # Eager load the levels for each script level, so they can be used in assertions even after deletion
    script_levels = script.script_levels.to_a
    script_levels.map(&:levels).map(&:length)
    script_levels.each(&:freeze)
    json = script.serialize_seeding_json

    new_script_level.destroy!
    updated_script_level.challenge = nil
    updated_script_level.save!
    Script.seed_from_json(json)

    reloaded_script = Script.find_by!(name: script.name)
    assert_script_levels_equal script_levels, reloaded_script.script_levels
  end

  def assert_script_trees_equal(s1, s2)
    assert_attributes_equal s1, s2
    assert_lesson_groups_equal s1.lesson_groups, s2.lesson_groups
    assert_lessons_equal s1.lessons, s2.lessons
    assert_script_levels_equal s1.script_levels, s2.script_levels
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

    script.lessons.each_with_index do |lg, m|
      num_script_levels_per_lesson.times do |n|
        number = m * 2 + n + 1
        level = create :level, name: "#{name_prefix}_Level_#{number}", level_num: "1_2_#{number}"
        create :script_level, lesson: lg, script: script, levels: [level], challenge: number.even?
      end
    end
    # Eager load the lesson_groups and lessons as well, so that script.lessons.first is the same object
    # in memory as script.lesson_groups.first.lessons.first, which is needed for the seeding unit tests.
    #Script.includes(:lesson_groups, :lessons).find(script.id)

    script
  end
end
