require 'test_helper'

class SessionCookieTest < ActionDispatch::IntegrationTest
  test 'session cookie name contains environment' do
    get '/'

    assert cookies['_learn_session_test']
  end
end
