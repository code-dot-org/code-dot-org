# frozen_string_literal: true

require 'test_helper'

class ProjectStorage::AnonymousGeoBackfillingJobTest < ActiveJob::TestCase
  GeocoderResultMock = Data.define(:country, :state, :city, :postal_code)

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

    context 'when another job holds database lock' do
      let(:connection_pool) {ActiveRecord::Base.connection_pool}
      let(:lock_connection) {connection_pool.checkout}

      around do |test|
        _(lock_connection.get_advisory_lock(described_class.name)).must_equal true

        test.call
      ensure
        lock_connection.release_advisory_lock(described_class.name)
        connection_pool.checkin(lock_connection)
      end

      it 'does not perform backfill' do
        assert_queries 1 do
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

        assert_queries 2 do
          perform_now
        end
      end
    end

    context 'when backfill exceeds maximum run time' do
      let(:max_run_time) {0.001}

      around do |test|
        described_class.stub_const(:MAX_RUN_TIME, max_run_time) {test.call}
      end

      before do
        described_instance.stubs(:perform).with {sleep(max_run_time * 2) && true}
      end

      it 'terminates job' do
        Observability::Errors.expects(:capture_exception).with(instance_of(Timeout::Error)).once
        perform_now
      end
    end
  end

  describe '#perform' do
    subject(:perform_job) {described_instance.perform(**job_args)}

    let(:job_args) {{}}

    let(:project_storages_total) {1}
    let(:projects_per_storage) {2}

    let(:user) {nil}
    let(:project_storage_geo) {nil}

    let!(:project_storages) {create_list(:project_storage, project_storages_total, user:)}
    let!(:projects) {project_storages.flat_map {|project_storage| create_list(:project, projects_per_storage, project_storage:)}}

    setup_all do
      ProjectStorage.destroy_all
    end

    before do
      projects.each do |project|
        Geocoder.stubs(:find).with(project.updated_ip).returns(
          GeocoderResultMock.new(
            country:     "project #{project.id} country",
            state:       "project #{project.id} state",
            city:        "project #{project.id} city",
            postal_code: "project #{project.id} postal_code",
          )
        )
      end
    end

    shared_examples_for 'backfills geo records' do |desc = 'backfills geo records using IP from first created project'|
      it desc do
        CDO.log.expects(:info).once.with do |log_json|
          log_data = JSON.parse(log_json)
          _(log_data['namespace']).must_equal 'project_storage_geos'
          _(log_data['event']).must_equal 'backfill'
          _(log_data['success']).must_equal true
          _(log_data['limit']).must_equal 100_000
          _(log_data['processed_count']).must_equal project_storages_total
          _(log_data['first_storage_id']).must_equal project_storages.first.id
          _(log_data['last_storage_id']).must_equal project_storages.last.id
        end

        _ {perform_job}.must_change -> {ProjectStorage::Geo.count}, from: 0, to: project_storages_total

        project_storages.each do |project_storage|
          first_project = project_storage.projects.first
          _(project_storage.geo.country).must_equal "project #{first_project.id} country"
          _(project_storage.geo.state).must_equal "project #{first_project.id} state"
          _(project_storage.geo.city).must_equal "project #{first_project.id} city"
          _(project_storage.geo.postal_code).must_equal "project #{first_project.id} postal_code"
        end
      end
    end

    shared_examples_for 'does not backfill geo records' do
      it 'does not backfill geo records' do
        CDO.log.expects(:info).once.with do |log_json|
          log_data = JSON.parse(log_json)
          _(log_data['namespace']).must_equal 'project_storage_geos'
          _(log_data['event']).must_equal 'backfill'
          _(log_data['success']).must_equal true
          _(log_data['limit']).must_equal job_args[:limit] || 100_000
          _(log_data['processed_count']).must_equal 0
          _(log_data['first_storage_id']).must_be_nil
          _(log_data['last_storage_id']).must_be_nil
        end

        _ {perform_job}.wont_differ -> {ProjectStorage::Geo.count}
      end
    end

    it_behaves_like 'backfills geo records'

    context 'when records span multiple batches' do
      let(:batches_size) {1}

      let(:project_storages_total) {batches_size.next}
      let(:projects_per_storage) {1}

      around do |test|
        described_class.stub_const(:BATCH_SIZE, batches_size) {test.call}
      end

      it_behaves_like 'backfills geo records', 'uses highest processed storage ID as batch cursor'
    end

    context 'when result contains fewer records than requested batch size' do
      let(:job_args) {{limit: 2}}

      it 'does not query for another batch' do
        assert_queries 2, capture_filters: [/missing_project_storage_geos/] do
          perform_job
        end
      end
    end

    context 'when limit is less then number of relevant storages' do
      let(:job_args) {{limit: 0}}

      it_behaves_like 'does not backfill geo records'
    end

    context 'when storage is not anonymous' do
      let(:user) {build_stubbed(:user)}

      it_behaves_like 'does not backfill geo records'
    end

    context 'when storage has geo record' do
      let!(:project_storage_geos) do
        project_storages.map {|project_storage| create(:project_storage_geo, project_storage:)}
      end

      it_behaves_like 'does not backfill geo records'
    end

    context 'when storage has no projects' do
      let(:projects_per_storage) {0}

      it_behaves_like 'does not backfill geo records'
    end

    context 'when geocoding initially raises an error' do
      let(:projects_per_storage) {1}

      let(:error) {StandardError.new('expected error')}

      before do
        Geocoder.expects(:find).with(projects.first.updated_ip).twice.raises(error).then.returns(nil)
      end

      it 'retries once after half a second' do
        Kernel.expects(:sleep).with(0.05).once
        _ {perform_job}.must_change -> {ProjectStorage::Geo.count}, from: 0, to: project_storages_total
      end
    end
  end
end
