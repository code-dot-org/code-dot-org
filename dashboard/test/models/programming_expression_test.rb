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

  class KeyConstraintTests < ActiveSupport::TestCase
    setup do
      @programming_environment = create :programming_environment
    end

    test "programming expression key cannot be blank" do
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: '', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end

    test "programming expression cannot key with invalid characters" do
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: 'an invalid key', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end

    test "programming expression key cannot start with a period" do
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: '.key', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end

    test "programming expression key cannot end with a period" do
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: 'key.', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end

    test "programming expression key uniqueness ignores casing" do
      create :programming_expression, key: 'myBlock', programming_environment: @programming_environment
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: 'myblock', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end
  end
end
