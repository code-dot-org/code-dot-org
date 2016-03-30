require 'minitest/autorun'
require 'rack/test'

require_relative '../../lib/state_abbr.rb'

class CountryCodesTest < Minitest::Test
  def test_get_state_name_from_abbr_lowercase_symbol
    assert_equal 'Illinois', get_state_name_from_abbr(:il)
    assert_equal 'Washington', get_state_name_from_abbr(:wa)
  end

  def test_get_state_name_from_abbr_uppercase_symbol
    assert_equal 'Illinois', get_state_name_from_abbr(:IL)
    assert_equal 'Washington', get_state_name_from_abbr(:WA)
  end

  def test_get_state_name_from_abbr_lowercase_string
    assert_equal 'Illinois', get_state_name_from_abbr('il')
    assert_equal 'Washington', get_state_name_from_abbr('wa')
  end

  def test_get_state_name_from_abbr_uppercase_string
    assert_equal 'Illinois', get_state_name_from_abbr('IL')
    assert_equal 'Washington', get_state_name_from_abbr('WA')
  end
end
