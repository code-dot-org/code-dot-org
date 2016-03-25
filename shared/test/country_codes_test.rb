require 'minitest/autorun'
require 'rack/test'

require_relative '../../lib/country_codes.rb'

class CountryCodesTest < Minitest::Test
  def test_country_name_from_code_valid_codes
    assert_equal 'Andorra', country_name_from_code('ad')
    assert_equal 'Andorra', country_name_from_code('AD')
    assert_equal 'Andorra', country_name_from_code(' AD  ')

    assert_equal 'United States', country_name_from_code('us')
    assert_equal 'United States', country_name_from_code('US')
    assert_equal 'United States', country_name_from_code(' US  ')
  end

  def test_country_name_from_code_invalid_codes
    assert_equal '', country_name_from_code('')
    assert_equal 'ZZ', country_name_from_code('ZZ')
    assert_equal 'my country', country_name_from_code('my country')
  end
end
