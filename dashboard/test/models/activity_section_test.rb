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
end
