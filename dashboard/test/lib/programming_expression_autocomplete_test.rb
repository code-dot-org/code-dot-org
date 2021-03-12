require 'test_helper'

class ProgrammingExpressionAutocompleteTest < ActiveSupport::TestCase
  # We rely on fulltext indices to be used in this test.
  # In order to get this test to work, we need to have the programming expressions and programming environments created
  # as fixtures. These are defined in test/fixtures/programming_expression.yml and test/fixtures/programming_environment.yml

  test "finds programming_expression with matching name" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches('stopSound', 5, nil)
    assert_equal 1, matches.length
    assert_equal 'stopSound', matches[0][:name]
    assert_equal 'applab', matches[0][:programmingEnvironmentName]
  end

  test "finds programming_expression with matching category" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches('Drawing', 5, nil)
    assert_equal 1, matches.length
    assert_equal 'background', matches[0][:name]
  end

  test "finds multiple matches" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches('play', 5, nil)
    assert_equal 2, matches.length
    assert_equal ['playSound-1', 'playSound-2'], matches.map {|m| m[:key]}
  end

  test "restricts matches by limit" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches('play', 1, nil)
    assert_equal 1, matches.length
  end

  test "restricts matches by programming environment id" do
    # There's a blocks with Sound in them in two programming environments
    # We should only get the one we requested
    matches = ProgrammingExpressionAutocomplete.get_search_matches('play', 3, ProgrammingEnvironment.find_by(name: 'gamelab').id)
    assert_equal 1, matches.length
    assert_equal ProgrammingEnvironment.find_by(name: 'gamelab').id, ProgrammingExpression.find_by(key: matches[0][:key]).programming_environment_id
  end
end
