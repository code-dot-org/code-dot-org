require 'test_helper'

class ProgrammingExpressionAutocompleteTest < ActiveSupport::TestCase
  # We rely on fulltext indices to be used in this test.
  # In order to get this test to work, we need to have the programming expressions created
  # as fixtures. These are defined in test/fixtures/programming_expression.yml

  test "finds programming_expression with matching name" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches('stopSound', 5)
    assert_equal 1, matches.length
    assert_equal 'stopSound', matches[0][:name]
    assert_equal 'applab', matches[0][:programming_environment].name
  end

  test "finds multiple matches" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches('Sound', 5)
    assert_equal 2, matches.length
    assert_equal ['stopSound', 'playSound'], matches.map {|m| m[:name]}
  end

  test "restricts matches by limit" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches('Sound', 1)
    assert_equal 1, matches.length
  end
end
