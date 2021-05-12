require 'test_helper'
require 'pdf/conversion'

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
      PDF.stubs(:generate_from_url)
      @programming_environment = create :programming_environment, name: 'new-lab'
      @framework = create :framework, shortcode: 'test_framework'
    end

    # Tests serialization of a "full Script tree" - a Script with all of the associated models under it populated.
    # When adding a new model that is serialized, update this test to include the model, generate new json,
    # save it to test-serialize-seeding-json.script_json, and eyeball the changes to see that they look right.
    test 'serialize_seeding_json' do
      script = create_script_tree(name_prefix: 'test-serialize-seeding-json')

      filename = File.join(self.class.fixture_path, 'test-serialize-seeding-json.script_json')
      # Uncomment the following line to update test-serialize-seeding-json.script_json
      #File.write(filename, ScriptSeed.serialize_seeding_json(script))

      expected = JSON.parse(File.read(filename))
      actual = JSON.parse(ScriptSeed.serialize_seeding_json(script))

      # Serialization includes a timestamp, which obviously doesn't play nicely
      # with the concept of a fixture. So, test that manually and exclude it
      # from the "full" test.
      assert actual['script'].key?('serialized_at')
      actual['script'].delete('serialized_at')

      assert_equal expected, actual
    end

    test 'seeded_from property is not serialized' do
      script = create(:script)
      script.seeded_from = Time.now
      result = ScriptSeed::ScriptSerializer.new(script, scope: {seed_context: {}}).as_json
      assert result.key? :properties
      refute result[:properties].key? 'seeded_from'
    end

    test 'seed new script' do
      script = create_script_tree
      script.freeze
      json = ScriptSeed.serialize_seeding_json(script)
      counts_before = get_counts

      # remove the script from the database, leaving the frozen script object intact.
      script_to_destroy = Script.find(script.id)
      script_to_destroy.course_version.resources.destroy_all
      script_to_destroy.course_version.vocabularies.destroy_all
      script_to_destroy.course_version.destroy!
      script_to_destroy.destroy!

      # This is currently:
      #   3 misc queries - starting and stopping transaction, getting max_allowed_packet
      #   4 queries to set up course offering and course version
      #   34 queries - two for each model, + one extra query each for Lessons,
      #     LessonActivities, ActivitySections, ScriptLevels, LevelsScriptLevels,
      #     Resources, and Vocabulary.
      #     These 2-3 queries per model are to (1) delete old entries, (2) import
      #     new/updated entries, and then (3) fetch the result for use by the next
      #     layer down in the hierarchy.
      #   12 queries - ScriptLevel validations related to having an activity_section.
      #     These would be good candidates to eliminate in future optimization.
      #   16 queries, one for each LevelsScriptLevel.
      #   4 queries, one to remove LessonsResources from each Lesson.
      #   2 queries, one to remove LessonsVocabularies from each Lesson.
      #   2 queries, one to remove LessonsProgrammingExpression from each Lesson.
      #   2 queries, one to remove LessonsStandards from each Lesson.
      #   2 queries, one to remove LessonsOpportunityStandards from each Lesson.
      #   1 query to get all the programming environments
      #   1 query to get all the standards frameworks
      #   17 queries, 1 to populate the Game.by_name cache, and 16 to look up Game objects by id.
      #   1 query to check for a CourseOffering. (Would be a few more if is_course was true)
      # LevelsScriptLevels has queries which scale linearly with the number of rows.
      # As far as I know, to get rid of those queries per row, we'd need to load all Levels into memory. I think
      # this is slower for most individual Scripts, but there could be a savings when seeding multiple Scripts.
      # For now, leaving this as a potential future optimization, since it seems to be reasonably fast as is.
      # The game queries can probably be avoided with a little work, though they only apply for Blockly levels.
      assert_queries(102) do
        ScriptSeed.seed_from_json(json)
      end

      assert_equal counts_before, get_counts
      script_after_seed = Script.with_seed_models.find_by!(name: script.name)
      assert_script_trees_equal(script, script_after_seed)
    end

    test 'seed script in unit group' do
      script = create_script_tree(with_unit_group: true)
      refute script.course_version
      assert script.unit_group.course_version
      script.freeze
      json = ScriptSeed.serialize_seeding_json(script)
      counts_before = get_counts

      # remove the script's resources and lesson groups, which will also remove
      # its lessons and everything else they contain. Leave the script and its
      # unit group intact, so that resources can be imported.
      script_to_destroy = Script.find(script.id)
      script_to_destroy.unit_group.course_version.resources.destroy_all
      script_to_destroy.unit_group.course_version.vocabularies.destroy_all
      script_to_destroy.lesson_groups.destroy_all

      ScriptSeed.seed_from_json(json)

      assert_equal counts_before, get_counts
      script_after_seed = Script.with_seed_models.find_by!(name: script.name)
      assert_script_trees_equal(script, script_after_seed)
    end

    # This tests the scenario where a script is in a unit group, but we don't
    # know that yet because that relationship has not yet been defined by a
    # later seed step, perhaps because we are seeding for the first time on
    # a particular machine.
    test 'seed script not yet in unit group' do
      script = create_script_tree(with_unit_group: true)
      refute script.course_version
      assert script.unit_group.course_version

      # Capture the json while resources are still present. This test checks
      # that these resources do not get added back during the seed process.
      json = ScriptSeed.serialize_seeding_json(script)
      script.lessons.each {|l| l.resources.destroy_all}
      script.lessons.each {|l| l.vocabularies.destroy_all}
      script.resources.destroy_all
      script.student_resources.destroy_all
      script.freeze
      expected_counts = get_counts

      # destroy the script and its unit group, so that no course version will
      # be available during seed.
      script_to_destroy = Script.find(script.id)
      script_to_destroy.unit_group.course_version.destroy!
      script_to_destroy.unit_group.destroy!
      script_to_destroy.destroy!

      ScriptSeed.seed_from_json(json)

      assert_equal expected_counts, get_counts
      script_after_seed = Script.with_seed_models.find_by!(name: script.name)
      assert_script_trees_equal(script, script_after_seed)
    end

    test 'seed with no changes is no-op' do
      script = create_script_tree
      counts_before = get_counts
      ScriptSeed.seed_from_json(ScriptSeed.serialize_seeding_json(script))

      assert_equal counts_before, get_counts
      script_after_seed = Script.with_seed_models.find_by!(name: script.name)
      assert_script_trees_equal(script, script_after_seed)
      assert_equal script.script_levels.map(&:id), script_after_seed.script_levels.map(&:id)
    end

    # The following tests ensure that the sequence of serializing and then
    # seeding produce the right result via the following strategy:
    #
    # 1. create script object via create_script_tree. This represents the
    # initial state of the script, before modifications.
    #
    # 2. get_script_and_json_with_change_and_rollback copies and modifies the
    # script and serializes it to json, and then restores the DB to its original
    # state via database transaction rollback. It then returns the modified json
    # and the modified script_with_changes, loading script associations into
    # memory via with_seed_models.
    #
    # 3. seed_from_json replays the modification represented in the modified
    # json, then reloads the script from the database using with_seed_models.
    #
    # 4. At this point, `script_with_changes` represents the expected state of
    # the script after seeding, and `script` represents the actual state of the
    # script after seeding. Therefore,
    # assert_script_trees_equal(script_with_changes, script) asserts that the
    # seed process made exactly the modifications we were expecting, except
    # for a few explicitly ignored parameters, such as ids and timestamps.
    #
    # It is important that both script objects are fully loaded into memory
    # before the comparison is done, so that the script_with_changes object
    # representing the expected data does not accidentally load the actual
    # result of seeding from the database for any of its associated models. This
    # is ensured by using assert_queries(0) inside assert_script_trees_equal.

    test 'seed updates lesson groups' do
      script = create_script_tree(num_lesson_groups: 2)

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        script.lesson_groups.first.update!(big_questions: 'updated big questions')
        create :lesson_group, script: script, description: 'my description'
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      assert_equal 'updated big questions', script.lesson_groups.first.big_questions
    end

    test 'seed updates lessons' do
      script = create_script_tree

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.first.update!(visible_after: 'updated visible after')
        create :lesson, lesson_group: script.lesson_groups.last, script: script, overview: 'my overview', relative_position: 5, absolute_position: 5
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      assert_equal 'updated visible after', script.lessons.first.visible_after
    end

    test 'seed updates lesson activities' do
      script = create_script_tree

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        lesson.lesson_activities.first.update!(name: 'Updated Activity Name')
        lesson.lesson_activities.create(
          name: 'New Activity Name',
          position: 2,
          key: "#{lesson.name}-activity-2"
        )
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      lesson = script.lessons.first
      assert_equal(
        ['Updated Activity Name', 'My Activity', 'New Activity Name'],
        lesson.lesson_activities.map(&:name)
      )
    end

    test 'seed updates activity sections' do
      script = create_script_tree

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        activity = script.lessons.first.lesson_activities.first
        activity.activity_sections.first.update!(name: 'Updated Section Name')
        activity.activity_sections.create(
          name: 'New Section Name',
          position: 2,
          key: "#{activity.key}-section-2"
        )
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      activity = script.lessons.first.lesson_activities.first
      assert_equal(
        ['My Activity Section', 'New Section Name', 'Updated Section Name'],
        activity.activity_sections.map(&:name).sort!
      )
    end

    test 'seed updates script_levels' do
      script = create_script_tree
      new_level = create :level

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        updated_script_level = script.script_levels.first
        updated_script_level.update!(challenge: 'foo')
        updated_script_level.levels += [new_level]
        create :script_level, lesson: script.lessons.last, script: script, levels: [new_level], assessment: false, bonus: false, named_level: false
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      assert_equal 'foo', script.script_levels.first.challenge
    end

    test 'seed updates lesson resources' do
      script = create_script_tree
      CourseOffering.add_course_offering(script)
      assert script.course_version

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        lesson.resources.first.update!(name: 'Updated Resource Name')
        lesson.resources.create(
          name: 'New Resource Name',
          key: "#{lesson.name}-resource-3",
          url: "fake.url",
          course_version: script.course_version
        )
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      lesson = script.lessons.first
      assert_equal(
        ['Updated Resource Name', 'fake name', 'New Resource Name'],
        lesson.resources.map(&:name)
      )
    end

    test 'seed updates script resources' do
      script = create_script_tree
      CourseOffering.add_course_offering(script)
      assert script.course_version

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        script.resources.first.update!(name: 'updated name')
        script.resources.create(
          name: 'New Resource Name',
          url: "fake.url",
          course_version: script.course_version
        )
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      assert_equal(
        ['updated name', 'New Resource Name'],
        script.resources.map(&:name)
      )
    end

    test 'seed updates script student resources' do
      script = create_script_tree
      CourseOffering.add_course_offering(script)
      assert script.course_version

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        script.student_resources.first.update!(name: 'updated name')
        script.student_resources.create(
          name: 'New Resource Name',
          url: "fake.url",
          course_version: script.course_version
        )
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      assert_equal(
        ['updated name', 'New Resource Name'],
        script.student_resources.map(&:name)
      )
    end

    test 'seed updates lesson vocabularies' do
      script = create_script_tree
      CourseOffering.add_course_offering(script)
      assert script.course_version

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        lesson.vocabularies.first.update!(definition: 'updated definition')
        key = Vocabulary.sanitize_key("#{lesson.name}-vocab-3")
        key = Vocabulary.uniquify_key(key, script.course_version.id)
        lesson.vocabularies.create(
          word: 'new word',
          key: key,
          definition: "new definition",
          course_version: script.course_version
        )
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      lesson = script.lessons.first
      assert_equal(
        ['word', 'word', 'new word'],
        lesson.vocabularies.map(&:word)
      )
      assert_equal(
        ['updated definition', 'definition', 'new definition'],
        lesson.vocabularies.map(&:definition)
      )
    end

    test 'seed updates lesson programming expressions' do
      script = create_script_tree

      # create the programming expression outside of the rollback block, because unlike vocab
      # or resources, the seed process will not re-create the programming expression for us.
      new_programming_expression = create :programming_expression, key: 'new-block'

      expected_keys = [
        script.lessons.first.programming_expressions.last.key,
        new_programming_expression.key
      ]

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        lesson.programming_expressions.first.destroy
        lesson.programming_expressions.push(new_programming_expression)
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      lesson = script.lessons.first
      assert_equal expected_keys, lesson.programming_expressions.map(&:key)
    end

    test 'seed updates lesson standards' do
      script = create_script_tree

      # create the standard outside of the rollback block, because unlike vocab
      # or resources, the seed process will not re-create the standard for us.
      new_standard = create :standard, description: 'New Standard'

      expected_descriptions = [
        script.lessons.first.standards.last.description,
        new_standard.description
      ]

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        lesson.standards.first.destroy
        lesson.standards.push(new_standard)
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      lesson = script.lessons.first
      assert_equal expected_descriptions, lesson.standards.map(&:description)
    end

    test 'seed updates lesson opportunity standards' do
      script = create_script_tree

      # create the standard outside of the rollback block, because unlike vocab
      # or resources, the seed process will not re-create the standard for us.
      new_standard = create :standard, description: 'New Standard'

      expected_descriptions = [
        script.lessons.first.opportunity_standards.last.description,
        new_standard.description
      ]

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        lesson.opportunity_standards.first.destroy
        lesson.opportunity_standards.push(new_standard)
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      lesson = script.lessons.first
      assert_equal expected_descriptions, lesson.opportunity_standards.map(&:description)
    end

    test 'seed deletes lesson_groups' do
      script = create_script_tree(num_lesson_groups: 2)
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        script.lesson_groups.first.destroy!
        script.reload
        # TODO: should these be handled automatically by callbacks?
        script.lesson_groups.each {|lg| lg.update(position: lg.position - 1)}
        script.lessons.each_with_index {|l, i| l.update(relative_position: i + 1)}
        script.fix_script_level_positions
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      assert_equal [1], script.lesson_groups.map(&:position)
      assert_equal [1, 2], script.lessons.map(&:absolute_position)
      assert_equal [1, 2], script.lessons.map(&:relative_position)
      assert_equal (1..16).to_a, script.script_levels.map(&:chapter)
      # Deleting the LessonGroup should also delete its two Lessons, their two ScriptLevels each, and their LevelsScriptLevels.
      expected_counts = original_counts.clone
      expected_counts['LessonGroup'] -= 1
      expected_counts['Lesson'] -= 2
      expected_counts['LessonActivity'] -= 4
      expected_counts['ActivitySection'] -= 8
      expected_counts['ScriptLevel'] -= 16
      expected_counts['LevelsScriptLevel'] -= 16
      expected_counts['LessonsResource'] -= 4
      expected_counts['LessonsVocabulary'] -= 4
      expected_counts['LessonsProgrammingExpression'] -= 4
      expected_counts['Objective'] -= 4
      expected_counts['LessonsStandard'] -= 4
      expected_counts['LessonsOpportunityStandard'] -= 4
      assert_equal expected_counts, get_counts
    end

    test 'seed deletes lessons' do
      script = create_script_tree(num_lesson_groups: 2)
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.first.destroy!
        script.reload
        # TODO: should these be handled automatically by a callback? It is for absolute_position somehow.
        script.lessons.each {|l| l.update(relative_position: l.relative_position - 1)}
        script.fix_script_level_positions
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      assert_equal (1..3).to_a, script.lessons.map(&:absolute_position)
      assert_equal (1..3).to_a, script.lessons.map(&:relative_position)
      assert_equal (1..24).to_a, script.script_levels.map(&:chapter)
      # Deleting the lesson should also delete its two ScriptLevels, and their LevelsScriptLevels.
      expected_counts = original_counts.clone
      expected_counts['Lesson'] -= 1
      expected_counts['LessonActivity'] -= 2
      expected_counts['ActivitySection'] -= 4
      expected_counts['ScriptLevel'] -= 8
      expected_counts['LevelsScriptLevel'] -= 8
      expected_counts['LessonsResource'] -= 2
      expected_counts['LessonsVocabulary'] -= 2
      expected_counts['LessonsProgrammingExpression'] -= 2
      expected_counts['Objective'] -= 2
      expected_counts['LessonsStandard'] -= 2
      expected_counts['LessonsOpportunityStandard'] -= 2
      assert_equal expected_counts, get_counts
    end

    test 'seed deletes lesson activities' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.first.lesson_activities.first.destroy!
        script.fix_script_level_positions
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      assert_equal (1..2).to_a, script.lessons.map(&:absolute_position)
      assert_equal (1..2).to_a, script.lessons.map(&:relative_position)
      assert_equal (1..12).to_a, script.script_levels.map(&:chapter)
      # Deleting the activity should also delete its two ScriptLevels, and their LevelsScriptLevels.
      expected_counts = original_counts.clone
      expected_counts['LessonActivity'] -= 1
      expected_counts['ActivitySection'] -= 2
      expected_counts['ScriptLevel'] -= 4
      expected_counts['LevelsScriptLevel'] -= 4
      assert_equal expected_counts, get_counts
    end

    test 'seed deletes activity sections' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.first.lesson_activities.first.activity_sections.first.destroy!
        script.fix_script_level_positions
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      assert_equal (1..2).to_a, script.lessons.map(&:absolute_position)
      assert_equal (1..2).to_a, script.lessons.map(&:relative_position)
      assert_equal (1..14).to_a, script.script_levels.map(&:chapter)
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

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        script.script_levels.first.destroy!
        script.reload
        # TODO: should these be handled automatically by a callback?
        script.script_levels.each_with_index {|sl, i| sl.update(chapter: i + 1)}
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      assert_equal (1..15).to_a, script.script_levels.map(&:chapter)
      # Deleting the ScriptLevel should also delete its LevelsScriptLevel.
      expected_counts = original_counts.clone
      expected_counts['ScriptLevel'] -= 1
      expected_counts['LevelsScriptLevel'] -= 1
      assert_equal expected_counts, get_counts
      # We need to preserve the script level ids of the remaining script levels, since teacher feedbacks reference them.
      assert_equal original_script_level_ids.slice(1, original_script_level_ids.length), script.script_levels.map(&:id)
    end

    # Resources are owned by the course version. We need to make sure all the
    # resources we need for this script are created, but we should never remove
    # a resource because it might be in use by another script in this course
    # version.
    test 'seed deletes lessons_resources but not resources' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        assert_equal 2, lesson.resources.count
        lesson.resources.delete(lesson.resources.first)
        assert_equal 1, lesson.resources.count
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      expected_counts = original_counts.clone
      expected_counts['LessonsResource'] -= 1
      assert_equal expected_counts, get_counts
    end

    # Resources are owned by the course version. We need to make sure all the
    # resources we need for this script are created, but we should never remove
    # a resource because it might be in use by another script in this course
    # version.
    test 'seed deletes script_resources but not resources' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        script.resources = []
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      expected_counts = original_counts.clone
      expected_counts['ScriptsResource'] -= 1
      assert_equal expected_counts, get_counts
    end

    # Resources are owned by the course version. We need to make sure all the
    # resources we need for this script are created, but we should never remove
    # a resource because it might be in use by another script or lesson in this course
    # version.
    test 'seed deletes scripts_student_resources but not resources' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        script.student_resources = []
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      expected_counts = original_counts.clone
      expected_counts['ScriptsStudentResource'] -= 1
      assert_equal expected_counts, get_counts
    end

    # Vocabulary is owned by the course version. We need to make sure all the
    # vocabulary we need for this script are created, but we should never remove
    # any vocabulary because it might be in use by another lesson in this course
    # version.
    test 'seed deletes lessons_vocabularies but not vocabularies' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        assert_equal 2, lesson.vocabularies.count
        lesson.vocabularies.delete(lesson.vocabularies.first)
        assert_equal 1, lesson.vocabularies.count
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      expected_counts = original_counts.clone
      expected_counts['LessonsVocabulary'] -= 1
      assert_equal expected_counts, get_counts
    end

    test 'seed deletes objectives' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.first.objectives.first.destroy!
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      expected_counts = original_counts.clone
      expected_counts['Objective'] -= 1
      assert_equal expected_counts, get_counts
    end

    test 'seed updates objectives' do
      script = create_script_tree

      script_with_changes, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        lesson.objectives.first.update!(description: 'Updated Description')
        lesson.objectives.create(
          key: "#{lesson.name}-objective-3",
          description: 'New Description'
        )
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_changes, script
      lesson = script.lessons.first
      assert_equal(
        ['Updated Description', 'fake description', 'New Description'],
        lesson.objectives.map(&:description)
      )
    end

    # Programming Expressions are shared across all courses. We need to make sure all the
    # programming expressions we need for this script are created, but we should never remove
    # a programming expression because it might be in use by another script.
    test 'seed deletes lesson programming expressions' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        assert_equal 2, lesson.programming_expressions.count
        lesson.programming_expressions.delete(lesson.programming_expressions.first)
        assert_equal 1, lesson.programming_expressions.count
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      expected_counts = original_counts.clone
      expected_counts['LessonsProgrammingExpression'] -= 1
      assert_equal expected_counts, get_counts
    end

    test 'seed deletes all lesson programming expressions' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        script.lessons.each do |lesson|
          lesson.programming_expressions = []
          assert_equal 0, lesson.programming_expressions.count
        end
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      expected_counts = original_counts.clone
      expected_counts['LessonsProgrammingExpression'] = 0
      assert_equal expected_counts, get_counts
    end

    test 'seed can only find programming expression if programming environment matches' do
      script = create_script_tree(num_lessons_per_group: 1)
      json = ScriptSeed.serialize_seeding_json(script)
      ScriptSeed.seed_from_json(json)
      @programming_environment.update!(name: 'not-new-lab')
      assert_raises do
        ScriptSeed.seed_from_json(json)
      end
    end

    # Standards are shared across all scripts. We should never delete
    # a standard because it might be in use by another script.
    test 'seed deletes lessons_standards' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        assert_equal 2, lesson.standards.count
        lesson.standards.delete(lesson.standards.first)
        assert_equal 1, lesson.standards.count
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      expected_counts = original_counts.clone
      expected_counts['LessonsStandard'] -= 1
      assert_equal expected_counts, get_counts
    end

    # Standards are shared across all scripts. We should never delete
    # a standard because it might be in use by another script.
    test 'seed deletes lessons_opportunity_standards' do
      script = create_script_tree
      original_counts = get_counts

      script_with_deletion, json = get_script_and_json_with_change_and_rollback(script) do
        lesson = script.lessons.first
        assert_equal 2, lesson.opportunity_standards.count
        lesson.opportunity_standards.delete(lesson.opportunity_standards.first)
        assert_equal 1, lesson.opportunity_standards.count
      end

      ScriptSeed.seed_from_json(json)
      script = Script.with_seed_models.find(script.id)

      assert_script_trees_equal script_with_deletion, script
      expected_counts = original_counts.clone
      expected_counts['LessonsOpportunityStandard'] -= 1
      assert_equal expected_counts, get_counts
    end

    test 'seed can only find standard if framework matches' do
      script = create_script_tree(num_lessons_per_group: 1)
      json = ScriptSeed.serialize_seeding_json(script)
      ScriptSeed.seed_from_json(json)
      @framework.update!(shortcode: 'bogus')
      assert_raises do
        ScriptSeed.seed_from_json(json)
      end
    end

    test 'import_script sets seeded_from from serialized_at' do
      script = create(:script, is_migrated: true)
      assert script.seeded_from.nil?

      serialized = ScriptSeed::ScriptSerializer.new(script, scope: {seed_context: {}}).as_json.stringify_keys
      assert serialized['serialized_at'].present?

      ScriptSeed.import_script(serialized)
      script.reload
      assert script.seeded_from.present?
      # minitest is a bit weird about Time equality, so normalize both values
      # to integers for easy comparison
      assert_equal serialized['serialized_at'].to_i, Time.parse(script.seeded_from).to_i
    end

    def get_script_and_json_with_change_and_rollback(script, &db_write_block)
      script_with_change = json = nil
      Script.transaction do
        # TODO: should this be handled automatically by a callback? It is for absolute_position somehow.
        yield
        script_with_change = Script.with_seed_models.find(script.id)
        script_with_change.freeze
        json = ScriptSeed.serialize_seeding_json(script_with_change)

        raise ActiveRecord::Rollback
      end
      [script_with_change, json]
    end

    def get_counts
      [
        Script, LessonGroup, Lesson, LessonActivity, ActivitySection, ScriptLevel,
        LevelsScriptLevel, Resource, LessonsResource, ScriptsResource, ScriptsStudentResource, Vocabulary, LessonsVocabulary,
        LessonsProgrammingExpression, Objective, Standard, LessonsStandard, LessonsOpportunityStandard
      ].map {|c| [c.name, c.count]}.to_h
    end

    def assert_script_trees_equal(s1, s2)
      # Make sure the scripts and their associations are already in memory,
      # because fetching data from the DB could lead to false positive matches.
      assert_queries(0) do
        assert_scripts_equal s1, s2
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
        assert_script_levels_equal(
          s1.script_levels.to_a,
          s2.script_levels.to_a
        )
        assert_resources_equal(
          s1.lessons.map(&:resources).flatten,
          s2.lessons.map(&:resources).flatten
        )
        assert_resources_equal(
          s1.resources,
          s2.resources
        )
        assert_resources_equal(
          s1.student_resources,
          s2.student_resources
        )
        assert_vocabularies_equal(
          s1.lessons.map(&:vocabularies).flatten,
          s2.lessons.map(&:vocabularies).flatten
        )
        assert_programming_expressions_equal(
          s1.lessons.map(&:programming_expressions).flatten,
          s2.lessons.map(&:programming_expressions).flatten
        )
        assert_objectives_equal(
          s1.lessons.map(&:objectives).flatten,
          s2.lessons.map(&:objectives).flatten
        )
        assert_standards_equal(
          s1.lessons.map(&:standards).flatten,
          s2.lessons.map(&:standards).flatten,
        )
        assert_standards_equal(
          s1.lessons.map(&:opportunity_standards).flatten,
          s2.lessons.map(&:opportunity_standards).flatten,
        )
      end
    end

    def assert_scripts_equal(script1, script2)
      assert_attributes_equal(script1, script2, ['properties'])
      assert_equal script1.properties.except('seeded_from'),
        script2.properties.except('seeded_from')
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
        assert_attributes_equal(a1, a2, ['lesson_id'])
      end
    end

    def assert_activity_sections_equal(sections1, sections2)
      sections1.zip(sections2).each do |s1, s2|
        assert_attributes_equal(s1, s2, ['lesson_activity_id'])
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

    def assert_vocabularies_equal(vocab1, vocab2)
      vocab1.zip(vocab2).each do |v1, v2|
        assert_attributes_equal(v1, v2, ['course_version_id'])
      end
    end

    def assert_programming_expressions_equal(programming_expression1, programming_expression2)
      programming_expression1.zip(programming_expression2).each do |pe1, pe2|
        assert_attributes_equal(pe1, pe2)
      end
    end

    def assert_objectives_equal(objectives1, objectives2)
      objectives1.zip(objectives2).each do |o1, o2|
        assert_attributes_equal(o1, o2, ['lesson_id'])
      end
    end

    def assert_standards_equal(standards1, standards2)
      standards1.zip(standards2).each do |s1, s2|
        assert_attributes_equal(s1, s2)
      end
    end

    def assert_attributes_equal(a, b, additional_excludes=[])
      excludes = ['id', 'created_at', 'updated_at'] + additional_excludes
      assert_equal a.attributes.except(*excludes), b.attributes.except(*excludes)
    end

    def create_script_tree(
      name_prefix: nil,
      # only use one lesson group by default, to make tests run faster.
      num_lesson_groups: 1,
      num_lessons_per_group: 2,
      num_activities_per_lesson: 2,
      num_sections_per_activity: 2,
      num_script_levels_per_section: 2,
      num_resources_per_lesson: 2,
      num_resources_per_script: 1,
      num_vocabularies_per_lesson: 2,
      num_programming_expressions_per_lesson: 2,
      num_objectives_per_lesson: 2,
      num_standards_per_lesson: 2,
      with_unit_group: false
    )
      name_prefix ||= SecureRandom.uuid
      # TODO: how can this be simplified and/or moved into factories.rb?
      script = create(
        :script,
        name: "#{name_prefix}-script",
        curriculum_path: 'my_curriculum_path',
        is_migrated: true
      )

      # Make sure that family name and version year each conform to the
      # expected formats.
      family_name = "#{name_prefix.gsub(/[^a-z\-]/i, '')}-family"
      version_year = "1999"

      if with_unit_group
        unit_group = create :unit_group, family_name: family_name, version_year: version_year
        create :unit_group_unit, unit_group: unit_group, script: script, position: 1
        CourseOffering.add_course_offering(unit_group)
      else
        script.update!(
          is_course: true,
          family_name: family_name,
          version_year: version_year
        )
        CourseOffering.add_course_offering(script)
      end
      course_version = script.get_course_version
      assert course_version

      num_lesson_groups.times do |i|
        create :lesson_group, script: script, key: "#{name_prefix}-lesson-group-#{i + 1}", description: "description #{i + 1}"
      end

      script.lesson_groups.each_with_index do |lg, m|
        num_lessons_per_group.times do |n|
          name = "#{name_prefix}-lg-#{m + 1}-l-#{n + 1}"
          create :lesson, lesson_group: lg, script: script, name: name, key: name, overview: "overview #{m + 1} #{n + 1}", has_lesson_plan: true
        end
      end

      (1..num_resources_per_script).each do |r|
        resource = create :resource, key: "#{script.name}-resource-#{r}", course_version: course_version
        ScriptsResource.find_or_create_by!(resource: resource, script: script)
      end

      (1..num_resources_per_script).each do |r|
        resource = create :resource, key: "#{script.name}-student-resource-#{r}", course_version: course_version
        ScriptsStudentResource.find_or_create_by!(resource: resource, script: script)
      end

      sl_num = 1
      script.lessons.each do |lesson|
        (1..num_activities_per_lesson).each do |activity_pos|
          activity = lesson.lesson_activities.create(
            name: 'My Activity',
            position: activity_pos,
            key: "#{lesson.name}-a-#{activity_pos}"
          )
          (1..num_sections_per_activity).each do |section_pos|
            section = activity.activity_sections.create(
              name: 'My Activity Section',
              position: section_pos,
              key: "#{activity.key}-s-#{section_pos}"
            )
            (1..num_script_levels_per_section).each do |sl_pos|
              game = create :game, name: "#{name_prefix}_game#{sl_num}"
              level = create :level, name: "#{name_prefix}_blockly_#{sl_num}", level_num: "1_2_#{sl_num}", game: game
              create :script_level, activity_section: section, activity_section_position: sl_pos,
                     lesson: lesson, script: script, levels: [level], challenge: sl_num.even?,
                     assessment: false, bonus: false, named_level: false
              sl_num += 1
            end
          end
        end

        next unless course_version

        (1..num_resources_per_lesson).each do |r|
          resource = create :resource, key: "#{lesson.name}-resource-#{r}", course_version: course_version
          LessonsResource.find_or_create_by!(resource: resource, lesson: lesson)
        end

        (1..num_vocabularies_per_lesson).each do |v|
          key = "#{lesson.name}-vocab-#{v}"
          key = Vocabulary.sanitize_key(key)
          key = Vocabulary.uniquify_key(key, course_version.id)
          vocab = create :vocabulary, key: key, course_version: course_version
          LessonsVocabulary.find_or_create_by!(vocabulary: vocab, lesson: lesson)
        end

        (1..num_programming_expressions_per_lesson).each do |pe|
          programming_expression = create :programming_expression, programming_environment: @programming_environment, key: "#{lesson.name}-programming-expression-#{pe}", name: "#{lesson.name}-programming-expression-#{pe}"
          LessonsProgrammingExpression.find_or_create_by!(programming_expression: programming_expression, lesson: lesson)
        end

        (1..num_objectives_per_lesson).each do |o|
          create :objective, key: "#{lesson.name}-objective-#{o}", lesson: lesson
        end

        (1..num_standards_per_lesson).each do |s|
          standard = create :standard, framework: @framework, shortcode: "#{lesson.name}-standard-#{s}"
          LessonsStandard.find_or_create_by!(standard: standard, lesson: lesson)
        end

        (1..num_standards_per_lesson).each do |s|
          standard = create :standard, framework: @framework, shortcode: "#{lesson.name}-opportunity-standard-#{s}"
          LessonsOpportunityStandard.find_or_create_by!(standard: standard, lesson: lesson)
        end
      end

      Script.with_seed_models.find(script.id)
    end
  end
end
