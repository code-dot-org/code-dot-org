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
    unit = create(:unit, :with_levels, name: 'jigsaw-session-cookie-test')
    unit.lessons.first.update!(has_lesson_plan: true)
    create(:single_unit_course, unit: unit, name: 'jigsaw-session-cookie-test', published_state: 'stable')
    get "/courses/#{unit.name}/units/1/lessons/1"
    assert_nil cookies['_learn_session_test']
    assert_nil cookies[SharedConstants::STATSIG_STABLE_ID_KEY]
  end

  test 'session cookie not set in publicly cached level page' do
    ScriptConfig.stubs(:allows_public_caching_for_script).returns(true)
    unit = create(:unit, :with_levels, name: 'music-jam-2024')
    create(:single_unit_course, unit: unit, name: 'music-jam-2024', published_state: 'stable')
    assert_includes HttpCache.cached_units, unit.name
    get '/courses/music-jam-2024/units/1/lessons/1/levels/1'
    assert_response :success
    assert_nil cookies['_learn_session_test']
    assert_nil cookies[SharedConstants::STATSIG_STABLE_ID_KEY]
  end

  test 'session cookie is set on non-cached level page' do
    ScriptConfig.stubs(:allows_public_caching_for_script).returns(false)
    unit = create(:unit, :with_levels, name: 'music-jam-2024')
    create(:single_unit_course, unit: unit, name: 'music-jam-2024', published_state: 'stable')
    assert_includes HttpCache.cached_units, unit.name
    get '/courses/music-jam-2024/units/1/lessons/1/levels/1',
      headers: {'Cache-Control' => 'no-cache'},
      env: {'rack-cache.allow_reload' => true}
    assert_response :success
    refute_nil cookies['_learn_session_test']
    assert_nil cookies[SharedConstants::STATSIG_STABLE_ID_KEY]
  end

  describe 'request#statsig_stable_id' do
    it 'is not assigned by page requests' do
      get '/'
      _(session[:statsig_stable_id]).must_be_nil
    end

    it 'persists through sign-in and rotates after sign-out' do
      get '/v3/channels'
      initial_stable_id = session[:statsig_stable_id]
      _(initial_stable_id).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io

      get api_statsig_stable_id_path
      _(body).must_equal initial_stable_id

      sign_in create(:user)

      get api_statsig_stable_id_path
      _(body).must_equal initial_stable_id

      get '/v3/channels'
      _(request.statsig_stable_id).must_equal initial_stable_id

      get '/users/sign_out'
      _(cookies[:statsig_stable_id]).must_be_empty

      get api_statsig_stable_id_path
      _(body).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
      _(body).wont_equal initial_stable_id
    end

    context 'with Statsig cookie' do
      let(:cookies_statsig_stable_id) {SecureRandom.uuid}

      def session_cookie_written?
        response.headers['Set-Cookie'].to_s.include?('_learn_session_test=')
      end

      before do
        cookies[:statsig_stable_id] = cookies_statsig_stable_id
      end

      it 'does not create session' do
        get api_statsig_stable_id_path

        _(body).must_equal cookies_statsig_stable_id
        _(session[:statsig_stable_id]).must_be_nil
        _(session_cookie_written?).must_equal false
        _(cookies['_learn_session_test']).must_be_nil
      end

      it 'keeps Statsig cookie value after session reset' do
        get '/reset_session'
        get api_statsig_stable_id_path

        _(body).must_equal cookies_statsig_stable_id
        _(session[:statsig_stable_id]).must_be_nil
      end

      context 'with conflicting session ID' do
        let(:session_stable_id) {session[:statsig_stable_id]}

        before do
          cookies.delete('statsig_stable_id')

          get '/v3/channels'

          _(session_cookie_written?).must_equal true
          _(session_stable_id).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
          cookies[:statsig_stable_id] = cookies_statsig_stable_id
        end

        it 'prefers Statsig cookie value without rewriting session' do
          get api_statsig_stable_id_path, xhr: true

          _(body).must_equal cookies_statsig_stable_id
          _(session[:statsig_stable_id]).must_equal session_stable_id
          _(session_cookie_written?).must_equal false
        end
      end
    end
  end
end
