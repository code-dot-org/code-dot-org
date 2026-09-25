require 'test_helper'
require 'cdo/script_config'

class SessionCookieTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

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

  describe 'request#onetrust_consent_data' do
    let(:onetrust_consent_cookie_value) do
      [
        'isGpcEnabled=0',
        'datestamp=Sat+Sep+26+2026+02%3A10%3A25+GMT%2B0300+(Eastern+European+Summer+Time)',
        'version=202505.1.0',
        'browserGpcFlag=0',
        'isIABGlobal=false',
        'hosts=',
        'consentId=cb3aa65a-3f04-4053-aaea-327f3efd4adc',
        'interactionCount=1',
        'isAnonUser=1',
        'landingPath=NotLandingPage',
        'groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1%2CC0008%3A1%2CC0012%3A0',
        'AwaitingReconsent=false'
      ].join('&')
    end

    before do
      cookies['OptanonConsent'] = onetrust_consent_cookie_value
    end

    it 'parses the consent cookie data' do
      get '/'
      _(request.onetrust_consent_data).must_equal(
        {
          'isGpcEnabled' => '0',
          'datestamp' => 'Sat Sep 26 2026 02:10:25 GMT+0300 (Eastern European Summer Time)',
          'version' => '202505.1.0',
          'browserGpcFlag' => '0',
          'isIABGlobal' => 'false',
          'hosts' => '',
          'consentId' => 'cb3aa65a-3f04-4053-aaea-327f3efd4adc',
          'interactionCount' => '1',
          'isAnonUser' => '1',
          'landingPath' => 'NotLandingPage',
          'groups' => 'C0001:1,C0002:1,C0003:1,C0004:1,C0008:1,C0012:0',
          'AwaitingReconsent' => 'false'
        }
      )
    end

    context 'when the consent cookie is absent' do
      before do
        cookies.delete('OptanonConsent')
      end

      it 'returns empty data' do
        get '/'
        _(request.onetrust_consent_data).must_equal({})
      end
    end

    context 'when the consent cookie has invalid percent encoding' do
      let(:onetrust_consent_cookie_value) {'groups=%'}

      it 'returns empty data' do
        get '/'
        _(request.onetrust_consent_data).must_equal({})
      end
    end
  end

  describe 'request#onetrust_active_groups' do
    subject(:onetrust_request) {ActionDispatch::Request.new(Rack::MockRequest.env_for('/'))}

    let(:onetrust_consent_data) do
      {'groups' => 'C0001:0,C0002:1,C0003:0,C0004:1,C0008:1,C0012:0'}
    end

    before do
      allow(onetrust_request).to receive(:onetrust_consent_data).and_return(onetrust_consent_data)
    end

    it 'returns only active consent groups' do
      _(onetrust_request.onetrust_active_groups).must_equal Set['C0002', 'C0004', 'C0008']
    end

    context 'when consent data has no groups' do
      let(:onetrust_consent_data) {{}}

      it 'returns no active groups' do
        _(onetrust_request.onetrust_active_groups).must_be_empty
      end
    end

    context 'when consent data has a non-string groups value' do
      let(:onetrust_consent_data) {{'groups' => nil}}

      it 'returns no active groups' do
        _(onetrust_request.onetrust_active_groups).must_be_empty
      end
    end
  end

  describe 'request#onetrust_performance_cookies_allowed?' do
    subject(:onetrust_request) {ActionDispatch::Request.new(Rack::MockRequest.env_for('/'))}

    let(:development_environment) {false}
    let(:onetrust_active_groups) {Set['C0001', 'C0002']}

    before do
      allow(onetrust_request).to receive(:onetrust_active_groups).and_return(onetrust_active_groups)
      allow(CDO).to receive(:rack_env?).and_call_original
      allow(CDO).to receive(:rack_env?).with(:development).and_return(development_environment)
    end

    it 'allows performance cookies when C0002 is active' do
      _(onetrust_request.onetrust_performance_cookies_allowed?).must_equal true
    end

    context 'when C0002 is inactive' do
      let(:onetrust_active_groups) {Set['C0001']}

      it 'does not allow performance cookies' do
        _(onetrust_request.onetrust_performance_cookies_allowed?).must_equal false
      end
    end

    context 'without consent in development' do
      let(:development_environment) {true}
      let(:onetrust_active_groups) {Set.new}

      it 'allows performance cookies' do
        _(onetrust_request.onetrust_performance_cookies_allowed?).must_equal true
      end
    end

    context 'without consent outside development' do
      let(:onetrust_active_groups) {Set.new}

      it 'does not allow performance cookies' do
        _(onetrust_request.onetrust_performance_cookies_allowed?).must_equal false
      end
    end
  end

  describe 'request#statsig_stable_id' do
    subject(:request_statsig_stable_id) {request.statsig_stable_id}

    it 'persists through sign-in and rotates after sign-out' do
      get '/'
      initial_stable_id = request_statsig_stable_id
      _(initial_stable_id).must_match Cdo::AnonUserId::FORMAT
      _(cookies[:statsig_stable_id]).must_be_nil
      _(session[:statsig_stable_id]).must_equal initial_stable_id

      get '/v3/channels'
      _(request.statsig_stable_id).must_equal initial_stable_id

      sign_in create(:user)

      get '/'
      _(request.statsig_stable_id).must_equal initial_stable_id

      get '/v3/channels'
      _(request.statsig_stable_id).must_equal initial_stable_id

      get '/users/sign_out'
      _(cookies[:statsig_stable_id]).must_be_empty

      get '/'
      rotated_stable_id = request.statsig_stable_id
      _(rotated_stable_id).must_match Cdo::AnonUserId::FORMAT
      _(rotated_stable_id).wont_equal initial_stable_id
      _(cookies[:statsig_stable_id]).must_be_empty
      _(session[:statsig_stable_id]).must_equal rotated_stable_id
    end

    context 'with Statsig cookie' do
      let(:cookies_statsig_stable_id) {SecureRandom.uuid}

      before do
        cookies[:statsig_stable_id] = cookies_statsig_stable_id
        cookies['OptanonConsent'] = 'groups=C0001%3A1%2CC0002%3A1'
      end

      it 'stores Statsig cookie value in session' do
        get '/'
        _(request.statsig_stable_id).must_equal cookies_statsig_stable_id
        _(session[:statsig_stable_id]).must_equal cookies_statsig_stable_id
      end

      it 'restores Statsig cookie value after session reset' do
        get '/reset_session'
        get '/'

        _(request.statsig_stable_id).must_equal cookies_statsig_stable_id
        _(session[:statsig_stable_id]).must_equal cookies_statsig_stable_id
      end

      context 'with conflicting session ID' do
        let(:previous_session_value) {SecureRandom.uuid}

        before do
          get '/'
          session[:statsig_stable_id] = previous_session_value
        end

        it 'replaces session ID with Statsig cookie value' do
          get '/'
          _(request.statsig_stable_id).must_equal cookies_statsig_stable_id
          _(session[:statsig_stable_id]).must_equal cookies_statsig_stable_id
        end
      end

      context 'without performance cookie consent' do
        before do
          cookies['OptanonConsent'] = 'groups=C0001%3A1%2CC0002%3A0'
        end

        it 'ignores the Statsig cookie' do
          get '/'

          _(request.statsig_stable_id).wont_equal cookies_statsig_stable_id
          _(session[:statsig_stable_id]).must_equal request.statsig_stable_id
        end
      end
    end
  end
end
