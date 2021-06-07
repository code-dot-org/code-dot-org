require 'test_helper'

class ProgrammingExpressionAutocompleteTest < ActiveSupport::TestCase
  # We rely on fulltext indices to be used in this test.
  # In order to get this test to work, we need to have the programming expressions and programming environments created
  # as fixtures. These are defined in test/fixtures/programming_expression.yml and test/fixtures/programming_environment.yml

  test "finds programming_expression with matching name" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches(1, 'stopSound',  nil)
    assert_equal 1, matches[:programmingExpressions].length
    assert_equal 'stopSound', matches[:programmingExpressions][0][:name]
    assert_equal 'applab', matches[:programmingExpressions][0][:programmingEnvironmentName]
  end

  test "finds programming_expression with matching category" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches(1, 'Drawing',  nil)
    assert_equal 1, matches[:programmingExpressions].length
    assert_equal 'background', matches[:programmingExpressions][0][:name]
  end

  test "finds multiple matches" do
    matches = ProgrammingExpressionAutocomplete.get_search_matches(1, 'play',  nil)
    assert_equal 2, matches[:programmingExpressions].length
    assert matches[:programmingExpressions].map {|m| m[:key]}.include? 'playSound-1'
    assert matches[:programmingExpressions].map {|m| m[:key]}.include? 'playSound-2'
  end

  test "restricts matches by programming environment" do
    # There's a blocks with Sound in them in two programming environments
    # We should only get the one we requested
    matches = ProgrammingExpressionAutocomplete.get_search_matches(1, 'play', ProgrammingEnvironment.find_by(name: 'gamelab'))
    assert_equal 1, matches[:programmingExpressions].length
    assert_equal ProgrammingEnvironment.find_by(name: 'gamelab').id, ProgrammingExpression.find_by(key: matches[:programmingExpressions][0][:key]).programming_environment_id
  end
end
