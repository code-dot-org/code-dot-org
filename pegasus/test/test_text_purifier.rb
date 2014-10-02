require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require_relative '../src/env'
require_relative '../../lib/cdo/regexp'
require_relative '../../lib/cdo/geocoder'

class TextPurifierTest < Minitest::Unit::TestCase
  def test_email_violations
    assert_nil(RegexpUtils.find_potential_email('holla@me'))
    assert_equal('test@example.com', RegexpUtils.find_potential_email('test@example.com'))
    assert_equal('test@example.shoes', RegexpUtils.find_potential_email('test@example.shoes'))
    assert_equal('test@example.shoesandotherstuff.co.nz', RegexpUtils.find_potential_email('test@example.shoesandotherstuff.co.nz'))
    assert_equal('test@example.shoes', RegexpUtils.find_potential_email('other content test@example.shoes other content'))
  end

  def test_address_violations
    assert_nil(Geocoder.find_potential_street_address('this is just some text'))
    assert(Geocoder.find_potential_street_address('1 Embarcadero Blvd SF CA'))
    assert_equal('1 Embarcadero Blvd SF CA', Geocoder.find_potential_street_address('1 Embarcadero Blvd SF CA'))
    assert_equal('123 Post Road Westport CT', Geocoder.find_potential_street_address('Hi I live at 123 Post Road Westport CT'))
    assert_equal('123, Post Road, Westport, CT', Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT'))
    assert_equal('123, Post Road, Westport, CT and other stuff', Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT and other stuff'))
    assert_nil(Geocoder.find_potential_street_address('I am the luckiest 1st 2 and 3rd person in California'))
    assert_nil(Geocoder.find_potential_street_address('Hi I am dog I live at 3 Rover Road in Christmasville MA 12346'))
  end

  def test_rejects_standard_formatted_us_phone_numbers
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

  def test_profanity_violations
    assert_nil(RegexpUtils.find_potential_profanity('not a swear'))
    assert_equal('shit', RegexpUtils.find_potential_profanity('holy shit'))
    assert_equal('shitstain', RegexpUtils.find_potential_profanity('shitstain'))
    assert_nil(RegexpUtils.find_potential_profanity('assuage'))
    assert_equal('ass', RegexpUtils.find_potential_profanity('ass'))
    assert_nil(RegexpUtils.find_potential_profanity('scheiße', ['en']))
    assert_equal('scheiße', RegexpUtils.find_potential_profanity('scheiße', ['de']))
  end
end
