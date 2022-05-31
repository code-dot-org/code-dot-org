require 'test_helper'

class StandardsAutocompleteTest < ActiveSupport::TestCase
  # We rely on fulltext indices to be used in this test.
  #
  # Fulltext indexes are only updated when database changes are committed,
  # which means they will not be updated within a transactional test case:
  # https://dev.mysql.com/doc/refman/8.0/en/fulltext-restrictions.html
  # This makes it hard to create a standard via factory and then search for it.
  #
  # Currently, all standards from dashboard/config/standards/ are seeded in unit
  # tests, and these unit tests search against those standards.

  setup do
    @iste = Framework.find_by!(shortcode: 'iste')
    @csta = Framework.find_by!(shortcode: 'csta')
  end

  test "finds standard with matching description from single framework" do
    matches = StandardsAutocomplete.get_search_matches('Plan ', 5, @iste.id)
    assert_equal 2, matches.length
    assert_equal ['3.a', '4.b'].sort, matches.map {|m| m[:shortcode]}.sort
  end

  test "finds standard with matching description from any framework" do
    # There are more than 20 results matching this query. Limit the number of
    # results so that we always get the same answer.
    matches = StandardsAutocomplete.get_search_matches('Plan ', 20)
    assert_equal 20, matches.length
  end

  test "finds by words in middle of the description" do
    matches = StandardsAutocomplete.get_search_matches('evaluate', 5, @iste.id)
    assert_equal 2, matches.length
    assert_equal ['3.b', '3.c'].sort, matches.map {|m| m[:shortcode]}.sort
  end

  test "matches nonconsecutive words in description" do
    matches = StandardsAutocomplete.get_search_matches('computer security', 5, @csta.id)
    assert_equal 2, matches.length
    assert_equal ['3A-NI-07', '3B-AP-18'].sort, matches.map {|m| m[:shortcode]}.sort
  end

  test "finds a single standard by framework and shortcode" do
    matches = StandardsAutocomplete.get_search_matches('6.d', 5, @iste.id)
    assert_equal 1, matches.length
    assert_equal 'iste', matches[0][:frameworkShortcode]
    assert_equal '6.d', matches[0][:shortcode]
  end

  test "finds standards by framework and shortcode substring" do
    matches = StandardsAutocomplete.get_search_matches('6.', 5, @iste.id)
    assert_equal 4, matches.length
    assert_equal ['6.a', '6.b', '6.c', '6.d'].sort, matches.map {|m| m[:shortcode]}.sort
  end

  # important because fulltext search in boolean mode treats dashes specially.
  test "finds standard by shortcode containing dashes" do
    matches = StandardsAutocomplete.get_search_matches('1A-AP-08', 5)
    assert_equal 1, matches.length
    assert_equal '1A-AP-08', matches[0][:shortcode]
  end
end
