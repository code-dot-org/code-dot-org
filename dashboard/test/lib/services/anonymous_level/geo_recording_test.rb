require 'test_helper'

class Services::AnonymousLevel::GeoRecordingTest < ActiveSupport::TestCase
  GeocoderResultMock = Data.define(:country, :state, :city, :postal_code)

  let(:described_class) {Services::AnonymousLevel::GeoRecording}
  let(:described_instance) {described_class.new(anon_user_id:, ip_address:)}

  let(:anon_user_id) {Cdo::AnonUserId.generate}
  let(:ip_address) {'1.2.3.4'}
  let(:geocoder_result) do
    GeocoderResultMock.new(
      country: 'United States',
      state: 'Washington',
      city: 'Seattle',
      postal_code: '98104',
    )
  end

  let(:geo_scope) {AnonymousLevel::Geo.where(anon_user_id:)}

  before do
    DCDO.set('anonymous_level_tracking_enabled', true)
    Geocoder.stubs(:find).with(ip_address).returns(geocoder_result)
  end

  it 'inherits from Services::Base' do
    _(described_class.superclass).must_equal Services::Base
  end

  describe '#call' do
    subject(:record_geo) {described_instance.call}

    it 'creates anonymous level geo' do
      _ {record_geo}.must_change -> {geo_scope.count}, from: 0, to: 1
    end

    it 'returns anonymous level geo' do
      _(record_geo).must_equal geo_scope.first!
    end

    it 'records location attributes' do
      record_geo

      geo = geo_scope.first!
      _(geo.country).must_equal     geocoder_result.country
      _(geo.state).must_equal       geocoder_result.state
      _(geo.city).must_equal        geocoder_result.city
      _(geo.postal_code).must_equal geocoder_result.postal_code
    end

    context 'when matching geo exists' do
      let!(:geo) {create(:anonymous_level_geo, anon_user_id:, country: 'Ukraine')}

      before do
        Geocoder.expects(:find).never
      end

      it 'returns existing geo without updating it' do
        _ {record_geo}.wont_change -> {geo_scope.count}

        _(record_geo).must_equal geo
        _(geo.reload.country).must_equal 'Ukraine'
      end
    end

    context 'when the IP address has no location' do
      let(:geocoder_result) {nil}

      it 'records geo without location attributes' do
        geo = record_geo

        _(geo.country).must_be_nil
        _(geo.state).must_be_nil
        _(geo.city).must_be_nil
        _(geo.postal_code).must_be_nil
      end
    end

    context 'when the location has blank attributes' do
      let(:geocoder_result) {GeocoderResultMock.new(country: '', state: ' ', city: nil, postal_code: '')}

      it 'records blank attributes as nil' do
        geo = record_geo

        _(geo.country).must_be_nil
        _(geo.state).must_be_nil
        _(geo.city).must_be_nil
        _(geo.postal_code).must_be_nil
      end
    end

    context 'when anonymous level tracking is disabled' do
      before do
        DCDO.set('anonymous_level_tracking_enabled', false)
        Geocoder.expects(:find).never
      end

      it 'does not record geo' do
        result = nil

        _ {result = record_geo}.wont_change -> {geo_scope.count}
        _(result).must_be_nil
      end
    end
  end
end
