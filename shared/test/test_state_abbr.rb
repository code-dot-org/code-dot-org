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
    assert_equal nil, get_us_state_from_abbr(:ZZ)
    assert_equal nil, get_us_state_from_abbr(:ZZ, false)
    assert_equal nil, get_us_state_from_abbr(:ZZ, true)
  end

  def test_get_us_state_from_abbr_with_include_dc
    assert_equal 'Illinois', get_us_state_from_abbr(:IL, false)
    assert_equal 'Illinois', get_us_state_from_abbr(:IL, true)
    assert_equal 'Washington', get_us_state_from_abbr(:WA, false)
    assert_equal 'Washington', get_us_state_from_abbr(:WA, true)
  end

  def test_get_us_state_from_abbr_washington_dc
    assert_equal nil, get_us_state_from_abbr(:dc)
    assert_equal nil, get_us_state_from_abbr(:DC)
    assert_equal nil, get_us_state_from_abbr('dc')
    assert_equal nil, get_us_state_from_abbr('DC')

    assert_equal nil, get_us_state_from_abbr(:dc, false)
    assert_equal nil, get_us_state_from_abbr(:DC, false)
    assert_equal nil, get_us_state_from_abbr('dc', false)
    assert_equal nil, get_us_state_from_abbr('DC', false)

    assert_equal 'Washington DC', get_us_state_from_abbr(:dc, true)
    assert_equal 'Washington DC', get_us_state_from_abbr(:DC, true)
    assert_equal 'Washington DC', get_us_state_from_abbr('dc', true)
    assert_equal 'Washington DC', get_us_state_from_abbr('DC', true)
  end

  def test_us_state_abbr
    assert_equal true, us_state_abbr?(:IL)
    assert_equal true, us_state_abbr?(:IL, false)
    assert_equal true, us_state_abbr?(:IL, true)
    assert_equal true, us_state_abbr?(:WA)
    assert_equal true, us_state_abbr?(:WA, false)
    assert_equal true, us_state_abbr?(:WA, true)

    assert_equal false, us_state_abbr?(:DC)
    assert_equal false, us_state_abbr?(:DC, false)
    assert_equal true, us_state_abbr?(:DC, true)

    assert_equal false, us_state_abbr?(:ZZ)
    assert_equal false, us_state_abbr?(:ZZ, false)
    assert_equal false, us_state_abbr?(:ZZ, true)
  end
end
