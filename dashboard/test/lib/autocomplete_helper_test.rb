require 'test_helper'

class AutocompleteHelperTest < ActiveSupport::TestCase
  test 'to search string with two words' do
    assert_equal '+ABC +DEF*', AutocompleteHelper.format_query('abc def')
  end

  test 'to search string with special chars before second word' do
    assert_equal '+ABC +DEF*', AutocompleteHelper.format_query('abc +def')
  end

  test 'to search string with special characters between two words' do
    assert_equal '+ABC +DEF*', AutocompleteHelper.format_query('abc + def')
  end

  test 'terms split on hyphen' do
    assert_equal ['WINSTON', 'SALEM'], AutocompleteHelper.get_query_terms('WINSTON-SALEM')
  end

  test 'terms split on space' do
    assert_equal ['WINSTON', 'SALEM'], AutocompleteHelper.get_query_terms('WINSTON SALEM')
  end

  test 'terms split on apostrophe' do
    assert_equal ['CHILDREN', 'S', 'VILLAGE', 'ACADEMY'], AutocompleteHelper.get_query_terms("CHILDREN'S VILLAGE ACADEMY")
  end
end
