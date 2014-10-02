require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require_relative '../src/env'
require_relative '../../lib/cdo/geocoder'

class GeocoderTest < Minitest::Unit::TestCase
  def test_finding_potential_addresses
    assert_nil(Geocoder.find_potential_street_address('this is just some text'))
    assert(Geocoder.find_potential_street_address('1 Embarcadero Blvd SF CA'))
    assert_equal('1 Embarcadero Blvd SF CA', Geocoder.find_potential_street_address('1 Embarcadero Blvd SF CA'))
    assert_equal('123 Post Road Westport CT', Geocoder.find_potential_street_address('Hi I live at 123 Post Road Westport CT'))
    assert_equal('123, Post Road, Westport, CT', Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT'))
    assert_equal('123, Post Road, Westport, CT and other stuff', Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT and other stuff'))
    assert_nil(Geocoder.find_potential_street_address('I am the luckiest 1st 2 and 3rd person in California'))
    assert_nil(Geocoder.find_potential_street_address('Hi I am dog I live at 3 Rover Road in Christmasville MA 12346'))
  end
end
