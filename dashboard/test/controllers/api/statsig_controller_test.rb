# frozen_string_literal: true

require 'test_helper'

class Api::StatsigControllerTest < ActionDispatch::IntegrationTest
  describe 'GET /api/statsig/stable_id' do
    subject(:get_statsig_stable_id) {get api_statsig_stable_id_path}

    let(:request_stable_id) {request.statsig_stable_id}

    it 'returns Statsig stable ID' do
      get_statsig_stable_id

      must_respond_with :ok
      _(request_stable_id).must_match Cdo::AnonUserId::FORMAT
      _(body).must_equal request_stable_id
    end

    context 'when user is signed in' do
      let(:user) {create(:user)}

      before do
        sign_in user
      end

      it 'returns Statsig stable ID' do
        get_statsig_stable_id

        must_respond_with :ok
        _(request_stable_id).must_match Cdo::AnonUserId::FORMAT
        _(body).must_equal request_stable_id
      end
    end
  end
end
