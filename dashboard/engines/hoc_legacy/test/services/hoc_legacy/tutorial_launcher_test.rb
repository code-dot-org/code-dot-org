# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialLauncherTest < ActiveSupport::TestCase
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

  let(:dcdo_hoc_learn_activity_sample_weight) {2}
  let(:request_ip) {Faker::Internet.unique.ip_v4_address}
  let(:referer_site_with_port) {'https://test.code.org:3000'}
  let(:current_time) {DateTime.parse('1970-01-01 00:00:00')}
  let(:random_hex) {'random_hex'}
  let(:random_num) {0.49}

  describe 'class' do
    it 'includes SessionManageable concern' do
      _(described_class.ancestors).must_include HocLegacy::SessionManageable
    end
  end

  describe '#call' do
    subject(:launch_tutorial) {described_instance.call}

    around do |test|
      Timecop.freeze(current_time) {test.call}
    end

    around do |test|
      PEGASUS_DB.transaction(rollback: :always) {test.call}
    end

    before do
      allow(CDO).to receive(:read_only).and_return(false)

      allow(DCDO).to receive(:get).with('hoc_learn_activity_sample_weight', anything).and_return(dcdo_hoc_learn_activity_sample_weight)
      allow(request).to receive(:referer_site_with_port).and_return(referer_site_with_port)
      allow(request).to receive(:ip).and_return(request_ip)

      allow(described_instance).to receive(:create_session_row)
    end

    it 'creates session row' do
      expected_row_id = Faker::Number.unique.number(digits: 5)

      expect(described_instance).to receive(:create_session_row).with(
        {
          referer: referer_site_with_port,
          tutorial: tutorial_code,
          started_at: current_time,
          started_ip: request_ip
        }
      ).and_return({id: expected_row_id})

      launch_tutorial
    end

    context 'when read_only mode is enabled' do
      before do
        allow(CDO).to receive(:read_only).and_return(true)
      end

      it 'does not create session row' do
        expect(described_instance).not_to receive(:create_session_row)
        launch_tutorial
      end
    end
  end
end
