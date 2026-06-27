# frozen_string_literal: true

require 'test_helper'

class ProjectStorage::AnonymousGeoRecordingJobTest < ActiveJob::TestCase
  subject(:described_class) {ProjectStorage::AnonymousGeoRecordingJob}
  subject(:described_instance) {described_class.new}

  it 'inherits from ApplicationJob' do
    _(described_class.superclass).must_equal ::ApplicationJob
  end

  describe '#perform' do
    subject(:perform_job) {described_instance.perform(project_storage_id, ip_address)}

    let(:project_storage_id) {project_storage.id}
    let(:ip_address) {'203.0.113.7'}

    let(:user) {nil}
    let(:project_storage) {create(:project_storage, user:)}

    let(:geocoder_result) do
      OpenStruct.new(
        country: 'US',
        state: 'WA',
        city: 'Seattle',
        postal_code: '98101',
        latitude: '47.6062',
        longitude: '-122.3321'
      )
    end

    before do
      Geocoder.stubs(:find).with(ip_address).returns(geocoder_result)
    end

    it 'creates geo data for anonymous project storage' do
      _ {perform_job}.must_change -> {project_storage.reload.geo&.ip_address}, from: nil, to: ip_address

      _(project_storage.geo.country).must_equal geocoder_result.country
      _(project_storage.geo.state).must_equal geocoder_result.state
      _(project_storage.geo.city).must_equal geocoder_result.city
      _(project_storage.geo.postal_code).must_equal geocoder_result.postal_code
      _(project_storage.geo.latitude).must_be_close_to geocoder_result.latitude.to_f, 0.000001
      _(project_storage.geo.longitude).must_be_close_to geocoder_result.longitude.to_f, 0.000001
    end

    context 'when geocoder returns no location' do
      let(:geocoder_result) {nil}

      it 'creates geo data with only the ip address' do
        _ {perform_job}.must_change -> {project_storage.reload.geo&.ip_address}, from: nil, to: ip_address

        _(project_storage.geo.country).must_be_nil
        _(project_storage.geo.state).must_be_nil
        _(project_storage.geo.city).must_be_nil
        _(project_storage.geo.postal_code).must_be_nil
        _(project_storage.geo.latitude).must_be_nil
        _(project_storage.geo.longitude).must_be_nil
      end
    end

    context 'when geocoder returns blank location data' do
      let(:geocoder_result) do
        OpenStruct.new(
          country: '',
          state: ' ',
          city: nil,
          postal_code: '',
          latitude: '0',
          longitude: 0
        )
      end

      it 'stores blank fields as nil' do
        _ {perform_job}.must_change -> {project_storage.reload.geo&.ip_address}, from: nil, to: ip_address

        _(project_storage.geo.country).must_be_nil
        _(project_storage.geo.state).must_be_nil
        _(project_storage.geo.city).must_be_nil
        _(project_storage.geo.postal_code).must_be_nil
        _(project_storage.geo.latitude).must_be_nil
        _(project_storage.geo.longitude).must_be_nil
      end
    end

    context 'when geo data already exists' do
      let!(:existing_geo) {create(:project_storage_geo, project_storage:)}

      it 'does not create or update geo data' do
        _ {perform_job}.wont_change -> {existing_geo.reload.attributes}
      end
    end

    context 'when project storage does not exist' do
      let(:project_storage_id) {0}

      it 'does not create geo data' do
        _ {perform_job}.wont_change -> {ProjectStorage::Geo.count}
      end
    end

    context 'when project storage belongs to user' do
      let(:user) {build_stubbed(:user)}

      it 'does not create geo data' do
        _ {perform_job}.wont_change -> {ProjectStorage::Geo.count}
      end
    end
  end
end
