# frozen_string_literal: true

require 'test_helper'

class Api::StatsigControllerTest < ActionDispatch::IntegrationTest
  describe 'GET /api/stable_id' do
    subject(:get_statsig_stable_id) {get api_statsig_stable_id_path}

    def session_cookie_written?
      response.headers['Set-Cookie'].to_s.include?('_learn_session_test=')
    end

    it 'returns new Statsig stable ID without creating session' do
      get_statsig_stable_id

      must_respond_with :ok
      _(body).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
      _(session[SharedConstants::STATSIG_STABLE_ID_KEY]).must_be_nil
      _(session_cookie_written?).must_equal false
    end

    it 'returns Statsig cookie value' do
      stable_id = SecureRandom.uuid
      cookies[SharedConstants::STATSIG_STABLE_ID_KEY] = stable_id

      get_statsig_stable_id

      must_respond_with :ok
      _(body).must_equal stable_id
    end

    it 'returns existing session Statsig stable ID' do
      get '/v3/channels'
      session_stable_id = session[SharedConstants::STATSIG_STABLE_ID_KEY]
      _(session_stable_id).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io

      get_statsig_stable_id

      must_respond_with :ok
      _(body).must_equal session_stable_id
    end

    [false, true].each do |signed_in|
      it "replaces invalid cookie when signed #{signed_in ? 'in' : 'out'}" do
        sign_in create(:user) if signed_in
        cookies[SharedConstants::STATSIG_STABLE_ID_KEY] = '<html>blocked</html>'

        get_statsig_stable_id

        must_respond_with :ok
        _(body).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
      end
    end
  end
end
