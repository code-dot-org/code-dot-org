require 'test_helper'

class ResourcesAutocompleteTest < ActiveSupport::TestCase
  # We rely on fulltext indices to be used in this test.
  # From my experiments, this was the only way to get those created
  self.use_transactional_tests = false

  setup do
    @resources = [
      create(:resource, name: 'Code Studio', url: 'code.org'),
      create(:resource, name: 'wiki', url: 'wikipedia.org'),
      create(:resource, name: 'class slides', url: 'docs.google.com/slides'),
      create(:resource, name: 'class site', url: 'testwebsite.fake')
    ]
  end

  teardown do
    @resources.each(&:destroy)
  end

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
