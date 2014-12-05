require 'test_helper'

class SessionCookieTest < ActionDispatch::IntegrationTest
  test 'session cookie name contains environment' do
    get '/reset_session'

    assert cookies['_learn_session_test']
  end

  test 'no cookies if you do not do anything' do
    get '/'

    assert_equal nil, cookies['_learn_session_test']
  end

end
