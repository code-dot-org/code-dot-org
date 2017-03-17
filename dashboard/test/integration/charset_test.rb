require 'test_helper'

# UTF8 4 byte characters (which include many emoji) really confuse our
# database -- they cause exceptions on writes and cause indexes to be
# not used when they should on reads. These tests test that they are
# rejected before attempting to read or write them from the db.
class CharsetTest < ActionDispatch::IntegrationTest
  def setup
    Script.stubs(:should_cache?).returns true
  end

  test "attempting to log in as user with utf8mb4 chars does not hit the db" do
    # make sure all the classes are loaded
    post '/users/sign_in', params: {
      user: {
        login: 'not a user',
        password: 'not a password'
      }
    }
    assert_response :success
    assert_select 'div.alert', 'Invalid email or password.'

    no_database

    # normal request should error on DB access attempt
    post '/users/sign_in', params: {
      user: {
        login: 'not a user',
        password: 'not a password'
      }
    }
    assert_response :internal_server_error

    # Panda request should not error
    post '/users/sign_in', params: {
      user: {
        login: panda_panda,
        password: 'not a password'
      }
    }
    assert_response :success
    assert_select 'div.alert', 'Invalid email or password.'
  end
end
