require 'test_helper'

class UserGeoTest < ActiveSupport::TestCase
  test 'clear_user_geo clears data' do
    user_geo = UserGeo.create(
      user_id: (create :user).id,
      ip_address: '127.0.0.1',
      city: 'Seattle',
      state: 'Washington',
      country: 'United States',
      postal_code: '98104',
      latitude: 2.123,
      longitude: 18.123
    )
    user_geo.clear_user_geo
    assert_nil user_geo.ip_address
    assert_nil user_geo.city
    assert_nil user_geo.postal_code
    assert_nil user_geo.latitude
    assert_nil user_geo.longitude
    refute_nil user_geo.state
    refute_nil user_geo.country
  end
end
