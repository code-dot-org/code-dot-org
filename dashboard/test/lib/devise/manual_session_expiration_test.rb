require 'test_helper'
class ManualSessionExpirationTest < ActiveSupport::TestCase
  test 'expire_all_sessions! will result in previously-existing sessions no longer working' do
    user = create(:user)
    user.remember_me!
    session = User.serialize_into_session(user)
    assert_equal(user, User.serialize_from_session(*session))
    user.expire_all_sessions!
    assert_nil User.serialize_from_session(*session)
  end
end
