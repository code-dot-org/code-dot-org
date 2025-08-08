require 'test_helper'
require 'cdo/script_config'

class SessionCookieTest < ActionDispatch::IntegrationTest
  test 'session cookie name contains environment' do
    get '/reset_session'

    assert cookies['_learn_session_test']
  end

  # Validate functionality both in environments which are configured with a
  # secure session store to emulate production (ie, the DTT) and for those with
  # a more minimal configuration (ie, CI and dev).
  #
  # We do this instead of stubbing `no_https_store` because its value is
  # referenced by the session store at startup, and the resulting configuration
  # options are not easily stubbable. See `config/initializers/session_store.rb`
  test 'session cookie not set over insecure HTTP in securely-configured environment' do
    https! false
    get '/reset_session'

    if CDO.no_https_store
      assert cookies['_learn_session_test']
    else
      assert_nil cookies['_learn_session_test']
    end
  end

  test 'session cookie not set in publicly cached lesson plan' do
    ScriptConfig.stubs(:allows_public_caching_for_script).returns(true)
    get '/courses/jigsaw/units/1/lessons/1'
    assert_nil cookies['_learn_session_test']
  end

  test 'session cookie not set in publicly cached level page' do
    ScriptConfig.stubs(:allows_public_caching_for_script).returns(true)
    unit = create(:unit, :with_levels, name: 'music-jam-2024')
    create(:single_unit_course, unit: unit, name: 'music-jam-2024', published_state: 'stable')
    assert_includes HttpCache.cached_scripts, unit.name
    get '/courses/music-jam-2024/units/1/lessons/1/levels/1'
    assert_response :success
    assert_nil cookies['_learn_session_test']
  end

  test 'session cookie is set in on non-cached level page' do
    ScriptConfig.stubs(:allows_public_caching_for_script).returns(false)
    unit = create(:unit, :with_levels, name: 'music-jam-2024')
    create(:single_unit_course, unit: unit, name: 'music-jam-2024', published_state: 'stable')
    assert_includes HttpCache.cached_scripts, unit.name
    get '/courses/music-jam-2024/units/1/lessons/1/levels/1',
      headers: {'Cache-Control' => 'no-cache'},
      env: {'rack-cache.allow_reload' => true}
    assert_response :success
    refute_nil cookies['_learn_session_test']
  end
end
