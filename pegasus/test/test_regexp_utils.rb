require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require_relative '../src/env'
require_relative '../../lib/cdo/regexp'

class RegexpUtilsTest < Minitest::Unit::TestCase
  def test_find_potential_email
    assert_nil(RegexpUtils.find_potential_email('holla@me'))
    assert_equal('test@example.com', RegexpUtils.find_potential_email('test@example.com'))
    assert_equal('test@example.shoes', RegexpUtils.find_potential_email('test@example.shoes'))
    assert_equal('test@example.shoesandotherstuff.co.nz', RegexpUtils.find_potential_email('test@example.shoesandotherstuff.co.nz'))
    assert_equal('test@example.shoes', RegexpUtils.find_potential_email('other content test@example.shoes other content'))
  end

  def test_find_us_phone_numbers
    assert_nil(RegexpUtils.find_potential_phone_number('this is just some text'))
    assert_nil(RegexpUtils.find_potential_phone_number('12345 is a cool number'))
    assert_nil(RegexpUtils.find_potential_phone_number('353 and 44448 is a cool number'))
    assert_nil(RegexpUtils.find_potential_phone_number('5555555555'))
    assert_nil(RegexpUtils.find_potential_phone_number('15555555555'))

    assert(RegexpUtils.find_potential_phone_number('1-555-555-5555'))
    assert(RegexpUtils.find_potential_phone_number('555-555-5555'))
    assert_equal('555-555-5555', RegexpUtils.find_potential_phone_number('555-555-5555'))
    assert(RegexpUtils.find_potential_phone_number('1(555)555-5555'))
    assert(RegexpUtils.find_potential_phone_number('1-555-555-5555'))
    assert(RegexpUtils.find_potential_phone_number('1.555.555.5555'))
    assert(RegexpUtils.find_potential_phone_number('1 555 555 5555'))
    assert(RegexpUtils.find_potential_phone_number('1_555_555_5555'))
    assert_equal('555 555 5555', RegexpUtils.find_potential_phone_number('1 555 555 5555'))
  end
end
