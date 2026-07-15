# frozen_string_literal: true

require 'test_helper'

class Api::V1::CertificatesViewersControllerTest < ActionController::TestCase
  tests Api::V1::Certificates::ViewersController

  RESPONSE_KEYS = %w[allowedShareTargets canBulkPrint certificateName].freeze

  describe 'GET /api/v1/certificates/viewer' do
    subject(:get_viewer) {get :show}

    let(:user) {nil}

    before {sign_in user if user}

    context 'without a signed-in user' do
      it 'returns signed-out capabilities without account fields' do
        _get_viewer

        _(response.status).must_equal 200
        _(response.headers['Cache-Control']).must_equal 'private, no-store'
        _(response_body.keys.sort).must_equal RESPONSE_KEYS
        _(response_body['allowedShareTargets']).must_equal %w[facebook x linkedin]
        _(response_body['canBulkPrint']).must_equal true
        _(response_body['certificateName']).must_be_nil
      end
    end

    context 'with an under-13 student' do
      let(:user) {create(:young_student)}

      it 'returns restricted capabilities without policy inputs' do
        _get_viewer

        _(response.status).must_equal 200
        _(response_body.keys.sort).must_equal RESPONSE_KEYS
        _(response_body['allowedShareTargets']).must_equal []
        _(response_body['canBulkPrint']).must_equal false
      end
    end

    context 'with a teacher who has a complete name' do
      let(:user) {create(:teacher, given_name: 'Ada', family_name: 'Lovelace')}

      it 'returns the legacy professional learning certificate name' do
        _get_viewer

        _(response.status).must_equal 200
        _(response_body['certificateName']).must_equal 'Ada Lovelace'
        _(response_body['canBulkPrint']).must_equal true
      end
    end

    context 'with a teacher who has a partial name' do
      let(:user) {create(:teacher, given_name: 'Ada', family_name: nil)}

      it 'does not substitute the general account name' do
        _get_viewer

        _(response.status).must_equal 200
        _(response_body['certificateName']).must_be_nil
      end
    end
  end

  private def response_body
    @response_body ||= JSON.parse(response.body)
  end
end
