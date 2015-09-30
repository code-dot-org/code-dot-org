require 'test_helper'
require 'cdo/session'

class SessionCookieTest < ActionDispatch::IntegrationTest
  test 'session cookie name contains environment' do
    assert_equal '_learn_session_test', Session::KEY
  end

  test 'session cookie is set' do
    get '/reset_session'

    assert cookies[Session::KEY]
  end

  test 'no cookies if you do not do anything' do
    get '/'

    assert_equal nil, cookies[Session::KEY]
  end

  test 'session cookie not set over insecure HTTP' do
    https! false
    get '/reset_session'

    assert_equal nil, cookies[Session::KEY]
  end

end
