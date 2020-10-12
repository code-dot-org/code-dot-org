require_relative './test_helper'
require_relative '../../lib/cdo/pegasus'
require_relative '../src/env'
require_relative '../../lib/cdo/geocoder'

class GeocoderTest < Minitest::Test
  include SetupTest

  def test_finding_potential_addresses
    Geocoder.configure lookup: :mapbox, api_key: nil
    assert_nil(Geocoder.find_potential_street_address('this is just some text'))
    assert(Geocoder.find_potential_street_address('1 Embarcadero Blvd SF CA'))
    assert_equal('1 Embarcadero Blvd SF CA', Geocoder.find_potential_street_address('1 Embarcadero Blvd SF CA'))
    assert_equal('123 Post Road Westport CT', Geocoder.find_potential_street_address('Hi I live at 123 Post Road Westport CT'))
    assert_equal('123, Post Road, Westport, CT', Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT'))
    assert_equal('123, Post Road, Westport, CT and other stuff', Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT and other stuff'))
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

  def test_saucelabs_override
    assert_equal 'US', Geocoder.search('66.85.52.120').first.country_code
  end

  def test_result_adapter
    Geocoder.configure lookup: :mapbox, api_key: nil
    expected_summarize = {
      'location_p' => '47.610183,-122.337401',
      'location_street_number_s' => '1501',
      'location_route_s' => '4th Avenue',
      'location_street_address_s' => '1501 4th Avenue',
      'location_city_s' => 'Seattle',
      'location_state_s' => 'Washington',
      'location_state_code_s' => 'WA',
      'location_country_s' => 'United States',
      'location_country_code_s' => 'US',
      'location_postal_code_s' => '98101'
    }
    expected_state_code = 'WA'
    expected_country_code = 'US'
    expected_street_number = '1501'
    expected_route = '4th Avenue'
    expected_street_address = '1501 4th Avenue'
    expected_address = '1501 4th Avenue, Seattle, Washington 98101, United States'
    expected_formatted_address = '1501 4th Avenue, Seattle, Washington 98101, United States'

    location = Geocoder.search('1501 4th Ave, Seattle, WA 98101').first
    assert_equal(expected_summarize, location.summarize)
    assert_equal(expected_state_code, location.state_code)
    assert_equal(expected_country_code, location.country_code)
    assert_equal(expected_street_number, location.street_number)
    assert_equal(expected_route, location.route)
    assert_equal(expected_street_address, location.street_address)
    assert_equal(expected_address, location.address)
    assert_equal(expected_formatted_address, location.formatted_address)
  end
end
