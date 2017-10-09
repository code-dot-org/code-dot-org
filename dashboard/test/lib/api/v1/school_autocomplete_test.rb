require 'test_helper'

class Api::V1::SchoolAutocompleteTest < ActiveSupport::TestCase
  test 'to search string with two words' do
    assert_equal '+ABC +DEF*', Api::V1::SchoolAutocomplete.instance.to_search_string('abc def')
  end

  test 'to search string with special chars before second word' do
    assert_equal '+ABC +DEF*', Api::V1::SchoolAutocomplete.instance.to_search_string('abc +def')
  end

  test 'to search string with special characters between two words' do
    assert_equal '+ABC +DEF*', Api::V1::SchoolAutocomplete.instance.to_search_string('abc + def')
  end
end
