# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialPixelCompleterTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:described_instance) {described_class.new(controller:, tutorial:)}

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
    subject(:complete_tutorial_pixel) {described_instance.call}

    let(:current_time) {DateTime.parse('1970-01-01 00:00:00')}
    let(:request_host_with_port) {'https://test.code.org:3000/test/host'}
    let(:request_ip) {Faker::Internet.unique.ip_v4_address}
    let(:cookie_session_id) {Faker::Internet.unique.uuid}

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

    it 'creates new session row' do
      complete_tutorial_pixel
      expect(described_instance).to have_received(:create_session_row).with(
        referer: request_host_with_port,
        tutorial: tutorial_code,
        pixel_finished_at: current_time,
        pixel_finished_ip: request_ip,
      ).once
    end

    context 'when read_only mode is enabled' do
      before do
        allow(CDO).to receive(:read_only).and_return(true)
      end

      it 'does not create new session row' do
        complete_tutorial_pixel
        expect(described_instance).not_to have_received(:create_session_row)
      end
    end

    # Creates finished session row to ensure that we are not updating an existing session row for the same session_id.
    context 'when session row is already exists' do
      let!(:session_row_id) do
        PEGASUS_DB[:hoc_activity].insert(
          session: cookie_session_id,
          tutorial: tutorial_code,
          referer: request_host_with_port,
          pixel_finished_ip: nil,
          pixel_finished_at: nil,
          finished_at: nil,
        )
      end

      let(:session_row_query) {PEGASUS_DB[:hoc_activity].where(id: session_row_id)}

      it 'updates existing session row with pixel_finished_at and pixel_finished_ip' do
        _ {complete_tutorial_pixel}.must_change(
          -> {session_row_query.first&.slice(:pixel_finished_at, :pixel_finished_ip)},
          from: {pixel_finished_at: nil, pixel_finished_ip: nil},
          to: {pixel_finished_at: current_time, pixel_finished_ip: request_ip}
        )
      end

      it 'does not create new session row' do
        complete_tutorial_pixel
        expect(described_instance).not_to have_received(:create_session_row)
      end

      context 'and pixel is finished' do
        before do
          session_row_query.update(
            pixel_finished_ip: 'initial_ip',
            pixel_finished_at: 2.hours.ago,
          )
        end

        it 'does not update existing session row' do
          _ {complete_tutorial_pixel}.wont_change -> {session_row_query.first}
        end

        it 'creates new session row' do
          complete_tutorial_pixel
          expect(described_instance).to have_received(:create_session_row).once
        end
      end

      context 'and session is finished' do
        before do
          session_row_query.update(
            pixel_finished_ip: 'initial_ip',
            pixel_finished_at: 2.hours.ago,
            finished_at: 1.hour.ago,
          )
        end

        it 'does not update existing session row' do
          _ {complete_tutorial_pixel}.wont_change -> {session_row_query.first}
        end

        it 'creates new session row' do
          complete_tutorial_pixel
          expect(described_instance).to have_received(:create_session_row).once
        end
      end
    end
  end
end
