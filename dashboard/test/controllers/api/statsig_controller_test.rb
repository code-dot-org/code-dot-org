# frozen_string_literal: true

require 'test_helper'

class Api::StatsigControllerTest < ActionDispatch::IntegrationTest
  describe 'GET /api/statsig/stable_id' do
    subject(:get_statsig_stable_id) {get api_statsig_stable_id_path}

    let(:request_stable_id) {request.statsig_stable_id}

    it 'returns Statsig stable ID' do
      get_statsig_stable_id

      must_respond_with :ok
      _(request_stable_id).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
      _(body).must_equal request_stable_id
    end

    [false, true].each do |signed_in|
      it "replaces an invalid cookie when signed #{signed_in ? 'in' : 'out'}" do
        sign_in create(:user) if signed_in
        cookies[SharedConstants::STATSIG_STABLE_ID_KEY] = '<html>blocked</html>'

        get_statsig_stable_id

        must_respond_with :ok
        _(body).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
        _(session[SharedConstants::STATSIG_STABLE_ID_KEY]).must_equal body
      end
    end

    context 'when user is signed in' do
      let(:user) {create(:user)}

      before do
        sign_in user
      end

      it 'returns Statsig stable ID' do
        get_statsig_stable_id

        must_respond_with :ok
        _(request_stable_id).must_match /\A#{SharedConstants::STATSIG_STABLE_ID_PATTERN}\z/io
        _(body).must_equal request_stable_id
      end
    end
  end
end
