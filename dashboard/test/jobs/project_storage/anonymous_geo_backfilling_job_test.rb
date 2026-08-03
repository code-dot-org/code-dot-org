# frozen_string_literal: true

require 'test_helper'

class ProjectStorage::AnonymousGeoBackfillingJobTest < ActiveJob::TestCase
  GeocoderResultMock = Data.define(:ip_address, :country, :state, :city, :postal_code)

  subject(:described_instance) {described_class.new}

  before do
    CDO.log.stubs(:info)
    Geocoder.stubs(:find)
  end

  describe '.perform_later' do
    subject(:perform_later) {described_class.perform_later(**job_args)}

    let(:job_args) {{limit: 999}}

    it 'enqueues job to low priority queue' do
      must_enqueue_with(job: described_class, queue: 'low_priority', args: [job_args]) do
        perform_later
      end
    end
  end

  describe '.perform_now' do
    subject(:perform_now) {described_instance.perform_now}

    context 'when backfill is disabled' do
      before do
        DCDO.expects(:get).with('project_storage_geos_backfill_disabled', false).returns(true).once
      end

      it 'aborts before performing backfill' do
        assert_queries 0 do
          perform_now
        end
      end
    end

    context 'when backfill raises error' do
      let(:error) {StandardError.new('expected error')}

      before do
        described_instance.stubs(:perform).raises(error)
      end

      it 'captures error without reraising' do
        Observability::Errors.expects(:capture_exception).with(error).once

        assert_queries 0 do
          perform_now
        end
      end
    end
  end

  describe '#perform' do
    subject(:perform_job) {described_instance.perform(**job_args)}

    let(:job_args) {{}}

    let!(:project_storage) {create(:project_storage, user:)}
    let(:user) {nil}
    let(:project_storage_geo) {nil}
    let(:projects) {create_list(:project, 2, project_storage:)}

    let(:project_locations) do
      projects.map.with_index(1) do |project, index|
        GeocoderResultMock.new(
          ip_address:  project.updated_ip,
          country:     "#{index.ordinalize} project country",
          state:       "#{index.ordinalize} project state",
          city:        "#{index.ordinalize} project city",
          postal_code: "#{index.ordinalize} project postal_code",
        )
      end
    end

    setup_all do
      ProjectStorage.destroy_all
    end

    before do
      project_locations.each do |project_location|
        Geocoder.stubs(:find).with(project_location.ip_address).returns(project_location)
      end
    end

    shared_examples_for 'does not backfill geo record' do
      it 'does not backfill geo record' do
        CDO.log.expects(:info).once.with do |log_json|
          log_data = JSON.parse(log_json)
          _(log_data['namespace']).must_equal 'project_storage_geos'
          _(log_data['event']).must_equal 'backfill'
          _(log_data['success']).must_equal true
          _(log_data['limit']).must_equal job_args[:limit] || 100_000
          _(log_data['processed_count']).must_equal 0
          _(log_data['imported_count']).must_equal 0
          _(log_data['last_processed_storage_id']).must_be_nil
        end

        _ {perform_job}.wont_differ -> {ProjectStorage::Geo.count}
      end
    end

    it 'backfills geo record using IP from first created project' do
      CDO.log.expects(:info).once.with do |log_json|
        log_data = JSON.parse(log_json)
        _(log_data['namespace']).must_equal 'project_storage_geos'
        _(log_data['event']).must_equal 'backfill'
        _(log_data['success']).must_equal true
        _(log_data['limit']).must_equal 100_000
        _(log_data['processed_count']).must_equal 1
        _(log_data['imported_count']).must_equal 1
        _(log_data['last_processed_storage_id']).must_equal project_storage.id
      end

      _ {perform_job}.must_change(
        -> {project_storage.reload.geo&.as_json(only: %i[country state city postal_code])},
        from: nil,
        to: {
          'country'     => project_locations.first.country,
          'state'       => project_locations.first.state,
          'city'        => project_locations.first.city,
          'postal_code' => project_locations.first.postal_code,
        }
      )
    end

    context 'when limit is less then number of relevant storages' do
      let(:job_args) {{limit: 0}}

      it_behaves_like 'does not backfill geo record'
    end

    context 'when storage is not anonymous' do
      let(:user) {build_stubbed(:user)}

      it_behaves_like 'does not backfill geo record'
    end

    context 'when storage has geo record' do
      let!(:project_storage_geo) {create(:project_storage_geo, project_storage:)}

      it_behaves_like 'does not backfill geo record'
    end

    context 'when storage has no projects' do
      let(:projects) {[]}

      it_behaves_like 'does not backfill geo record'
    end
  end
end
