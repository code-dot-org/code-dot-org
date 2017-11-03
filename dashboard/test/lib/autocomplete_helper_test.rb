require 'test_helper'

class AutocompleteHelperTest < ActiveSupport::TestCase
  test 'to search string with two words' do
    assert_equal '+ABC +DEF*', AutocompleteHelper.to_search_string('abc def')
  end

  test 'to search string with special chars before second word' do
    assert_equal '+ABC +DEF*', AutocompleteHelper.to_search_string('abc +def')
  end

  test 'to search string with special characters between two words' do
    assert_equal '+ABC +DEF*', AutocompleteHelper.to_search_string('abc + def')
  end
end
