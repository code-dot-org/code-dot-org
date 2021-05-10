require 'test_helper'

class LessonsStandardTest < ActiveSupport::TestCase
  test 'lesson and standard associations' do
    lesson = create :lesson
    standard = create :standard
    lesson.standards.push(standard)

    lesson_standard = lesson.lessons_standards.first
    assert_equal lesson, lesson_standard.lesson
    assert_equal standard, lesson_standard.standard
  end

  test 'seeding_key' do
    lesson_group = create :lesson_group
    script = lesson_group.script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    standard = create :standard
    lesson.standards.push(standard)
    seed_context = Services::ScriptSeed::SeedContext.new(
      script: script,
      lesson_groups: script.lesson_groups.to_a,
      lessons: script.lessons.to_a,
      frameworks: [standard.framework],
      standards: [standard]
    )
    lessons_standard = lesson.lessons_standards.first

    # seeding_key should not make queries
    assert_queries(0) do
      expected = {
        'lesson.key' => lesson.key,
        'framework.shortcode' => standard.framework.shortcode,
        'standard.shortcode' => standard.shortcode
      }
      assert_equal expected, lessons_standard.seeding_key(seed_context)
    end
  end
end
