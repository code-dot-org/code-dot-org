require 'test_helper'

class StatsigStableIdIntegrationTest < ActionDispatch::IntegrationTest
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

  context 'with performance cookie consent' do
    before do
      cookies['OptanonConsent'] = 'groups=C0001%3A1%2CC0002%3A1'
    end

    it 'stores same generated ID in session and cookie' do
      get '/'

      stable_id = request.statsig_stable_id
      _(stable_id).must_match Cdo::AnonUserId::FORMAT
      _(session[:statsig_stable_id]).must_equal stable_id
      _(cookies[:statsig_stable_id]).must_equal stable_id
    end
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

      it 'ignores Statsig cookie' do
        get '/'

        _(request.statsig_stable_id).wont_equal cookies_statsig_stable_id
        _(session[:statsig_stable_id]).must_equal request.statsig_stable_id
        _(cookies[:statsig_stable_id]).must_be_empty
      end
    end
  end
end
