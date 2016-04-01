require 'minitest/autorun'
require 'rack/test'

require_relative '../../lib/state_abbr.rb'

class StateAbbrTest < Minitest::Test
  def test_get_us_state_from_abbr_lowercase_symbol
    assert_equal 'Illinois', get_us_state_from_abbr(:il)
    assert_equal 'Washington', get_us_state_from_abbr(:wa)
  end

  def test_get_us_state_from_abbr_uppercase_symbol
    assert_equal 'Illinois', get_us_state_from_abbr(:IL)
    assert_equal 'Washington', get_us_state_from_abbr(:WA)
  end

  def test_get_us_state_from_abbr_lowercase_string
    assert_equal 'Illinois', get_us_state_from_abbr('il')
    assert_equal 'Washington', get_us_state_from_abbr('wa')
  end

  def test_get_us_state_from_abbr_uppercase_string
    assert_equal 'Illinois', get_us_state_from_abbr('IL')
    assert_equal 'Washington', get_us_state_from_abbr('WA')
  end

  def test_get_us_state_from_abbr_string_with_whitespace
    assert_equal 'Illinois', get_us_state_from_abbr(' IL   ')
    assert_equal 'Washington', get_us_state_from_abbr('  WA  ')
  end

  def test_get_us_state_from_abbr_nonstate
    assert_equal nil, get_us_state_from_abbr(:DC)
    assert_equal nil, get_us_state_from_abbr(:ZZ)
  end

  def test_get_us_state_with_dc_from_abbr
    assert_equal 'Washington DC', get_us_state_with_dc_from_abbr(:dc)
    assert_equal 'Washington DC', get_us_state_with_dc_from_abbr(:DC)
    assert_equal 'Washington DC', get_us_state_with_dc_from_abbr('dc')
    assert_equal 'Washington DC', get_us_state_with_dc_from_abbr('DC')

    assert_equal 'Illinois', get_us_state_with_dc_from_abbr(:il)
    assert_equal 'Illinois', get_us_state_with_dc_from_abbr(:IL)
    assert_equal 'Illinois', get_us_state_with_dc_from_abbr('il')
    assert_equal 'Illinois', get_us_state_with_dc_from_abbr('IL')
  end

  def test_get_us_state_with_dc_from_abbr_nonstate
    assert_equal nil, get_us_state_with_dc_from_abbr(:ZZ)
  end

  def test_us_state_with_dc_abbr
    assert_equal true, us_state_with_dc_abbr?(:DC)
    assert_equal true, us_state_with_dc_abbr?(:IL)
    assert_equal true, us_state_with_dc_abbr?(:WA)

    assert_equal false, us_state_with_dc_abbr?(:ZZ)
  end
end
