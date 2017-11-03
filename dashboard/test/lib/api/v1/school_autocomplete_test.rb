require 'test_helper'

class Api::V1::SchoolAutocompleteTest < ActiveSupport::TestCase
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
end
