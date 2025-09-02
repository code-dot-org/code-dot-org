# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialCompleterTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:instance_arguments) {{controller:, tutorial:}}
  let(:described_instance) {described_class.new(**instance_arguments)}

  let(:request) {ActionDispatch::TestRequest.create}
  let(:response) {ActionDispatch::TestResponse.new}
  let(:controller) do
    HocLegacy::TutorialsController.new.tap do |controller|
      controller.request = request
      controller.response = response
    end
  end
  let(:tutorial_code) {'tutorial_code'}
  let(:tutorial) {OpenStruct.new(tutorial_id: tutorial_code)}

  describe 'class' do
    it 'includes SessionManageable concern' do
      _(described_class.ancestors).must_include HocLegacy::SessionManageable
    end
  end

  describe '#call' do
    subject(:complete_tutorial) {described_instance.call}

    let(:current_time) {DateTime.parse('1970-01-01 00:00:00')}
    let(:cookie_session_id) {Faker::Internet.unique.uuid}
    let(:request_ip) {Faker::Internet.unique.ip_v4_address}
    let(:request_host_with_port) {Faker::Internet.unique.domain_name}
    let(:encoded_tutorial_code) {CGI.escape(Base64.urlsafe_encode64(tutorial_code))}

    around do |test|
      Timecop.freeze(current_time) {test.call}
    end

    around do |test|
      PEGASUS_DB.transaction(rollback: :always) {test.call}
    end

    before do
      allow(CDO).to receive(:read_only).and_return(false)

      allow(request).to receive(:host_with_port).and_return(request_host_with_port)
      allow(request).to receive(:ip).and_return(request_ip)
      allow(described_instance).to receive(:cookie_session_id).and_return(cookie_session_id)

      allow(described_instance).to receive(:create_session_row)
    end

    it 'returns created session row' do
      new_session_id = Faker::Internet.unique.uuid
      new_session_row_params = {
        referer: request_host_with_port,
        tutorial: tutorial_code,
        finished_at: current_time,
        finished_ip: request_ip,
      }
      new_session_row = new_session_row_params.merge(session: new_session_id)

      expect(described_instance).to receive(:create_session_row).
        with(new_session_row_params).
        and_return(new_session_row)

      _complete_tutorial.must_equal new_session_row
    end

    context 'when read-only mode is enabled' do
      before do
        allow(CDO).to receive(:read_only).and_return(true)
      end

      it 'does not create session row and returns nil' do
        _complete_tutorial.must_be_nil
        expect(described_instance).not_to have_received(:create_session_row)
      end
    end

    context 'when session row exists' do
      let(:session_row) {{session: cookie_session_id}}

      let!(:session_row_id) {PEGASUS_DB[:hoc_activity].insert(session_row)}

      let(:session_row_query) {PEGASUS_DB[:hoc_activity].where(id: session_row_id)}

      it 'updates existing session row with finished_ip and finished_at' do
        _ {complete_tutorial}.must_change -> {session_row_query.first&.slice(:finished_ip, :finished_at)},
                                          from: {finished_ip: nil, finished_at: nil},
                                          to: {finished_ip: request_ip, finished_at: current_time}
      end

      it 'returns updated session row' do
        _complete_tutorial.must_be_instance_of Hash
        _(complete_tutorial[:id]).must_equal session_row_id
        _(complete_tutorial[:session]).must_equal cookie_session_id
        _(complete_tutorial[:finished_ip]).must_equal request_ip
        _(complete_tutorial[:finished_at]).must_equal current_time
      end
    end

    describe 'without :tutorial argument' do
      let(:instance_arguments) {{controller:}}

      it 'returns created session row' do
        new_session_id = Faker::Internet.unique.uuid
        new_session_row_params = {
          referer: request_host_with_port,
          tutorial: nil,
          finished_at: current_time,
          finished_ip: request_ip,
        }
        new_session_row = new_session_row_params.merge(session: new_session_id)

        expect(described_instance).to receive(:create_session_row).
          with(new_session_row_params).
          and_return(new_session_row)

        _complete_tutorial.must_equal new_session_row
      end
    end
  end
end
