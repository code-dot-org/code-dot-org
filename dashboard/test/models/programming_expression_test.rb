require 'test_helper'

class ProgrammingExpressionTest < ActiveSupport::TestCase
  test "can create programming expression" do
    programming_expression = create :programming_expression
    assert programming_expression.name
  end
end
