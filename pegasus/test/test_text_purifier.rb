require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require_relative '../../lib/cdo/text_purifier'
require_relative '../src/env'

class TextPurifierTest < Minitest::Unit::TestCase
  def test_email_violations
    assert_nil(TextPurifier.find_email_violation('<xml/>'))
    assert_equal('test@example.com', TextPurifier.find_email_violation('test@example.com').offending_text)
    assert_equal('test@example.shoes', TextPurifier.find_email_violation('test@example.shoes').offending_text)
    assert_equal('test@example.shoesandotherstuff.co.nz', TextPurifier.find_email_violation('test@example.shoesandotherstuff.co.nz').offending_text)
    assert_equal('test@example.shoes', TextPurifier.find_email_violation('other content test@example.shoes other content').offending_text)
  end

  def test_address_violations
    assert_nil(TextPurifier.find_street_address_violation('this is just some text'))
    assert(TextPurifier.find_street_address_violation('1 Embarcadero Blvd SF CA').is_a? StreetAddressViolation)
    assert_equal('1 Embarcadero Blvd SF CA', TextPurifier.find_street_address_violation('1 Embarcadero Blvd SF CA').offending_text)
    assert_equal('123 Post Road Westport CT', TextPurifier.find_street_address_violation('Hi I live at 123 Post Road Westport CT').offending_text)
    assert_equal('123, Post Road, Westport, CT', TextPurifier.find_street_address_violation('Hi I live at 123, Post Road, Westport, CT').offending_text)
    assert_equal('123, Post Road, Westport, CT and other stuff', TextPurifier.find_street_address_violation('Hi I live at 123, Post Road, Westport, CT and other stuff').offending_text)
    assert_nil(TextPurifier.find_street_address_violation('I am the luckiest 1st 2 and 3rd person in California'))
    assert_nil(TextPurifier.find_street_address_violation('Hi I am dog I live at 3 Rover Road in Christmasville MA 12346'))
  end

  def test_phone_number_violations
    assert_nil(TextPurifier.find_phone_number_violation('this is just some text'))
    assert_nil(TextPurifier.find_phone_number_violation('12345 is a cool number'))
    assert_nil(TextPurifier.find_phone_number_violation('353 and 44448 is a cool number'))

    # US local
    assert(TextPurifier.find_phone_number_violation('call me locally 555 5555').is_a? PhoneNumberViolation)
    assert_equal('555 5555', TextPurifier.find_phone_number_violation('call me locally 555 5555').offending_text)

    # US
    assert(TextPurifier.find_phone_number_violation('I can count to ten 1234567890239487234').is_a? PhoneNumberViolation)
    assert_equal('12345678902', TextPurifier.find_phone_number_violation('First numbers are my phone number: 1234567890239487234').offending_text)
    assert(TextPurifier.find_phone_number_violation('5555555555').is_a? PhoneNumberViolation)
    assert(TextPurifier.find_phone_number_violation('15555555555').is_a? PhoneNumberViolation)
    assert(TextPurifier.find_phone_number_violation('1-555-555-5555').is_a? PhoneNumberViolation)
    assert(TextPurifier.find_phone_number_violation('555-555-5555').is_a? PhoneNumberViolation)
    assert_equal('555-555-5555', TextPurifier.find_phone_number_violation('555-555-5555').offending_text)
    assert(TextPurifier.find_phone_number_violation('1(555)555-5555').is_a? PhoneNumberViolation)
    assert(TextPurifier.find_phone_number_violation('1-555-555-5555').is_a? PhoneNumberViolation)
    assert(TextPurifier.find_phone_number_violation('1.555.555.5555').is_a? PhoneNumberViolation)
    assert(TextPurifier.find_phone_number_violation('1 555 555 5555').is_a? PhoneNumberViolation)
    assert_equal('1 555 555 5555', TextPurifier.find_phone_number_violation('1 555 555 5555').offending_text)

    # Germany
    assert(TextPurifier.find_phone_number_violation('4(23)232-3232').is_a? PhoneNumberViolation)

    # London
    assert(TextPurifier.find_phone_number_violation('07700 900017').is_a? PhoneNumberViolation) # mobile
    assert(TextPurifier.find_phone_number_violation('+44 7700 900017').is_a? PhoneNumberViolation) # international mobile

    # Australia
    assert(TextPurifier.find_phone_number_violation('+61 1900 654 321').is_a? PhoneNumberViolation) # mobile
  end

  def test_profanity_violations
    assert_nil(TextPurifier.find_profanity_violation('not a swear'))
    assert_equal('shit', TextPurifier.find_profanity_violation('holy shit').offending_text)
    assert_equal('shitstain', TextPurifier.find_profanity_violation('shitstain').offending_text)
    assert_nil(TextPurifier.find_profanity_violation('assuage'))
    assert_equal('ass', TextPurifier.find_profanity_violation('ass').offending_text)
    assert_nil(TextPurifier.find_profanity_violation('scheiße', ['en']))
    assert_equal('scheiße', TextPurifier.find_profanity_violation('scheiße', ['de']).offending_text)
  end
end
