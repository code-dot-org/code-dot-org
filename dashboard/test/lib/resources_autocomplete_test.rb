require 'test_helper'

class ResourcesAutocompleteTest < ActiveSupport::TestCase
  # We rely on fulltext indices to be used in this test.
  # In order to get this test to work, we need to have the resources created
  # as fixtures. These are defined in test/fixtures/resource.yml

  test "finds resource with matching name" do
    matches = ResourcesAutocomplete.get_search_matches('Studi', 5)
    assert_equal 1, matches.length
    assert_equal 'Code Studio', matches[0]['name']
  end

  test "finds resource with matching url" do
    matches = ResourcesAutocomplete.get_search_matches("wikip", 5)
    assert_equal 1, matches.length
    assert_equal 'wiki', matches[0]['name']
  end

  test "finds multiple matches" do
    matches = ResourcesAutocomplete.get_search_matches("class", 5)
    assert_equal 2, matches.length
  end
end
