require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require 'minitest/around/unit'
require_relative '../src/env'
require_relative '../../lib/cdo/geocoder'

require 'webmock'
require 'vcr'

class GeocoderTest < Minitest::Test
  VCR.configure do |c|
    c.cassette_library_dir = File.expand_path 'fixtures/vcr', __dir__
    c.hook_into :webmock
  end

  def around(&block)
    VCR.use_cassette(@NAME.gsub('test_',''), {}, &block)
  end

  def test_finding_potential_addresses
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
  end
end
