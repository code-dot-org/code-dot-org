require 'test_helper'

class LessonsProgrammingExpressionTest < ActiveSupport::TestCase
  test 'lesson and programming_expression associations' do
    lesson = create :lesson
    programming_expression = create :programming_expression
    lesson.programming_expressions.push(programming_expression)

    lesson_programming_expression = lesson.lessons_programming_expressions.first
    assert_equal lesson, lesson_programming_expression.lesson
    assert_equal programming_expression, lesson_programming_expression.programming_expression
  end

  test 'seeding_key' do
    lesson_group = create :lesson_group
    script = lesson_group.script
    lesson = create :lesson, lesson_group: lesson_group, script: script
    programming_expression = create :programming_expression
    lesson.programming_expressions.push(programming_expression)
    seed_context = Services::ScriptSeed::SeedContext.new(
      script: script,
      lesson_groups: script.lesson_groups.to_a,
      lessons: script.lessons.to_a,
      programming_environments: [programming_expression.programming_environment],
      programming_expressions: [programming_expression]
    )
    lessons_programming_expression = lesson.lessons_programming_expressions.first

    # seeding_key should not make queries
    assert_queries(0) do
      expected = {
        'lesson.key' => lesson.key,
        'programming_environment.name' => programming_expression.programming_environment.name,
        'programming_expression.key' => programming_expression.key
      }
      assert_equal expected, lessons_programming_expression.seeding_key(seed_context)
    end
  end
end
