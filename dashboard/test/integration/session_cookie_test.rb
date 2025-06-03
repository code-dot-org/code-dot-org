require 'test_helper'
require 'cdo/script_config'

class SessionCookieTest < ActionDispatch::IntegrationTest
  setup_all do
    seed_deprecated_unit_fixtures
  end

  test 'session cookie name contains environment' do
    get '/reset_session'

    assert cookies['_learn_session_test']
  end

  test 'session cookie not set over insecure HTTP' do
    https! false
    get '/reset_session'

    assert_nil cookies['_learn_session_test']
  end
end
