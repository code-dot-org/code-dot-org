require 'test_helper'

class ProgrammingExpressionTest < ActiveSupport::TestCase
  test "can create programming expression" do
    programming_environment = create :programming_environment
    programming_expression = create :programming_expression, programming_environment: programming_environment
    assert_equal programming_expression
  end
end
