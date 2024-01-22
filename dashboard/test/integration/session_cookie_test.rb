require 'test_helper'
require 'cdo/script_config'

class SessionCookieTest < ActionDispatch::IntegrationTest
  test 'session cookie name contains environment' do
    get '/reset_session'

    assert cookies['_learn_session_test']
  end

  test 'no cookies if you do not do anything' do
    get '/'

    assert_nil cookies['_learn_session_test']
  end

  test 'session cookie not set over insecure HTTP' do
    https! false
    get '/reset_session'

    assert_nil cookies['_learn_session_test']
  end

  test 'session cookie not set in publicly cached lesson plan' do
    ScriptConfig.stubs(:allows_public_caching_for_script).returns(true)
    get '/s/jigsaw/lessons/1'
    assert_nil cookies['_learn_session_test']
  end

  test 'session cookie not set in publicly cached level page' do
    ScriptConfig.stubs(:allows_public_caching_for_script).returns(true)
    get '/hoc/1'
    assert_nil cookies['_learn_session_test']
  end

  test 'session cookie is set in on non-cached level page' do
    ScriptConfig.stubs(:allows_public_caching_for_script).returns(false)
    get '/hoc/1',
      headers: {'Cache-Control' => 'no-cache'},
      env: {'rack-cache.allow_reload' => true}
    refute_nil cookies['_learn_session_test']
  end
end
