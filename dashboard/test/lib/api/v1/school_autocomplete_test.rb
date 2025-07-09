require 'test_helper'

class Api::V1::SchoolAutocompleteTest < ActiveSupport::TestCase
  MAXIMUM_RESULTS = 24

  test 'is zip search with four digits' do
    assert_equal true, Api::V1::SchoolAutocomplete.search_by_zip?('1234')
  end

  test 'is zip search with extended partial zip and nothing after the hyphen' do
    assert_equal true, Api::V1::SchoolAutocomplete.search_by_zip?('12345-')
  end

  test 'is zip search with extended partial zip and two digits the hyphen' do
    assert_equal true, Api::V1::SchoolAutocomplete.search_by_zip?('12345-12')
  end

  test 'is zip search with alphabetic string' do
    assert_equal false, Api::V1::SchoolAutocomplete.search_by_zip?('abc')
  end

  test 'is zip search with invalid extended partial zip' do
    assert_equal false, Api::V1::SchoolAutocomplete.search_by_zip?('12345-ab')
  end

  test 'zip_search returns match' do
    search_results = Api::V1::SchoolAutocomplete.get_zip_matches('27105')
    # QUALITY EDUCATION ACADEMY is in 27105
    assert(search_results.detect {|school| school[:nces_id] == '370002502096'})
  end

  test 'zip_search by zip with no schools in it returns no match' do
    search_results = Api::V1::SchoolAutocomplete.get_zip_matches('10001')
    assert 0, search_results.count
  end

  test 'zip_search for outdated school returns no match' do
    # CHILDREN'S VILLAGE is in 98936, but last_known_school_year_open is a year behind all other schools
    search_results = Api::V1::SchoolAutocomplete.get_zip_matches('98936')
    assert 0, search_results.count
  end
end
