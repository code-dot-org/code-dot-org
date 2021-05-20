require 'test_helper'

class ActivitySectionTest < ActiveSupport::TestCase
  test "activities can contain activity sections" do
    lesson_activity = create :lesson_activity
    activity_section1 = create :activity_section, lesson_activity: lesson_activity
    activity_section2 = create :activity_section, lesson_activity: lesson_activity
    assert_equal [activity_section1, activity_section2], lesson_activity.activity_sections
  end

  test "script levels are ordered by activity section position" do
    activity_section = create :activity_section
    lesson = activity_section.lesson_activity.lesson
    script = lesson.script

    level1 = create :maze, name: 'level 1'
    level2 = create :maze, name: 'level 2'
    level3 = create :maze, name: 'level 3'
    sl1 = create :script_level, script: script, lesson: lesson, levels: [level1],
      activity_section: activity_section, activity_section_position: 2
    sl2 = create :script_level, script: script, lesson: lesson, levels: [level2],
      activity_section: activity_section, activity_section_position: 3
    sl3 = create :script_level, script: script, lesson: lesson, levels: [level3],
      activity_section: activity_section, activity_section_position: 1

    assert_equal [sl3, sl1, sl2], activity_section.script_levels
  end

  test 'script levels must be ordered' do
    activity_section = create :activity_section
    lesson = activity_section.lesson_activity.lesson
    script = lesson.script

    level1 = create :maze, name: 'level 1'
    error = assert_raises do
      create :script_level, script: script, lesson: lesson, levels: [level1],
             activity_section: activity_section
    end
    assert_includes error.message, 'activity_section_position is required'
  end

  test 'lesson edit summary does not preprocess markdown' do
    activity_section = create :activity_section
    Services::MarkdownPreprocessor.expects(:process!).never
    activity_section.summarize_for_lesson_edit
  end

  test 'lesson show summary preprocesses markdown' do
    activity_section = create :activity_section
    Services::MarkdownPreprocessor.expects(:process!).
      with(activity_section.description)
    activity_section.summarize_for_lesson_show(false)
  end

  test 'seeding_key' do
    lesson_group = create :lesson_group
    script = lesson_group.script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    lesson_activity = create :lesson_activity, lesson: lesson
    activity_section = create :activity_section, lesson_activity: lesson_activity
    seed_context = Services::ScriptSeed::SeedContext.new(
      script: script,
      lesson_groups: script.lesson_groups.to_a,
      lessons: script.lessons.to_a,
      lesson_activities: [lesson_activity]
    )
    activity_section.reload # clear out any already loaded association data, for verification of query counts

    # seeding_key should not make queries
    assert_queries(0) do
      expected = {
        'activity_section.key' => activity_section.key,
        'lesson_activity.key' => lesson_activity.key
      }
      assert_equal expected, activity_section.seeding_key(seed_context)
    end
  end
end
