# frozen_string_literal: true

require 'test_helper'

class ProjectStorage::AnonymousGeoBackfillingJobTest < ActiveJob::TestCase
  GeocoderResultMock = Data.define(:country, :state, :city, :postal_code)

  subject(:described_instance) {described_class.new}

  before do
    CDO.log.stubs(:info)
    CDO.shared_cache.clear
  end

  describe '.storage_id_cursor=' do
    let(:storage_id_cursor) {rand(1..1000)}

    it 'stores storage ID cursor in shared cache' do
      _ {described_class.storage_id_cursor = storage_id_cursor}.must_change(
        -> {CDO.shared_cache.read(described_class::STORAGE_ID_CURSOR_CACHE_KEY)}, from: nil, to: storage_id_cursor
      )
    end
  end

  describe '.storage_id_cursor' do
    it 'returns nil when no geo data has been recorded' do
      _(described_class.storage_id_cursor).must_be_nil
    end

    context 'when geo data has been recorded' do
      let!(:project_storage_geos) {create_list(:project_storage_geo, 2)}

      it 'returns the highest storage ID with recorded geo data' do
        _(described_class.storage_id_cursor).must_equal project_storage_geos.last.storage_id
      end

      context 'when cursor was cached' do
        let(:storage_id_cursor) {project_storage_geos.first.storage_id}

        before do
          CDO.shared_cache.write(described_class::STORAGE_ID_CURSOR_CACHE_KEY, storage_id_cursor)
        end

        it 'returns cached cursor' do
          _(described_class.storage_id_cursor).must_equal storage_id_cursor
        end
      end
    end
  end

  describe '.perform_later' do
    subject(:perform_later) {described_class.perform_later(**job_args)}

    let(:job_args) do
      {
        batch_size: 10,
        scan_size: 100,
        limit: 999,
        dry_run: true,
      }
    end

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
        CDO.log.expects(:info).never.with do |log_json|
          log_data = JSON.parse(log_json)
          _(log_data['namespace']).must_equal 'project_storage_geos'
          _(log_data['event']).must_equal 'backfill'
        end

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
        CDO.log.expects(:info).never.with do |log_json|
          log_data = JSON.parse(log_json)
          _(log_data['namespace']).must_equal 'project_storage_geos'
          _(log_data['event']).must_equal 'backfill'
        end

        assert_queries 1 do
          perform_now
        end
      end
    end

    context 'when backfill raises error' do
      let(:error) {StandardError.new('expected error')}
      let!(:project_storage) {create(:project_storage)}

      before do
        described_instance.stubs(:missing_project_storage_geos).raises(error)
      end

      it 'captures error without reraising' do
        Observability::Errors.expects(:capture_exception).with(error).once

        CDO.log.expects(:info).once.with do |log_json|
          log_data = JSON.parse(log_json)
          _(log_data['namespace']).must_equal 'project_storage_geos'
          _(log_data['event']).must_equal 'backfill'
          _(log_data['batch_size']).must_equal described_class::DEFAULT_BATCH_SIZE
          _(log_data['scan_size']).must_equal described_class::DEFAULT_SCAN_SIZE
          _(log_data['limit']).must_equal described_class::DEFAULT_LIMIT
          _(log_data['dry_run']).must_equal false
          _(log_data['success']).must_equal false
          _(log_data['processed_count']).must_equal 0
          _(log_data['first_storage_id']).must_be_nil
          _(log_data['last_storage_id']).must_be_nil
          _(log_data['storage_id_cursor']).must_equal 0
        end

        assert_queries 2, capture_filters: [/perform/] do
          _perform_now.must_equal error
        end
      end
    end

    context 'when backfill exceeds maximum run time' do
      let(:max_run_time) {0.001}
      let!(:project_storage) {create(:project_storage)}

      around do |test|
        described_class.stub_const(:MAX_RUN_TIME, max_run_time) {test.call}
      end

      before do
        described_class.storage_id_cursor = 0
        described_instance.stubs(:missing_project_storage_geos).with {sleep(max_run_time * 2) && true}
      end

      it 'terminates job' do
        Observability::Errors.expects(:capture_exception).with(instance_of(Timeout::Error)).once

        CDO.log.expects(:info).once.with do |log_json|
          log_data = JSON.parse(log_json)
          _(log_data['namespace']).must_equal 'project_storage_geos'
          _(log_data['event']).must_equal 'backfill'
          _(log_data['batch_size']).must_equal described_class::DEFAULT_BATCH_SIZE
          _(log_data['scan_size']).must_equal described_class::DEFAULT_SCAN_SIZE
          _(log_data['limit']).must_equal described_class::DEFAULT_LIMIT
          _(log_data['dry_run']).must_equal false
          _(log_data['success']).must_equal false
          _(log_data['processed_count']).must_equal 0
          _(log_data['first_storage_id']).must_be_nil
          _(log_data['last_storage_id']).must_be_nil
          _(log_data['storage_id_cursor']).must_equal 0
        end

        _perform_now.must_be_instance_of Timeout::Error
      end
    end
  end

  describe '#perform' do
    subject(:perform_job) {described_instance.perform(**job_args)}

    let(:job_args) {{}}

    let(:project_storages_total) {1}
    let(:projects_per_storage) {2}

    let(:user) {nil}

    let!(:project_storages) {create_list(:project_storage, project_storages_total, user:)}
    let!(:projects) {project_storages.flat_map {|project_storage| create_list(:project, projects_per_storage, project_storage:)}}

    setup_all do
      ProjectStorage.destroy_all
    end

    before do
      project_storages.each do |project_storage|
        project = project_storage.projects.first
        next unless project

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
          _(log_data['batch_size']).must_equal job_args.fetch(:batch_size, described_class::DEFAULT_BATCH_SIZE)
          _(log_data['scan_size']).must_equal job_args.fetch(:scan_size, described_class::DEFAULT_SCAN_SIZE)
          _(log_data['limit']).must_equal job_args.fetch(:limit, described_class::DEFAULT_LIMIT)
          _(log_data['dry_run']).must_equal job_args.fetch(:dry_run, false)
          _(log_data['success']).must_equal true
          _(log_data['processed_count']).must_equal project_storages_total
          _(log_data['first_storage_id']).must_equal project_storages.first.id
          _(log_data['last_storage_id']).must_equal project_storages.last.id
          _(log_data['storage_id_cursor']).must_equal project_storages.last.id
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

    shared_examples_for 'does not backfill geo records' do |expected_storage_id_cursor: nil|
      it 'does not backfill geo records' do
        CDO.log.expects(:info).once.with do |log_json|
          log_data = JSON.parse(log_json)
          _(log_data['namespace']).must_equal 'project_storage_geos'
          _(log_data['event']).must_equal 'backfill'
          _(log_data['batch_size']).must_equal job_args.fetch(:batch_size, described_class::DEFAULT_BATCH_SIZE)
          _(log_data['scan_size']).must_equal job_args.fetch(:scan_size, described_class::DEFAULT_SCAN_SIZE)
          _(log_data['limit']).must_equal job_args.fetch(:limit, described_class::DEFAULT_LIMIT)
          _(log_data['dry_run']).must_equal job_args.fetch(:dry_run, false)
          _(log_data['success']).must_equal true
          _(log_data['processed_count']).must_equal 0
          _(log_data['first_storage_id']).must_be_nil
          _(log_data['last_storage_id']).must_be_nil
          _(log_data['storage_id_cursor']).must_equal(expected_storage_id_cursor || project_storages.last.id)
        end

        _ {perform_job}.wont_differ -> {ProjectStorage::Geo.count}
      end
    end

    it_behaves_like 'backfills geo records'

    context 'when dry run' do
      let(:job_args) {{dry_run: true}}

      it 'does not write geo records or advance cache' do
        _ {perform_job}.wont_change -> {ProjectStorage::Geo.count}
        _(CDO.shared_cache.read(described_class::STORAGE_ID_CURSOR_CACHE_KEY)).must_be_nil
      end
    end

    context 'when records span multiple batches' do
      let(:batch_size) {1}
      let(:job_args) {{batch_size:}}

      let(:project_storages_total) {batch_size.next}
      let(:projects_per_storage) {1}

      it_behaves_like 'backfills geo records', 'uses highest processed storage ID as batch cursor'
    end

    context 'when a previous invocation cached its last storage ID' do
      let(:job_args) {{limit: 1}}
      let(:project_storages_total) {2}
      let(:projects_per_storage) {1}

      before do
        described_class.storage_id_cursor = project_storages.first.id
      end

      it 'resumes after cached storage ID' do
        _ {perform_job}.must_change -> {ProjectStorage::Geo.count}, from: 0, to: 1

        _(project_storages.first.reload.geo).must_be_nil
        _(project_storages.last.reload.geo).wont_be_nil
        _(CDO.shared_cache.read(described_class::STORAGE_ID_CURSOR_CACHE_KEY)).
          must_equal project_storages.last.id
      end
    end

    context 'when an ID range contains no missing geo records' do
      let(:job_args) {{scan_size: 1}}
      let(:project_storages_total) {2}
      let(:projects_per_storage) {1}
      let!(:existing_geo) {create(:project_storage_geo, project_storage: project_storages.first)}

      before do
        described_class.storage_id_cursor = project_storages.first.id.pred
      end

      it 'continues scanning after an empty ID range' do
        queries = nil

        _ do
          queries = capture_queries(capture_filters: [/missing_project_storage_geos/]) {perform_job}
        end.must_change -> {ProjectStorage::Geo.count}, from: 1, to: 2

        _(queries.first).must_match(/`id` >= #{project_storages.first.id}.*`id` <= #{project_storages.first.id}/)
        _(project_storages.last.reload.geo).wont_be_nil
        _(CDO.shared_cache.read(described_class::STORAGE_ID_CURSOR_CACHE_KEY)).
          must_equal project_storages.last.id
      end
    end

    context 'when ID range contains fewer records than batch size' do
      let(:scan_size) {project_storages.second.id - project_storages.first.id + 1}
      let(:job_args) {{scan_size:}}
      let(:project_storages_total) {3}
      let(:projects_per_storage) {1}

      let!(:existing_geo) {create(:project_storage_geo, project_storage: project_storages.second)}

      before do
        described_class.storage_id_cursor = project_storages.first.id.pred
      end

      it 'continues scanning after the end of the partially filled range' do
        queries = capture_queries(capture_filters: [/missing_project_storage_geos/]) {perform_job}
        storage_queries = queries.grep(/FROM `user_project_storage_ids`/)

        _(storage_queries.length).must_equal 2
        _(storage_queries.first).must_match /`id` >= #{project_storages.first.id}.*`id` <= #{project_storages.second.id}/
        _(storage_queries.second).must_match /`id` >= #{project_storages.second.id.next}.*`id` <= #{project_storages.last.id}/
        _(ProjectStorage::Geo.where(project_storage: project_storages.values_at(0, 2)).count).must_equal 2
      end
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

      it_behaves_like 'does not backfill geo records', expected_storage_id_cursor: 0
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
