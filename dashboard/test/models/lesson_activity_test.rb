require 'test_helper'

class LessonActivityTest < ActiveSupport::TestCase
  test "lesson can contain activities" do
    lesson = create :lesson
    activity1 = create :lesson_activity, lesson: lesson
    activity2 = create :lesson_activity, lesson: lesson
    assert_equal [activity1, activity2], lesson.lesson_activities
  end

  test 'seeding_key' do
    lesson_group = create :lesson_group
    script = lesson_group.script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    lesson_activity = create :lesson_activity, lesson: lesson
    seed_context = Services::ScriptSeed::SeedContext.new(
      script: script,
      lesson_groups: script.lesson_groups.to_a,
      lessons: script.lessons.to_a
    )
    lesson_activity.reload # clear out any already loaded association data, for verification of query counts

    # seeding_key should not make queries
    assert_queries(0) do
      expected = {
        'script.name' => script.name,
        'lesson_group.key' => lesson_group.key,
        'lesson.key' => lesson.key,
        'lesson_activity.key' => lesson_activity.key
      }
      assert_equal expected, lesson_activity.seeding_key(seed_context)
    end
  end
end
