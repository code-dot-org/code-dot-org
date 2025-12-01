# frozen_string_literal: true

require 'test_helper'

class HocLegacy::CertificatesControllerTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  before do
    allow(CDO).to receive(:default_scheme).and_return('https:')
  end

  describe 'GET /api/hour/certificates/:session_id' do
    subject(:get_certificate_request) {get "/api/hour/certificates/#{param_session_id}"}

    let(:param_session_id) {session_id}

    let(:session_id) {Faker::Internet.unique.uuid}
    let(:session_name) {'user_name'}
    let(:session_tutorial) {'session_tutorial'}

    around do |test|
      PEGASUS_DB.transaction(rollback: :always) {test.call}
    end

    before do
      PEGASUS_DB[:hoc_activity].insert(
        session: session_id,
        name: "  #{session_name}  ",
        tutorial: session_tutorial,
        )
    end

    it 'redirects to certificate page with encoded params' do
      get_certificate_request
      must_redirect_to '/certificates/eyJuYW1lIjoidXNlcl9uYW1lIiwiY291cnNlIjoic2Vzc2lvbl90dXRvcmlhbCJ9'
    end

    context 'when session row does not exist' do
      let(:param_session_id) {'unexisted_session_id'}

      it 'returns error 404' do
        get_certificate_request
        must_respond_with :not_found
      end
    end
  end

  describe 'PATCH /api/hour/certificates/:session_id' do
    subject(:patch_certificate_request) {patch "/api/hour/certificates/#{param_session_id}", params: request_params}

    let(:param_session_id) {session_id}
    let(:param_name) {'param_name'}
    let(:request_params) {{name: "  #{param_name}  "}}

    let(:session_id) {Faker::Internet.unique.uuid}
    let(:session_name) {nil}
    let(:session_tutorial) {'session_tutorial'}
    let(:session_company) {'session_company'}
    let(:session_started_at) {4.hours.ago}
    let(:session_pixel_started_at) {3.hours.ago}
    let(:session_pixel_finished_at) {2.hours.ago}
    let(:session_finished_at) {1.hour.ago}

    let(:session_row_query) {PEGASUS_DB[:hoc_activity].where(session: session_id)}
    let(:parsed_response) {JSON.parse(response.body)}

    around do |test|
      PEGASUS_DB.transaction(rollback: :always) {test.call}
    end

    before do
      PEGASUS_DB[:hoc_activity].insert(
        session: session_id,
        name: session_name,
        tutorial: session_tutorial,
        company: session_company,
        started_at: session_started_at,
        pixel_started_at: session_pixel_started_at,
        pixel_finished_at: session_pixel_finished_at,
        finished_at: session_finished_at,
      )
    end

    it 'updates session row with name from params' do
      _ {patch_certificate_request}.must_change -> {session_row_query.first[:name]}, from: session_name, to: param_name
    end

    it 'returns JSON response with session status with updated session name' do
      patch_certificate_request

      must_respond_with :success
      _(response.content_type).must_include 'application/json'

      _(parsed_response).must_equal(
        {
          'session' => session_id,
          'tutorial' => session_tutorial,
          'company' => session_company,
          'started' => true,
          'pixel_started' => true,
          'pixel_finished' => true,
          'finished' => true,
          'name' => param_name,
          'certificate_sent' => true,
        }
      )
    end

    context 'when name param is blank' do
      let(:param_name) {''}

      it 'does not update session row with name from params' do
        _ {patch_certificate_request}.wont_change -> {session_row_query.first[:name]}
      end

      it 'returns JSON response with session status with initial name' do
        patch_certificate_request
        must_respond_with :success
        _(parsed_response['name']).must_be_nil
        _(parsed_response['certificate_sent']).must_equal false
      end
    end

    context 'when session row already has name' do
      let(:session_name) {'session_name'}

      it 'does not update session row with name from params' do
        _ {patch_certificate_request}.wont_change -> {session_row_query.first[:name]}
      end

      it 'returns JSON response with session status with initial session name' do
        patch_certificate_request
        must_respond_with :success
        _(parsed_response['name']).must_equal session_name
      end
    end

    %w[tutorial company].freeze.each do |attr|
      context "when session row has no #{attr}" do
        let(:"session_#{attr}") {nil}

        it "returns JSON response with session status with #{attr} nil" do
          patch_certificate_request
          must_respond_with :success
          _(parsed_response.key?(attr)).must_equal true
          _(parsed_response[attr]).must_be_nil
        end
      end
    end

    %w[started pixel_started pixel_finished finished].freeze.each do |attr|
      context "when session row has no #{attr}_at" do
        let(:"session_#{attr}_at") {nil}

        it "returns JSON response with session status with #{attr} false" do
          patch_certificate_request
          must_respond_with :success
          _(parsed_response.key?(attr)).must_equal true
          _(parsed_response[attr]).must_equal false
        end
      end
    end

    context 'when session row does not exist' do
      let(:param_session_id) {'unexisted_session_id'}

      it 'returns JSON response with default status' do
        patch_certificate_request

        must_respond_with :success
        _(response.content_type).must_include 'application/json'

        _(parsed_response).must_equal(
          {
            'session' => nil,
            'tutorial' => nil,
            'company' => nil,
            'started' => false,
            'pixel_started' => false,
            'pixel_finished' => false,
            'finished' => false,
            'name' => nil,
            'certificate_sent' => false,
          }
        )
      end
    end
  end
end
