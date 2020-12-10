require 'test_helper'

# When adding a new model, update the following:
# - serialize_seeding_json
# - seed_from_json
# - get_counts
# - create_script_tree
# - assert_script_trees_equal
# - any relevant existing deletion tests (for example, if deleting something higher in the hierarchy should
#   also delete the objects under it of the new model)
#
# Also add a new test case which tests adding, creating, and deleting your new model.
module Services
  class ScriptSeedTest < ActiveSupport::TestCase
    setup do
      Game.game_cache = nil
    end

    # Tests serialization of a "full Script tree" - a Script with all of the associated models under it populated.
    # When adding a new model that is serialized, update this test to include the model, generate new json,
    # save it to test-serialize-seeding-json.script_json, and eyeball the changes to see that they look right.
    test 'serialize_seeding_json' do
      script = create_script_tree('test-serialize-seeding-json')

      filename = File.join(self.class.fixture_path, 'test-serialize-seeding-json.script_json')
      # Uncomment the following line to update test-serialize-seeding-json.script_json
      # File.write(filename, ScriptSeed.serialize_seeding_json(script))
      assert_equal File.read(filename), ScriptSeed.serialize_seeding_json(script)
    end

    test 'seed new script' do
      script = create_script_tree
      script.freeze
      # Eager load the levels for each script level, so they can be used in assertions even after deletion
      script_levels = frozen_script_levels_with_levels(script)
      json = ScriptSeed.serialize_seeding_json(script)
      counts_before = get_counts

      script.course_version.resources.destroy_all
      script.course_version.destroy!
      script.destroy!

      # This is currently:
      #   3 misc queries - starting and stopping transaction, getting max_allowed_packet
      #   4 queries to set up course offering and course version
      #   19 queries - two for each model, + one extra query each for Lessons,
      #     LessonActivities, ActivitySections, ScriptLevels and LevelsScriptLevels.
      #     These 2-3 queries per model are to (1) delete old entries, (2) import
      #     new/updated entries, and then (3) fetch the result for use by the next
      #     layer down in the hierarchy.
      #   12 queries - ScriptLevel validations related to having an activity_section.
      #     These would be good candidates to eliminate in future optimization.
      #   8 queries, one for each LevelsScriptLevel.
      #   9 queries, 1 to populate the Game.by_name cache, and 8 to look up Game objects by id.
      #   1 query to check for a CourseOffering. (Would be a few more if is_course was true)
      # LevelsScriptLevels has queries which scale linearly with the number of rows.
      # As far as I know, to get rid of those queries per row, we'd need to load all Levels into memory. I think
      # this is slower for most individual Scripts, but there could be a savings when seeding multiple Scripts.
      # For now, leaving this as a potential future optimization, since it seems to be reasonably fast as is.
      # The game queries can probably be avoided with a little work, though they only apply for Blockly levels.
      assert_queries(59) do
        ScriptSeed.seed_from_json(json)
      end

      assert_equal counts_before, get_counts
      script_after_seed = Script.find_by!(name: script.name)
      assert_script_trees_equal(script, script_after_seed, script_levels)
    end

    test 'seed with no changes is no-op' do
      script = create_script_tree
      counts_before = get_counts
      ScriptSeed.seed_from_json(ScriptSeed.serialize_seeding_json(script))

      assert_equal counts_before, get_counts
      script_after_seed = Script.find_by!(name: script.name)
      assert_script_trees_equal(script, script_after_seed)
      assert_equal script.script_levels.map(&:id), script_after_seed.script_levels.map(&:id)
    end

    test 'seed updates lesson groups' do
      script = create_script_tree

      script_with_changes, json, script_levels_with_changes = get_script_and_json_with_change_and_rollback(script) do
        script.lesson_groups.first.update!(big_questions: 'updated big questions')
        create :lesson_group, script: script, description: 'my description'
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_changes, script, script_levels_with_changes
      assert_equal 'updated big questions', script.lesson_groups.first.big_questions
    end

    test 'seed updates lessons' do
      script = create_script_tree

      script_with_changes, json, script_levels_with_changes = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.first.update!(visible_after: 'updated visible after')
        create :lesson, lesson_group: script.lesson_groups.first, script: script, overview: 'my overview'
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_changes, script, script_levels_with_changes
      assert_equal 'updated visible after', script.lessons.first.visible_after
    end

    test 'seed updates lesson activities' do
      script = create_script_tree

      script_with_changes, json, script_levels_with_changes = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        lesson.lesson_activities.first.update!(name: 'Updated Activity Name')
        lesson.lesson_activities.create(
          name: 'New Activity Name',
          position: 2,
          key: "#{lesson.name}-activity-2"
        )
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_changes, script, script_levels_with_changes
      lesson = script.lessons.first
      assert_equal(
        ['Updated Activity Name', 'New Activity Name'],
        lesson.lesson_activities.map(&:name)
      )
    end

    test 'seed updates activity sections' do
      script = create_script_tree

      script_with_changes, json, script_levels_with_changes = get_script_and_json_with_change_and_rollback(script) do
        activity = script.lessons.first.lesson_activities.first
        activity.activity_sections.first.update!(name: 'Updated Section Name')
        activity.activity_sections.create(
          name: 'New Section Name',
          position: 2,
          key: "#{activity.key}-section-2"
        )
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_changes, script, script_levels_with_changes
      activity = script.lessons.first.lesson_activities.first
      assert_equal(
        ['Updated Section Name', 'New Section Name'],
        activity.activity_sections.map(&:name)
      )
    end

    test 'seed updates script_levels' do
      script = create_script_tree
      new_level = create :level

      script_with_changes, json, script_levels_with_changes = get_script_and_json_with_change_and_rollback(script) do
        updated_script_level = script.script_levels.first
        updated_script_level.update!(challenge: 'foo')
        updated_script_level.levels += [new_level]
        create :script_level, lesson: script.lessons.first, script: script, levels: [new_level]
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_changes, script, script_levels_with_changes
      assert_equal 'foo', script.script_levels.first.challenge
    end

    test 'seed deletes lesson_groups' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json, script_levels_with_deletion = get_script_and_json_with_change_and_rollback(script) do
        script.lesson_groups.first.destroy!
        script.reload
        # TODO: should these be handled automatically by callbacks?
        script.lesson_groups.each {|lg| lg.update(position: lg.position - 1)}
        script.lessons.each_with_index {|l, i| l.update(relative_position: i + 1)}
        script.fix_script_level_positions
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_deletion, script, script_levels_with_deletion
      assert_equal [1], script.lesson_groups.map(&:position)
      assert_equal [1, 2], script.lessons.map(&:absolute_position)
      assert_equal [1, 2], script.lessons.map(&:relative_position)
      assert_equal (1..4).to_a, script.script_levels.map(&:chapter)
      # Deleting the LessonGroup should also delete its two Lessons, their two ScriptLevels each, and their LevelsScriptLevels.
      expected_counts = original_counts.clone
      expected_counts['LessonGroup'] -= 1
      expected_counts['Lesson'] -= 2
      expected_counts['LessonActivity'] -= 2
      expected_counts['ActivitySection'] -= 2
      expected_counts['ScriptLevel'] -= 4
      expected_counts['LevelsScriptLevel'] -= 4
      expected_counts['LessonsResource'] -= 4
      assert_equal expected_counts, get_counts
    end

    test 'seed deletes lessons' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json, script_levels_with_deletion = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.first.destroy!
        script.reload
        # TODO: should these be handled automatically by a callback? It is for absolute_position somehow.
        script.lessons.each {|l| l.update(relative_position: l.relative_position - 1)}
        script.fix_script_level_positions
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_deletion, script, script_levels_with_deletion
      assert_equal (1..3).to_a, script.lessons.map(&:absolute_position)
      assert_equal (1..3).to_a, script.lessons.map(&:relative_position)
      assert_equal (1..6).to_a, script.script_levels.map(&:chapter)
      # Deleting the lesson should also delete its two ScriptLevels, and their LevelsScriptLevels.
      expected_counts = original_counts.clone
      expected_counts['Lesson'] -= 1
      expected_counts['LessonActivity'] -= 1
      expected_counts['ActivitySection'] -= 1
      expected_counts['ScriptLevel'] -= 2
      expected_counts['LevelsScriptLevel'] -= 2
      expected_counts['LessonsResource'] -= 2
      assert_equal expected_counts, get_counts
    end

    test 'seed deletes lesson activities' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json, script_levels_with_deletion = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.first.lesson_activities.first.destroy!
        script.fix_script_level_positions
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_deletion, script, script_levels_with_deletion
      assert_equal (1..4).to_a, script.lessons.map(&:absolute_position)
      assert_equal (1..4).to_a, script.lessons.map(&:relative_position)
      assert_equal (1..6).to_a, script.script_levels.map(&:chapter)
      # Deleting the activity should also delete its two ScriptLevels, and their LevelsScriptLevels.
      expected_counts = original_counts.clone
      expected_counts['LessonActivity'] -= 1
      expected_counts['ActivitySection'] -= 1
      expected_counts['ScriptLevel'] -= 2
      expected_counts['LevelsScriptLevel'] -= 2
      assert_equal expected_counts, get_counts
    end

    test 'seed deletes activity sections' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json, script_levels_with_deletion = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.first.lesson_activities.first.activity_sections.first.destroy!
        script.fix_script_level_positions
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_deletion, script, script_levels_with_deletion
      assert_equal (1..4).to_a, script.lessons.map(&:absolute_position)
      assert_equal (1..4).to_a, script.lessons.map(&:relative_position)
      assert_equal (1..6).to_a, script.script_levels.map(&:chapter)
      # Deleting the activity section should also delete its two ScriptLevels, and their LevelsScriptLevels.
      expected_counts = original_counts.clone
      expected_counts['ActivitySection'] -= 1
      expected_counts['ScriptLevel'] -= 2
      expected_counts['LevelsScriptLevel'] -= 2
      assert_equal expected_counts, get_counts
    end

    test 'seed deletes script_levels' do
      script = create_script_tree
      original_counts = get_counts
      original_script_level_ids = script.script_levels.map(&:id)

      script_with_deletion, json, script_levels_with_deletion = get_script_and_json_with_change_and_rollback(script) do
        script.script_levels.first.destroy!
        script.reload
        # TODO: should these be handled automatically by a callback?
        script.script_levels.each_with_index {|sl, i| sl.update(chapter: i + 1)}
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_deletion, script, script_levels_with_deletion
      assert_equal (1..7).to_a, script.script_levels.map(&:chapter)
      # Deleting the ScriptLevel should also delete its LevelsScriptLevel.
      expected_counts = original_counts.clone
      expected_counts['ScriptLevel'] -= 1
      expected_counts['LevelsScriptLevel'] -= 1
      assert_equal expected_counts, get_counts
      # We need to preserve the script level ids of the remaining script levels, since teacher feedbacks reference them.
      assert_equal original_script_level_ids.slice(1, original_script_level_ids.length), script.script_levels.map(&:id)
    end

    test 'seed deletes lessons_resources but not resources' do
      skip 'get_script_and_json_with_change_and_rollback not compatible with has_and_belongs_to_many'

      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json, script_levels_with_deletion = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        assert_equal 2, lesson.resources.count
        lesson.resources.delete(lesson.resources.first)
        assert_equal 1, lesson.resources.count
      end

      ScriptSeed.seed_from_json(json)
      script.reload

      assert_script_trees_equal script_with_deletion, script, script_levels_with_deletion
      expected_counts = original_counts.clone
      expected_counts['LessonsResource'] -= 1
      assert_equal expected_counts, get_counts
    end

    def frozen_script_levels_with_levels(script)
      script_levels = script.script_levels.to_a
      script_levels.map(&:levels).map(&:length)
      script_levels.each(&:freeze)
      script_levels
    end

    def get_script_and_json_with_change_and_rollback(script, &db_write_block)
      script_with_change = json = script_levels_with_change = nil
      Script.transaction do
        # TODO: should this be handled automatically by a callback? It is for absolute_position somehow.
        yield
        script_with_change = Script.includes(:lesson_groups, :lessons, :script_levels, :levels_script_levels).find(script.id)
        script_with_change.freeze
        json = ScriptSeed.serialize_seeding_json(script_with_change)
        script_levels_with_change = frozen_script_levels_with_levels(script_with_change)

        raise ActiveRecord::Rollback
      end
      [script_with_change, json, script_levels_with_change]
    end

    def get_counts
      [
        Script, LessonGroup, Lesson, LessonActivity, ActivitySection, ScriptLevel,
        LevelsScriptLevel, Resource, LessonsResource
      ].map {|c| [c.name, c.count]}.to_h
    end

    def assert_script_trees_equal(s1, s2, script_levels1=nil, script_levels2=nil)
      script_levels1 ||= s1.script_levels
      script_levels2 ||= s2.script_levels

      assert_attributes_equal s1, s2
      assert_lesson_groups_equal s1.lesson_groups, s2.lesson_groups
      assert_lessons_equal s1.lessons, s2.lessons
      assert_lesson_activities_equal(
        s1.lessons.map(&:lesson_activities).flatten,
        s2.lessons.map(&:lesson_activities).flatten
      )
      assert_activity_sections_equal(
        s1.lessons.map(&:lesson_activities).flatten.map(&:activity_sections).flatten,
        s2.lessons.map(&:lesson_activities).flatten.map(&:activity_sections).flatten
      )
      assert_script_levels_equal script_levels1, script_levels2
      assert_resources_equal(
        s1.lessons.map(&:resources).flatten,
        s2.lessons.map(&:resources).flatten
      )
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

    def assert_lesson_activities_equal(activities1, activities2)
      activities1.zip(activities2).each do |a1, a2|
        assert_attributes_equal(a1, a2, ['key', 'lesson_id', 'position', 'properties'])
      end
    end

    def assert_activity_sections_equal(sections1, sections2)
      sections1.zip(sections2).each do |s1, s2|
        assert_attributes_equal(s1, s2, ['key', 'lesson_activity_id', 'position', 'properties'])
      end
    end

    def assert_script_levels_equal(script_levels1, script_levels2)
      script_levels1.zip(script_levels2).each do |sl1, sl2|
        assert_attributes_equal(sl1, sl2, ['script_id', 'stage_id', 'activity_section_id', 'properties'])
        # level_names is generated during seeding
        # TODO: should we use a callback or validation to verify that level_keys is always populated correctly?
        assert_equal sl1.properties, sl2.properties.except('level_keys')
        assert_equal sl1.levels, sl2.levels
      end
    end

    def assert_resources_equal(resources1, resources2)
      resources1.zip(resources2).each do |r1, r2|
        assert_attributes_equal(r1, r2, ['course_version_id'])
      end
    end

    def assert_attributes_equal(a, b, additional_excludes=[])
      excludes = ['id', 'created_at', 'updated_at'] + additional_excludes
      assert_equal a.attributes.except(*excludes), b.attributes.except(*excludes)
    end

    def create_script_tree(
      name_prefix=nil,
      num_lesson_groups=2,
      num_lessons_per_group=2,
      num_script_levels_per_lesson=2,
      num_resources_per_lesson=2
    )
      name_prefix ||= SecureRandom.uuid
      # TODO: how can this be simplified and/or moved into factories.rb?
      script = create(
        :script,
        name: "#{name_prefix}-script",
        curriculum_path: 'my_curriculum_path',
        is_course: true,
        family_name: "#{name_prefix}-family",
        version_year: "#{name_prefix}-version"
      )
      CourseOffering.add_course_offering(script)

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
      script.lessons.each do |lesson|
        # For now, just create one LessonActivity and ActivitySection per Lesson.
        activity = lesson.lesson_activities.create(
          name: 'My Activity',
          position: 1,
          key: "#{lesson.name}-activity-1"
        )
        section = activity.activity_sections.create(
          name: 'My Activity Section',
          position: 1,
          key: "#{activity.key}-section-1"
        )

        num_script_levels_per_lesson.times do
          game = create :game, name: "#{name_prefix}_game#{i}"
          level = create :level, name: "#{name_prefix}_blockly_#{i}", level_num: "1_2_#{i}", game: game
          create :script_level, activity_section: section, activity_section_position: i, lesson: lesson, script: script, levels: [level], challenge: i.even?
          i += 1
        end

        (1..num_resources_per_lesson).each do |r|
          resource = create :resource, key: "#{lesson.name}-resource-#{r}", course_version: script.course_version
          LessonsResource.find_or_create_by!(resource: resource, lesson: lesson)
        end
      end

      script
    end
  end
end
