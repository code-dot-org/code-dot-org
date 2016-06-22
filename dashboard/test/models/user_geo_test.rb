require 'test_helper'

class UserGeoTest < ActiveSupport::TestCase
  test 'populate noops if ip_address does not change' do
    user = create :user
    time = '2000-01-02 12:34:56'
    ip_address = '127.0.0.1'
    user_geo = UserGeo.create!(
      user_id: user.id,
      created_at: time,
      updated_at: time,
      indexed_at: time,
      ip_address: ip_address
    )

    assert_no_change('UserGeo.find_by_user_id(user.id)') do
      user_geo.populate(user.id, ip_address)
    end
  end

  test 'populate populates and saves' do
    user = create :user
    ip_address = '127.0.0.1'

    assert UserGeo.find_by_user_id(user.id).nil?
    UserGeo.new.populate(user.id, ip_address)

    user_geo = UserGeo.find_by_user_id(user.id)
    assert user_geo
    assert_equal ip_address, user_geo.ip_address
  end

  test 'populate throws exception if changing user_id' do
    user = create :user
    user_geo = UserGeo.new(user_id: user.id)

    another_user = create :user
    assert_raises(ArgumentError) do
      user_geo.populate(another_user.id, '127.0.0.1')
    end
  end
end
