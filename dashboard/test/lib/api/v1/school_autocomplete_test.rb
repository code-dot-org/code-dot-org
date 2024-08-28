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

  test 'search by unique name matches only 1 school' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Chalkville', MAXIMUM_RESULTS, false)
    assert_equal 1, search_results.count
    assert(search_results.detect {|school| school[:nces_id] == '10000200277'})
  end

  test 'search by zip returns match' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('98936', MAXIMUM_RESULTS, false)
    # CHILDREN'S VILLAGE is in 98936
    assert(search_results.detect {|school| school[:nces_id] == '530537003179'})
  end

  test 'search by zip with no schools in it returns no match' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('10001', MAXIMUM_RESULTS, false)
    assert 0, search_results.count
  end

  test 'search by school name also matches city' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Albertville', MAXIMUM_RESULTS, false)
    # ALBERTVILLE HIGH SCH
    assert(search_results.detect {|school| school[:nces_id] == '10000500871'})
    # ALA AVENUE MIDDLE is in	ALBERTVILLE	AL
    assert(search_results.detect {|school| school[:nces_id] == '10000500870'})
  end

  test 'search by partial name matches school' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Albert', MAXIMUM_RESULTS, false)
    # ALBERT EINSTEIN ACADEMY ELEMENTARY
    assert(search_results.detect {|school| school[:nces_id] == '60000113717'})
  end

  test 'search by partial word matches school' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Alb', MAXIMUM_RESULTS, false)
    # ALBERT EINSTEIN ACADEMY ELEMENTARY
    assert(search_results.detect {|school| school[:nces_id] == '60000113717'})
  end

  test 'search by common abbreviation returns multiple matches' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Sch', MAXIMUM_RESULTS, false)
    assert_equal 8, search_results.count
    # Alakanuk School
    assert(search_results.detect {|school| school[:nces_id] == '20000300216'})
    # Sequoyah Sch   Chalkville Campus
    assert(search_results.detect {|school| school[:nces_id] == '10000200277'})
  end

  test 'punctuation in search is ignored' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Pathways-College', MAXIMUM_RESULTS, false)
    assert(search_results.detect {|school| school[:nces_id] == '60001411746'})
  end

  test 'search by non-existent school name has no matches' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('MilhouseWuzHerr', MAXIMUM_RESULTS, false)
    assert_equal 0, search_results.count
  end

  test 'new search by unique name matches only 1 school' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Chalkville', MAXIMUM_RESULTS, true)
    assert_equal 1, search_results.count
    assert(search_results.detect {|school| school[:nces_id] == '10000200277'})
  end

  # New search drops support for search by zip.
  test 'new search by zip does not return match' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('98936', MAXIMUM_RESULTS, true)
    refute(search_results.detect {|school| school[:nces_id] == '530537003179'})
  end

  test 'new search by school name also matches city' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Albertville', MAXIMUM_RESULTS, true)
    # ALBERTVILLE HIGH SCH
    assert(search_results.detect {|school| school[:nces_id] == '10000500871'})
    # ALA AVENUE MIDDLE is in	ALBERTVILLE	AL
    assert(search_results.detect {|school| school[:nces_id] == '10000500870'})
  end

  test 'new search by partial name matches school' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Albert', MAXIMUM_RESULTS, true)
    # ALBERT EINSTEIN ACADEMY ELEMENTARY
    assert(search_results.detect {|school| school[:nces_id] == '60000113717'})
  end

  # New search does not support search by a single partial word.
  test 'new search by partial word does not match school' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Alb', MAXIMUM_RESULTS, true)
    # ALBERT EINSTEIN ACADEMY ELEMENTARY
    refute(search_results.detect {|school| school[:nces_id] == '60000113717'})
  end

  # New search intentionally has fewer low relevance matches with common abbreviations.
  test 'new search by common abbreviation returns multiple matches' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Sch', MAXIMUM_RESULTS, true)
    assert_equal 4, search_results.count
    # Ala Avenue Middle Sch
    assert(search_results.detect {|school| school[:nces_id] == '10000500870'})
    # Albertville High Sch
    assert(search_results.detect {|school| school[:nces_id] == '10000500871'})
  end

  test 'punctuation in new search is ignored' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('Pathways-College', MAXIMUM_RESULTS, true)
    assert(search_results.detect {|school| school[:nces_id] == '60001411746'})
  end

  test 'new search by non-existent school name has no matches' do
    search_results = Api::V1::SchoolAutocomplete.get_matches('MilhouseWuzHerr', MAXIMUM_RESULTS, true)
    assert_equal 0, search_results.count
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
