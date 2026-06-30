# frozen_string_literal: true

require 'test_helper'

class ProjectStorage::AnonymousGeoRecordingJobTest < ActiveJob::TestCase
  GeocoderResultMock = Data.define(:country, :state, :city, :postal_code)

  subject(:described_class) {ProjectStorage::AnonymousGeoRecordingJob}
  subject(:described_instance) {described_class.new}

  it 'inherits from ApplicationJob' do
    _(described_class.superclass).must_equal ::ApplicationJob
  end

  describe '#perform' do
    subject(:perform_job) {described_instance.perform(project_storage_id, ip_address)}

    let(:project_storage_id) {project_storage.id}
    let(:ip_address) {Faker::Internet.unique.public_ip_v4_address}

    let(:user) {nil}
    let(:project_storage) {create(:project_storage, user:)}

    let(:geocoder_result) do
      GeocoderResultMock.new(
        country:     Faker::Address.unique.country,
        state:       Faker::Address.unique.state,
        city:        Faker::Address.unique.city,
        postal_code: Faker::Address.unique.postcode,
      )
    end

    before do
      Geocoder.stubs(:find).with(ip_address).returns(geocoder_result)
    end

    it 'creates geo data for anonymous project storage' do
      _ {perform_job}.must_change -> {project_storage.reload.geo}, from: nil, to: lambda(&:present?)

      _(project_storage.geo.country).must_equal geocoder_result.country
      _(project_storage.geo.state).must_equal geocoder_result.state
      _(project_storage.geo.city).must_equal geocoder_result.city
      _(project_storage.geo.postal_code).must_equal geocoder_result.postal_code
    end

    context 'when geocoder returns no location' do
      let(:geocoder_result) {nil}

      it 'creates geo data with only the ip address' do
        _ {perform_job}.must_change -> {project_storage.reload.geo}, from: nil, to: lambda(&:present?)

        _(project_storage.geo.country).must_be_nil
        _(project_storage.geo.state).must_be_nil
        _(project_storage.geo.city).must_be_nil
        _(project_storage.geo.postal_code).must_be_nil
      end
    end

    context 'when geocoder returns blank location data' do
      let(:geocoder_result) do
        GeocoderResultMock.new(
          country: '',
          state: ' ',
          city: nil,
        )
      end

      it 'stores blank fields as nil' do
        _ {perform_job}.must_change -> {project_storage.reload.geo}, from: nil, to: lambda(&:present?)

        _(project_storage.geo.country).must_be_nil
        _(project_storage.geo.state).must_be_nil
        _(project_storage.geo.city).must_be_nil
        _(project_storage.geo.postal_code).must_be_nil
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
