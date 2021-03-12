require 'test_helper'

class VocabularyAutocompleteTest < ActiveSupport::TestCase
  # We rely on fulltext indices to be used in this test.
  # In order to get this test to work, we need to have the vocabularies created
  # as fixtures. These are defined in test/fixtures/vocabulary.yml

  setup do
    @course_version_2018 = CourseVersion.find_by_key('2018')
    @course_version_2019 = CourseVersion.find_by_key('2019')
  end

  test "finds vocabulary with matching word" do
    matches = VocabularyAutocomplete.get_search_matches('programming', 5, @course_version_2018.id)
    assert_equal 1, matches.length
    assert_equal 'Programming', matches[0][:word]
    assert_equal 'The art of creating a program.', matches[0][:definition]
  end

  test "finds vocabulary with match definition" do
    matches = VocabularyAutocomplete.get_search_matches('fixing', 5, @course_version_2018)
    assert_equal 1, matches.length
    assert_equal 'Debugging', matches[0][:word]
  end

  test "finds multiple matches" do
    matches = VocabularyAutocomplete.get_search_matches('pro', 5, @course_version_2018)
    assert_equal 2, matches.length
    assert_equal ['Debugging', 'Programming'], matches.map {|m| m[:word]}
  end

  test "restricts matches by limit" do
    matches = VocabularyAutocomplete.get_search_matches('pro', 1, @course_version_2018)
    assert_equal 1, matches.length
  end

  test "restricts matches by course version id" do
    # There's a definition for algorithm in two course versions
    # We should only get the one we requested
    matches = VocabularyAutocomplete.get_search_matches('algorithm', 1, @course_version_2019)
    assert_equal 1, matches.length
    assert_equal @course_version_2019.id, Vocabulary.find(matches[0][:id]).course_version_id
  end
end
