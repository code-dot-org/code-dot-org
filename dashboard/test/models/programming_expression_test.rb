require 'test_helper'

class ProgrammingExpressionTest < ActiveSupport::TestCase
  test "can create programming expression" do
    programming_expression = create :programming_expression
    assert programming_expression.name
    assert programming_expression.key
  end

  test "programming expression can be added to a lesson" do
    lesson = create :lesson
    programming_expression = create :programming_expression, lessons: [lesson]
    assert_equal 1, programming_expression.lessons.length
    assert_equal 1, lesson.programming_expressions.length
  end
end
