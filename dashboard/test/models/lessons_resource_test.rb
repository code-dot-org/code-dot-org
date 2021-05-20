require 'test_helper'

class LessonsResourceTest < ActiveSupport::TestCase
  test 'lesson and resource associations' do
    lesson = create :lesson
    resource = create :resource
    lesson.resources.push(resource)

    lesson_resource = lesson.lessons_resources.first
    assert_equal lesson, lesson_resource.lesson
    assert_equal resource, lesson_resource.resource
  end

  test 'seeding_key' do
    lesson_group = create :lesson_group
    script = lesson_group.script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    resource = create :resource
    lesson.resources.push(resource)
    seed_context = Services::ScriptSeed::SeedContext.new(
      script: script,
      lesson_groups: script.lesson_groups.to_a,
      lessons: script.lessons.to_a,
      resources: [resource]
    )
    lessons_resource = lesson.lessons_resources.first

    # seeding_key should not make queries
    assert_queries(0) do
      expected = {
        'lesson.key' => lesson.key,
        'resource.key' => resource.key
      }
      assert_equal expected, lessons_resource.seeding_key(seed_context)
    end
  end
end
