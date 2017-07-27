require_relative './test_helper'
require_relative '../../lib/cdo/pegasus'
require_relative '../src/env'
require_relative '../../lib/cdo/geocoder'

class GeocoderTest < Minitest::Test
  include SetupTest

  def test_finding_potential_addresses
    Geocoder.configure lookup: :google, api_key: nil
    assert_nil(Geocoder.find_potential_street_address('this is just some text'))
    assert(Geocoder.find_potential_street_address('1 Embarcadero Blvd SF CA'))
    assert_equal('1 Embarcadero Blvd SF CA', Geocoder.find_potential_street_address('1 Embarcadero Blvd SF CA'))
    assert_equal('123 Post Road Westport CT', Geocoder.find_potential_street_address('Hi I live at 123 Post Road Westport CT'))
    assert_equal('123, Post Road, Westport, CT', Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT'))
    assert_equal('123, Post Road, Westport, CT and other stuff', Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT and other stuff'))
    assert_nil(Geocoder.find_potential_street_address('I am the luckiest 1st 2 and 3rd person in California'))
    assert_nil(Geocoder.find_potential_street_address('Hi I am dog I live at 3 Rover Road in Christmasville MA 12346'))
    assert_nil(Geocoder.find_potential_street_address('1b'))
    assert_nil(Geocoder.find_potential_street_address('300b'))
    assert_nil(Geocoder.find_potential_street_address('300'))
    assert_nil(Geocoder.find_potential_street_address('250'))
    assert_nil(Geocoder.find_potential_street_address('400'))
    assert_nil(Geocoder.find_potential_street_address('1500000000'))
    assert_nil(Geocoder.find_potential_street_address('1500000001230b'))
    assert_nil(Geocoder.find_potential_street_address('1_Counter'))
  end

  def test_with_errors
    Geocoder.stubs(:search)
    original_configuration = Geocoder::Configuration.instance
    assert_equal [], Geocoder::Configuration.instance.data[:always_raise]

    # success
    Geocoder.with_errors do
      assert_equal :all, Geocoder::Configuration.instance.data[:always_raise]
      Geocoder.search('a location')
    end
    assert_equal original_configuration, Geocoder::Configuration.instance

    # failure
    assert_raises do
      Geocoder.with_errors do
        assert_equal :all, Geocoder::Configuration.instance.data[:always_raise]
        raise 'an error'
      end
    end
    assert_equal original_configuration, Geocoder::Configuration.instance
    assert_equal [], Geocoder::Configuration.instance.data[:always_raise]
  end
end
