# frozen_string_literal: true

require 'test_helper'

class HocLegacy::SessionManageableTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  let(:described_class) do
    Class.new do
      include HocLegacy::SessionManageable

      attr_reader :request, :response

      def initialize(request:, response:)
        @request = request
        @response = response
      end
    end
  end

  let(:request) {ActionDispatch::TestRequest.create}
  let(:response) {ActionDispatch::TestResponse.new}
  let(:described_instance) {described_class.new(request:, response:)}

  describe '#unsampled_session?' do
    subject(:unsampled_session?) {described_instance.send(:unsampled_session?)}

    let(:hour_of_code) {nil}

    before do
      request.cookies[HocLegacy::HOC_COOKIE_KEY] = hour_of_code
    end

    it 'returns false by default' do
      _unsampled_session?.must_equal false
    end

    context 'when hour_of_code cookies is HOC_UNSAMPLED' do
      let(:hour_of_code) {HocLegacy::UNSAMPLED_SESSION_ID}

      it 'returns true' do
        _unsampled_session?.must_equal true
      end
    end
  end

  describe '#set_hour_of_code_cookie_for_row' do
    subject(:set_hour_of_code_cookie_for_row) {described_instance.send(:set_hour_of_code_cookie_for_row, session_row)}

    let(:session_id) {Faker::Internet.unique.uuid}
    let(:session_row) {{session: session_id}}

    it 'sets hour_of_code cookie with row session id' do
      _set_hour_of_code_cookie_for_row.must_equal "hour_of_code=#{session_id}; domain=.code.org; path=/api/hour/"
      _(response.cookies[HocLegacy::HOC_COOKIE_KEY]).must_equal session_id
    end

    context 'when request script name is set' do
      # mount HocLegacy::Engine => '/engine_mount_path'
      let(:engine_mount_path) {'/engine_mount_path'}

      before do
        request.script_name = engine_mount_path
      end

      it 'sets hour_of_code cookie with correct path' do
        _set_hour_of_code_cookie_for_row.must_include "path=#{engine_mount_path}/api/hour/"
      end
    end
  end

  describe '#session_id' do
    subject(:session_id) {described_instance.send(:session_id)}

    let!(:hoc_cookie_value) {request.cookies[HocLegacy::HOC_COOKIE_KEY] = Faker::Internet.password}

    before do
      allow(described_instance).to receive(:unsampled_session?).and_return(false)
    end

    it 'returns session id from hour_of_code cookie' do
      _session_id.must_equal hoc_cookie_value
    end

    context 'when session is unsampled' do
      before do
        allow(described_instance).to receive(:unsampled_session?).and_return(true)
      end

      it 'returns nil' do
        _session_id.must_be_nil
      end
    end
  end

  describe '#create_session_row' do
    subject(:create_session_row) {described_instance.send(:create_session_row, session_row, weight:)}

    let(:weight) {nil}
    let(:row_referer) {'expected_referer'}
    let(:row_tutorial) {'expected_tutorial_code'}
    let(:row_company) {'expected_company'}
    let(:row_started_at) {DateTime.now}
    let(:row_started_ip) {'expected_ip'}
    let(:session_row) do
      {
        referer: row_referer,
        tutorial: row_tutorial,
        company: row_company,
        started_at: row_started_at,
        started_ip: row_started_ip
      }
    end

    let(:secure_random_hex) {'expected_secure_random_hex'}

    around do |test|
      PEGASUS_DB.transaction(rollback: :always) {test.call}
    end

    before do
      allow(described_instance).to receive(:set_hour_of_code_cookie_for_row)
      allow(SecureRandom).to receive(:hex).and_return(secure_random_hex)
    end

    it 'returns updated session row and sets hour_of_code cookie for it' do
      _ {create_session_row}.must_differ 'PEGASUS_DB[:hoc_activity].count', 1

      _(create_session_row[:id]).must_be_instance_of Integer
      _(create_session_row[:session]).must_equal "_1.0_#{secure_random_hex}"

      _(create_session_row[:referer]).must_equal row_referer
      _(create_session_row[:tutorial]).must_equal row_tutorial
      _(create_session_row[:company]).must_equal row_company
      _(create_session_row[:started_at]).must_equal row_started_at
      _(create_session_row[:started_ip]).must_equal row_started_ip

      expect(described_instance).to have_received(:set_hour_of_code_cookie_for_row).with(create_session_row).once
    end

    context 'when :weight argument is provided' do
      let(:weight) {99.9}

      it 'uses value in session id' do
        _(create_session_row[:session]).must_equal "_#{weight}_#{secure_random_hex}"
      end
    end

    context 'when session row record creation fails' do
      let(:pegasus_db_mock) {double(:PEGASUS_DB)}
      let(:hoc_activity_table_mock) {double(:hoc_activity_table)}

      before do
        stub_const('PEGASUS_DB', pegasus_db_mock)
        allow(pegasus_db_mock).to receive(:[]).with(:hoc_activity).and_return(hoc_activity_table_mock)
        allow(hoc_activity_table_mock).to receive(:insert).and_return(0) # Simulate failure to insert
      end

      it 'raises error after 3 failed retries' do
        expect(hoc_activity_table_mock).to receive(:insert).and_return(0, 0, 0)
        error_message = _ {create_session_row}.must_raise RuntimeError
        _(error_message.message).must_equal "Couldn't create a unique session row."
      end

      it 'does not raise error after two failed retries and third successful attempt' do
        last_retry_value = Faker::Number.unique.number(digits: 5)
        expect(hoc_activity_table_mock).to receive(:insert).and_return(0, 0, last_retry_value)
        _(create_session_row[:id]).must_equal last_retry_value
      end
    end
  end

  describe '#create_session_row_unless_unsampled' do
    subject(:create_session_row_unless_unsampled) {described_instance.send(:create_session_row_unless_unsampled, **session_row_params)}

    let(:random_num) {0.49}
    let(:dcdo_hoc_activity_sample_weight) {2}

    let(:session_row_params) {{}}

    before do
      allow(Kernel).to receive(:rand).and_return(random_num)
      allow(DCDO).to receive(:get).with('hoc_activity_sample_weight', anything).and_return(dcdo_hoc_activity_sample_weight)
      allow(described_instance).to receive(:unsampled_session?).and_return(false)
      allow(described_instance).to receive(:create_session_row).and_return('created_session_row')
    end

    it 'does not set hour_of_code cookie' do
      expect(described_instance).not_to receive(:set_hour_of_code_cookie_for_row)
      create_session_row_unless_unsampled
    end

    it 'returns created session row' do
      created_session_row_mock = double(:created_session_row)

      expect(described_instance).to receive(:create_session_row).
        with(session_row_params, weight: dcdo_hoc_activity_sample_weight).
        and_return(created_session_row_mock)

      _create_session_row_unless_unsampled.must_equal created_session_row_mock
    end

    context 'when session is unsampled' do
      before do
        allow(described_instance).to receive(:unsampled_session?).and_return(true)
      end

      it 'skips session row creation' do
        expect(described_instance).not_to receive(:create_session_row)
        expect(described_instance).not_to receive(:set_hour_of_code_cookie_for_row)
        _create_session_row_unless_unsampled.must_be_nil
      end
    end

    context 'when :company row params is provided' do
      let(:company) {'expected_company'}
      let(:session_row_params) {{company:}}

      it 'returns created session row with default wight' do
        created_session_row_mock = double(:created_session_row)

        expect(described_instance).to receive(:create_session_row).
          with(session_row_params, weight: 1).
          and_return(created_session_row_mock)

        _create_session_row_unless_unsampled.must_equal created_session_row_mock
      end
    end

    context 'when DCDO hoc_activity_sample_weight is less than or equal to 0' do
      let(:dcdo_hoc_activity_sample_weight) {0}

      it 'sets hour_of_code cookie' do
        expect(described_instance).to receive(:set_hour_of_code_cookie_for_row).
          with(session: HocLegacy::UNSAMPLED_SESSION_ID).once
        create_session_row_unless_unsampled
      end

      it 'returns nil' do
        expect(described_instance).not_to receive(:create_session_row)
        _create_session_row_unless_unsampled.must_be_nil
      end
    end

    context 'when DCDO hoc_activity_sample_weight is less then random number' do
      let(:dcdo_hoc_activity_sample_weight) {random_num - 0.01}

      it 'sets hour_of_code cookie' do
        expect(described_instance).to receive(:set_hour_of_code_cookie_for_row).
          with(session: HocLegacy::UNSAMPLED_SESSION_ID).once
        create_session_row_unless_unsampled
      end

      it 'returns nil' do
        expect(described_instance).not_to receive(:create_session_row)
        _create_session_row_unless_unsampled.must_be_nil
      end
    end
  end

  describe '#session_row_query' do
    subject(:session_row_query) {described_instance.send(:session_row_query)}

    let(:session_id) {Faker::Internet.unique.uuid}
    let(:tutorial) {'expected_tutorial_code'}

    around do |test|
      PEGASUS_DB.transaction(rollback: :always) {test.call}
    end

    before do
      allow(described_instance).to receive(:session_id).and_return(session_id)

      PEGASUS_DB[:hoc_activity].insert(session: session_id, tutorial: tutorial)
    end

    it 'returns session row query for current session id' do
      session_row = session_row_query.first
      _(session_row).must_be_instance_of Hash
      _(session_row[:id]).must_be_instance_of Integer
      _(session_row[:session]).must_equal session_id
      _(session_row[:tutorial]).must_equal tutorial
    end
  end
end
