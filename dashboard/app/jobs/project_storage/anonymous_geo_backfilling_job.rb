# frozen_string_literal: true

require 'cdo/geocoder'
require 'ruby-progressbar'

class ProjectStorage::AnonymousGeoBackfillingJob < ApplicationJob
  MAX_RUN_TIME = [Delayed::Worker.max_run_time, 30.minutes].min.to_i

  STORAGE_ID_CURSOR_CACHE_KEY = 'project_storage/anonymous_geo_backfill/storage_id_cursor'

  # The last successful production run ended at this ID on 2026-08-16,
  # before growing table scans caused later runs to time out.
  DEFAULT_STORAGE_ID_CURSOR = CDO.rack_env?(:production) ? 220_585_735 : nil

  DEFAULT_BATCH_SIZE = 1000
  DEFAULT_SCAN_SIZE = 1_000_000
  DEFAULT_LIMIT = 100_000

  GEOCODER_RETRY_TRIES = 2
  GEOCODER_RETRY_SLEEP = 0.05

  queue_as CDO.active_job_queues[:low_priority]

  before_perform do
    throw :abort if DCDO.get('project_storage_geos_backfill_disabled', false)
  end

  around_perform do |job, block|
    # Ensures only one backfill job runs at a time
    ActiveRecord::Base.connection_pool.with_connection do |connection|
      next unless connection.get_advisory_lock(job.class.name)

      begin
        # Prevents a stuck or slow job run from occupying a worker for too long.
        Timeout.timeout(MAX_RUN_TIME, &block)
      ensure
        connection.release_advisory_lock(job.class.name)
      end
    end
  end

  rescue_from StandardError do |exception|
    Observability::Errors.capture_exception(exception)
  end

  def self.storage_id_cursor
    CDO.shared_cache.read(STORAGE_ID_CURSOR_CACHE_KEY) || DEFAULT_STORAGE_ID_CURSOR
  end

  def self.storage_id_cursor=(storage_id)
    CDO.shared_cache.write(STORAGE_ID_CURSOR_CACHE_KEY, storage_id)
  end

  def perform(batch_size: DEFAULT_BATCH_SIZE, scan_size: DEFAULT_SCAN_SIZE, limit: DEFAULT_LIMIT, dry_run: false)
    started_at = Time.now.utc
    dry_run_progress_bar = ProgressBar.create(total: limit, format: 'DRY RUN [%c/%C]: |%W| %a') if dry_run

    success = false
    processed_count = 0

    storage_id_cursor = self.class.storage_id_cursor.to_i
    first_storage_id  = nil
    last_storage_id   = nil

    loop do
      current_batch_size = [batch_size, limit - processed_count].min
      break unless current_batch_size.positive?

      from_storage_id = storage_id_cursor.next
      break if from_storage_id > max_storage_id

      to_storage_id = [from_storage_id + scan_size.pred, max_storage_id].min
      missing_project_storage_geos_batch = missing_project_storage_geos(
        from_storage_id:,
        to_storage_id:,
        limit: current_batch_size,
      )

      processed_storage_ids = missing_project_storage_geos_batch.map(&:storage_id)

      if dry_run_progress_bar
        dry_run_progress_bar.progress += processed_storage_ids.size
        dry_run_progress_bar.log <<~LOG
          Would import #{processed_storage_ids.size} ProjectStorage::Geo records
          Range:       #{from_storage_id}..#{to_storage_id}
          Batch:       #{current_batch_size}
          Storage IDs: #{processed_storage_ids.inspect}
        LOG
      end

      unless dry_run
        ProjectStorage::Geo.import(
          missing_project_storage_geos_batch,
          validate: false,
          on_duplicate_key_ignore: true,
        )
      end

      processed_count   += processed_storage_ids.size
      first_storage_id ||= processed_storage_ids.min
      last_storage_id    = processed_storage_ids.max
      storage_id_cursor  = processed_storage_ids.size < current_batch_size ? to_storage_id : last_storage_id

      self.class.storage_id_cursor = storage_id_cursor unless dry_run
    end

    success = true
    processed_count
  ensure
    finished_at = Time.now.utc
    dry_run_progress_bar&.finish

    CDO.log.info JSON.dump(
      namespace: 'project_storage_geos',
      event: 'backfill',
      batch_size:,
      scan_size:,
      limit:,
      dry_run:,
      success:,
      processed_count:,
      storage_id_cursor:,
      first_storage_id:,
      last_storage_id:,
      max_storage_id:,
      started_at:,
      finished_at:,
      duration: finished_at - started_at,
    )
  end

  private def max_storage_id
    @max_storage_id ||= ActiveRecord::Base.connected_to(role: :reporting) do
      ProjectStorage.maximum(:id).to_i
    end
  end

  private def missing_project_storage_geos(from_storage_id: nil, to_storage_id: nil, limit: DEFAULT_BATCH_SIZE)
    ActiveRecord::Base.connected_to(role: :reporting) do
      unlocated_storages_batch = ProjectStorage.anonymous.without_geo.with_projects.order(:id).limit(limit)
      unlocated_storages_batch = unlocated_storages_batch.where(id: from_storage_id..) if from_storage_id
      unlocated_storages_batch = unlocated_storages_batch.where(id: ..to_storage_id)   if to_storage_id

      unlocated_storage_ids_batch = unlocated_storages_batch.pluck(:id)
      return [] if unlocated_storage_ids_batch.empty?

      unlocated_storage_numbered_projects = Project.
        select(:id, :storage_id, :updated_ip).
        select('ROW_NUMBER() OVER (PARTITION BY storage_id ORDER BY id) AS per_storage_position').
        where(storage_id: unlocated_storage_ids_batch)

      Project.from(unlocated_storage_numbered_projects, Project.table_name).where(per_storage_position: 1).map do |project|
        location = Retryable.retryable(on: StandardError, tries: GEOCODER_RETRY_TRIES, sleep: GEOCODER_RETRY_SLEEP) do
          Geocoder.with_errors {Geocoder.find(project.updated_ip)}
        end

        ProjectStorage::Geo.new(
          storage_id:  project.storage_id,
          country:     location&.country.presence,
          state:       location&.state.presence,
          city:        location&.city.presence,
          postal_code: location&.postal_code.presence,
        )
      end
    end
  end
end
