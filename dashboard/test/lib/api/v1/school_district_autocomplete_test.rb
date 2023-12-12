require 'test_helper'

class Api::V1::SchoolDistrictAutocompleteTest < ActiveSupport::TestCase
  MAXIMUM_RESULTS = 24

  test 'search by unique name matches only 1 school district' do
    search_results = Api::V1::SchoolDistrictAutocomplete.get_matches('LOWER KUSKOKWIM SCHOOL DISTRICT', MAXIMUM_RESULTS)
    assert_equal 1, search_results.count
    assert(search_results.detect {|school_district| school_district[:nces_id] == '200001'})
  end

  test 'search by city returns match' do
    search_results = Api::V1::SchoolDistrictAutocomplete.get_matches('Baxley', MAXIMUM_RESULTS)
    # APPLING COUNTY district is headquartered in Baxley
    assert(search_results.detect {|school_district| school_district[:nces_id] == '1300060'})
  end

  test 'search by city with no matching districts returns no match' do
    search_results = Api::V1::SchoolDistrictAutocomplete.get_matches('Baton Rouge', MAXIMUM_RESULTS)
    assert 0, search_results.count
  end

  test 'search by partial name matches school district' do
    search_results = Api::V1::SchoolDistrictAutocomplete.get_matches('Appling', MAXIMUM_RESULTS)
    # Appling County
    assert(search_results.detect {|school_district| school_district[:nces_id] == '1300060'})
  end

  test 'search by partial word matches school district' do
    search_results = Api::V1::SchoolDistrictAutocomplete.get_matches('App', MAXIMUM_RESULTS)
    # Appling County
    assert(search_results.detect {|school_district| school_district[:nces_id] == '1300060'})
  end

  test 'search with punctuation matches school district with punctuation in name' do
    search_results = Api::V1::SchoolDistrictAutocomplete.get_matches('Acton-Agua Dulce Unified', MAXIMUM_RESULTS)
    assert(search_results.detect {|school_district| school_district[:nces_id] == '600001'})
  end

  test 'search by non-existent school district name has no matches' do
    search_results = Api::V1::SchoolDistrictAutocomplete.get_matches('MilhouseWuzHerr Unified School District', MAXIMUM_RESULTS)
    assert_equal 0, search_results.count
  end
end
