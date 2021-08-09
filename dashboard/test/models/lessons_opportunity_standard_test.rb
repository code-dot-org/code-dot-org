require 'test_helper'

class LessonsOpportunityStandardTest < ActiveSupport::TestCase
  test 'seeding_key' do
    lesson_group = create :lesson_group
    script = lesson_group.script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    standard = create :standard
    lesson.opportunity_standards.push(standard)
    seed_context = Services::ScriptSeed::SeedContext.new(
      script: script,
      lesson_groups: script.lesson_groups.to_a,
      lessons: script.lessons.to_a,
      frameworks: [standard.framework],
      standards: [standard]
    )
    lessons_opportunity_standard = lesson.lessons_opportunity_standards.first

    # seeding_key should not make queries
    assert_queries(0) do
      expected = {
        'lesson.key' => lesson.key,
        'framework.shortcode' => standard.framework.shortcode,
        'opportunity_standard.shortcode' => standard.shortcode
      }
      assert_equal expected, lessons_opportunity_standard.seeding_key(seed_context)
    end
  end
end
