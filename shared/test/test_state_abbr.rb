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
    assert_nil get_us_state_from_abbr(:ZZ)
    assert_nil get_us_state_from_abbr(:ZZ, false)
    assert_nil get_us_state_from_abbr(:ZZ, true)
  end

  def test_get_us_state_from_abbr_with_include_dc
    assert_equal 'Illinois', get_us_state_from_abbr(:IL, false)
    assert_equal 'Illinois', get_us_state_from_abbr(:IL, true)
    assert_equal 'Washington', get_us_state_from_abbr(:WA, false)
    assert_equal 'Washington', get_us_state_from_abbr(:WA, true)
  end

  def test_get_us_state_from_abbr_washington_dc
    assert_nil get_us_state_from_abbr(:dc)
    assert_nil get_us_state_from_abbr(:DC)
    assert_nil get_us_state_from_abbr('dc')
    assert_nil get_us_state_from_abbr('DC')

    assert_nil get_us_state_from_abbr(:dc, false)
    assert_nil get_us_state_from_abbr(:DC, false)
    assert_nil get_us_state_from_abbr('dc', false)
    assert_nil get_us_state_from_abbr('DC', false)

    assert_equal 'Washington DC', get_us_state_from_abbr(:dc, true)
    assert_equal 'Washington DC', get_us_state_from_abbr(:DC, true)
    assert_equal 'Washington DC', get_us_state_from_abbr('dc', true)
    assert_equal 'Washington DC', get_us_state_from_abbr('DC', true)
  end

  def test_get_us_state_abbr_from_name_lowercase_symbol
    assert_equal 'IL', get_us_state_abbr_from_name(:illinois)
    assert_equal 'WA', get_us_state_abbr_from_name(:washington)
  end

  def test_get_us_state_abbr_from_name_uppercase_symbol
    assert_equal 'IL', get_us_state_abbr_from_name(:ILLINOIS)
    assert_equal 'WA', get_us_state_abbr_from_name(:WASHINGTON)
  end

  def test_get_us_state_abbr_from_name_lowercase_string
    assert_equal 'IL', get_us_state_abbr_from_name('illinois')
    assert_equal 'WA', get_us_state_abbr_from_name('washington')
  end

  def test_get_us_state_abbr_from_name_uppercase_string
    assert_equal 'IL', get_us_state_abbr_from_name('ILLINOIS')
    assert_equal 'WA', get_us_state_abbr_from_name('WASHINGTON')
  end

  def test_get_us_state_abbr_from_name_string_with_whitespace
    assert_equal 'IL', get_us_state_abbr_from_name(' Illinois   ')
    assert_equal 'WA', get_us_state_abbr_from_name('  Washington  ')
  end

  def test_get_us_state_abbr_from_name_nonstate
    assert_nil get_us_state_abbr_from_name('Nonexistent')
    assert_nil get_us_state_abbr_from_name('Nonexistent', false)
    assert_nil get_us_state_abbr_from_name('Nonexistent', true)
  end

  def test_get_us_state_abbr_from_name_with_include_dc
    assert_equal 'IL', get_us_state_abbr_from_name('Illinois', false)
    assert_equal 'IL', get_us_state_abbr_from_name('Illinois', true)
    assert_equal 'WA', get_us_state_abbr_from_name('Washington', false)
    assert_equal 'WA', get_us_state_abbr_from_name('Washington', true)
  end

  def test_get_us_state_abbr_from_name_washington_dc
    assert_nil get_us_state_abbr_from_name(:washington_dc)
    assert_nil get_us_state_abbr_from_name(:WASHINGTON_DC)
    assert_nil get_us_state_abbr_from_name('Washington DC')
    assert_nil get_us_state_abbr_from_name('WASHINGTON DC')

    assert_nil get_us_state_abbr_from_name(:washington_dc, false)
    assert_nil get_us_state_abbr_from_name(:WASHINGTON_DC, false)
    assert_nil get_us_state_abbr_from_name('Washington DC', false)
    assert_nil get_us_state_abbr_from_name('WASHINGTON DC', false)

    assert_equal 'DC', get_us_state_abbr_from_name(:washington_dc, true)
    assert_equal 'DC', get_us_state_abbr_from_name(:WASHINGTON_DC, true)
    assert_equal 'DC', get_us_state_abbr_from_name('Washington DC', true)
    assert_equal 'DC', get_us_state_abbr_from_name('WASHINGTON DC', true)
  end

  def test_get_us_state_abbr
    # This method will coerce to the two-letter abbreviation
    # whether you pass it an abbreviation or full name.
    assert_equal 'IL', get_us_state_abbr('Illinois')
    assert_equal 'IL', get_us_state_abbr('il')
    assert_equal 'WA', get_us_state_abbr('Washington')
    assert_equal 'WA', get_us_state_abbr('wa')
    assert_nil get_us_state_abbr('British Columbia')
    assert_nil get_us_state_abbr('BC')

    # With DC option
    assert_equal 'DC', get_us_state_abbr('Washington DC', true)
    assert_equal 'DC', get_us_state_abbr('dc', true)
    assert_nil get_us_state_abbr('Washington DC', false)
    assert_nil get_us_state_abbr('dc', false)
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
