require 'test_helper'

# UTF8 4 byte characters (which include many emoji) really confuse our
# database -- they cause exceptions on writes and cause indexes to be
# not used when they should on reads. These tests test that they are
# rejected before attempting to read or write them from the db.
class CharsetTest < ActionDispatch::IntegrationTest
  def no_database
    Rails.logger.info '--------------'
    Rails.logger.info 'DISCONNECTING DATABASE'
    Rails.logger.info '--------------'

    ActiveRecord::Base.connection.disconnect!
  end

  test "attempting to log in as user with utf8mb4 chars does not hit the db" do
    # make sure all the classes are loaded
    post '/users/sign_in', login: 'not a user', password: 'not a password'
    assert_response :success
    assert_select 'div.alert', 'Invalid email or password.'

    no_database

    post '/users/sign_in', login: panda_panda, password: 'not a password'
    assert_response :success
    assert_select 'div.alert', 'Invalid email or password.'
  end
end
