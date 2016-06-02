require_relative 'test_helper'

require 'cdo/regexp'
class RegexpUtilsTest < Minitest::Test
  EXPECTED_DIGITS = '1234567890'
  VALID_US_PHONE_NUMBERS = %w[
    123-456-7890
    (123)-456-7890
    (123)456-7890
    1234567890
  ]
  INVALID_US_PHONE_NUMBERS = [
    ' 1234567890',
    '1234567890 ',
    'abc'
  ]

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
end
