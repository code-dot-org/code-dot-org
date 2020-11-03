require_relative './test_helper'
require_relative '../../lib/cdo/pegasus'
require_relative '../src/env'
require_relative '../../lib/cdo/geocoder'

class GeocoderTest < Minitest::Test
  include SetupTest

  def test_finding_potential_addresses
    Geocoder.configure lookup: :mapbox, api_key: nil
    assert_nil(Geocoder.find_potential_street_address('this is just some text'))
    assert_equal('1 Embarcadero Blvd SF CA', Geocoder.find_potential_street_address('1 Embarcadero Blvd SF CA'))
    assert_equal('123 Post Road Westport CT', Geocoder.find_potential_street_address('Hi I live at 123 Post Road Westport CT'))
    assert_equal('123, Post Road, Westport, CT', Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT'))
    assert_nil(Geocoder.find_potential_street_address('Hi I live at 123 Post'))
    assert_equal('123 Post Road', Geocoder.find_potential_street_address('Hi I live at 123 Post Road'))
    assert_nil(Geocoder.find_potential_street_address('Hi I live at 123, Post Road, Westport, CT and other stuff'))
    assert_nil(Geocoder.find_potential_street_address('1b'))
    assert_nil(Geocoder.find_potential_street_address('300b'))
    assert_nil(Geocoder.find_potential_street_address('300'))
    assert_nil(Geocoder.find_potential_street_address('1500000000'))
    assert_nil(Geocoder.find_potential_street_address('1500000001230b'))
    assert_nil(Geocoder.find_potential_street_address('1_Counter'))
    assert_nil(Geocoder.find_potential_street_address(nil))
    assert_nil(Geocoder.find_potential_street_address(''))
    assert_nil(Geocoder.find_potential_street_address('2019 Dance Party Example'))
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

  def test_can_parse_result_with_empty_context_field
    Geocoder.configure lookup: :mapbox, api_key: nil
    expected_summarize = {
      'location_p' => '45.6649521968376,16.6791068850861',
      'location_route_s' => 'Croatia',
      'location_street_address_s' => 'Croatia',
      'location_country_code_s' => 'HR'
    }

    # This search resulted in a null context being returned in production
    location = Geocoder.search('Sesvete, Croatia').first
    assert_equal(expected_summarize, location.summarize)
    assert_equal('HR', location.country_code)
    assert_nil(location.state_code)
    assert_nil(location.city)
    assert_nil(location.state)
    assert_nil(location.postal_code)
    assert_nil(location.country)
    assert_nil(location.neighborhood)
  end

  def test_can_get_country_code_for_direct_country_searches
    Geocoder.configure lookup: :mapbox, api_key: nil
    # This search resulted in a null context being returned in production
    location = Geocoder.search('Croatia').first
    assert_equal('HR', location.country_code)
  end

  def test_localhost_lookup
    # Verify localhost lookups result in the same behavior as FreeGeoIP service for backwards compatibility
    # https://github.com/alexreisner/geocoder/blob/350cf0cc6a158d510aec3d91594d9b5718f877a9/lib/geocoder/lookups/freegeoip.rb#L41-L54
    location = Geocoder.search("127.0.0.1").first
    assert_equal("127.0.0.1", location.ip)
    assert_equal("RD", location.country_code)
    assert_equal("Reserved", location.country)
    assert_equal("0", location.latitude)
    assert_equal("0", location.longitude)
  end

  def test_freegeoip_overrides
    # Our self-hosted FreeGeoIP service only supports HTTP
    assert_equal([:http], Geocoder::Lookup::Freegeoip.new.supported_protocols)
  end
end
