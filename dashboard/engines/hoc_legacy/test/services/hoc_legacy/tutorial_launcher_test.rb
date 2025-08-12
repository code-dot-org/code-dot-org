# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialLauncherTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:described_instance) {described_class.new(controller:, tutorial:, company:, track_learn:)}

  let(:request) {ActionDispatch::TestRequest.create}
  let(:response) {ActionDispatch::TestResponse.new}
  let(:controller) do
    HocLegacy::TutorialsController.new.tap do |controller|
      controller.request = request
      controller.response = response
    end
  end
  let(:tutorial_code) {'tutorial_code'}
  let(:tutorial) {{code: tutorial_code}}
  let(:company) {'test_company'}
  let(:track_learn) {true}

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

    let(:hoc_learn_activity) {PEGASUS_DB[:hoc_learn_activity].order(:id).last}

    around do |test|
      Timecop.freeze(current_time) {test.call}
    end

    around do |test|
      PEGASUS_DB.transaction(rollback: :always) {test.call}
    end

    before do
      allow(CDO).to receive(:read_only).and_return(false)
      allow(described_instance).to receive(:unsampled_session?).and_return(false)

      allow(DCDO).to receive(:get).with('hoc_learn_activity_sample_weight', anything).and_return(dcdo_hoc_learn_activity_sample_weight)
      allow(request).to receive(:referer_site_with_port).and_return(referer_site_with_port)
      allow(request).to receive(:ip).and_return(request_ip)

      allow(described_instance).to receive(:create_session_row_unless_unsampled)
    end

    it 'creates session row and hoc_learn_activity record' do
      expected_row_id = Faker::Number.unique.number(digits: 5)

      expect(described_instance).to receive(:create_session_row).with(
        {
          referer: referer_site_with_port,
          tutorial: tutorial_code,
          company: company,
          started_at: current_time,
          started_ip: request_ip
        }
      ).and_return({id: expected_row_id})

      _ {launch_tutorial}.must_differ 'PEGASUS_DB[:hoc_learn_activity].count', 1

      _(hoc_learn_activity).wont_be_nil
      _(hoc_learn_activity[:hoc_activity_id]).must_equal expected_row_id
      _(hoc_learn_activity[:referer]).must_equal referer_site_with_port
      _(hoc_learn_activity[:weight]).must_equal dcdo_hoc_learn_activity_sample_weight
      _(hoc_learn_activity[:tutorial]).must_equal tutorial_code
      _(hoc_learn_activity[:created_at]).must_equal current_time
    end

    context 'when read_only mode is enabled' do
      before do
        allow(CDO).to receive(:read_only).and_return(true)
      end

      it 'does not create session row or hoc_learn_activity record' do
        expect(described_instance).not_to receive(:create_session_row)
        _ {launch_tutorial}.wont_differ -> {PEGASUS_DB[:hoc_learn_activity].count}
      end
    end

    context 'when :track_learn arg is false' do
      let(:track_learn) {false}

      it 'creates session row but not hoc_learn_activity record' do
        expect(described_instance).to receive(:create_session_row).once
        _ {launch_tutorial}.wont_differ -> {PEGASUS_DB[:hoc_learn_activity].count}
      end
    end
  end
end
