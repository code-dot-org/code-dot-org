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

  test 'session cookie not set over insecure HTTP' do
    https! false
    get '/reset_session'

    assert_equal nil, cookies['_learn_session_test']
  end

  test 'session cookie not set in publicly cached level page' do
    Gatekeeper.set('public_caching_for_script', value: true)
    get '/hoc/1'
    assert_nil cookies['_learn_session_test']
  end

  test 'session cookie is set in on non-cached level page' do
    Gatekeeper.set('public_caching_for_script', value: false)
    get '/hoc/1'
    assert_not_nil cookies['_learn_session_test']
  end

end
