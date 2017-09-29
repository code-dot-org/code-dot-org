require_relative '../test_helper'

require 'cdo/regexp'

class RegexpUtilsTest < Minitest::Test
  EXPECTED_DIGITS = '1234567890'.freeze
  VALID_US_PHONE_NUMBERS = %w[
    123-456-7890
    (123)-456-7890
    (123)456-7890
    1234567890
  ].freeze
  INVALID_US_PHONE_NUMBERS = [
    ' 1234567890',
    '1234567890 ',
    'abc'
  ].freeze
  VALID_US_ZIP_CODES = [
    '12345',
    '12345-6789',
    '123456789',
    '12345 6789'
  ].freeze
  INVALID_US_ZIP_CODES = [
    '123',
    '1 2',
    '123456',
    '12345-abcd'
  ].freeze

  def test_valid_us_phone_numbers
    VALID_US_PHONE_NUMBERS.each do |number|
      assert RegexpUtils.us_phone_number?(number), "Expected #{number} to be a valid phone number."
    end
  end

  def test_invalid_us_phone_numbers
    INVALID_US_PHONE_NUMBERS.each do |number|
      refute RegexpUtils.us_phone_number?(number), "Expected #{number} to NOT be a valid phone number."
    end
  end

  def test_valid_us_zip_codes
    VALID_US_ZIP_CODES.each do |zip_code|
      assert RegexpUtils.us_zip_code?(zip_code), "Expected #{zip_code} to be a valid zip code."
    end
  end

  def test_invalid_us_zip_codes
    INVALID_US_ZIP_CODES.each do |zip_code|
      refute RegexpUtils.us_zip_code?(zip_code), "Expected #{zip_code} to NOT be a valid zip code."
    end
  end

  def test_extract_us_phone_number_digits
    VALID_US_PHONE_NUMBERS.each do |number|
      assert_equal EXPECTED_DIGITS, RegexpUtils.extract_us_phone_number_digits(number)
    end
  end

  def test_extract_invalid_us_phone_number_digits_fails
    INVALID_US_PHONE_NUMBERS.each do |number|
      e = assert_raises RuntimeError do
        RegexpUtils.extract_us_phone_number_digits(number)
      end
      assert e.message.include? 'Not a US phone number'
    end
  end

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
