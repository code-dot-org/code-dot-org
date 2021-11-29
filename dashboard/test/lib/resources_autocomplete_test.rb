require 'test_helper'

class ResourcesAutocompleteTest < ActiveSupport::TestCase
  # We rely on fulltext indices to be used in this test.
  # In order to get this test to work, we need to have the resources created
  # as fixtures. These are defined in test/fixtures/resource.yml

  setup do
    @course_version_2018 = CourseVersion.find_by_key('2018')
    @course_version_2019 = CourseVersion.find_by_key('2019')
  end

  test "finds resource with matching name" do
    matches = ResourcesAutocomplete.get_search_matches('Studi', 5, @course_version_2018.id)
    assert_equal 1, matches.length
    assert_equal 'Code Studio', matches[0][:name]
  end

  test "finds resource with matching url" do
    matches = ResourcesAutocomplete.get_search_matches("wikip", 5, @course_version_2018.id)
    assert_equal 1, matches.length
    assert_equal 'wiki', matches[0][:name]
  end

  test "finds multiple matches" do
    matches = ResourcesAutocomplete.get_search_matches("class", 5, @course_version_2018.id)
    assert_equal 2, matches.length
  end

  test "limits matches by course version id" do
    # There are three resources that have a name or url matching "class".
    # Two are not associated with a course version and one is. Let's make
    # sure the correct ones are fetched in each case.
    matches = ResourcesAutocomplete.get_search_matches("class", 5, @course_version_2018.id)
    assert_equal 2, matches.length
    assert_equal ['resource_103', 'resource_104'], matches.map {|m| m[:key]}.sort

    # Check that specifying a course version id finds an associated resource
    matches = ResourcesAutocomplete.get_search_matches("class", 5, @course_version_2019.id)
    assert_equal 1, matches.length
    assert_equal 'resource_105', matches[0][:key]
  end

  test "only returns up to limit matches" do
    matches = ResourcesAutocomplete.get_search_matches("class", 1, @course_version_2018.id)
    assert_equal 1, matches.length
  end

  test "returns empty list for short query" do
    matches = ResourcesAutocomplete.get_search_matches("cl", 5, @course_version_2018.id)
    assert_equal [], matches
  end
end
