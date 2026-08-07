# frozen_string_literal: true

require 'cdo/geocoder'

class ProjectStorage::AnonymousGeoBackfillingJob < ApplicationJob
  DEFAULT_LIMIT = 100_000
  BATCH_SIZE = 1000

  queue_as CDO.active_job_queues[:low_priority]

  before_perform do
    throw :abort if DCDO.get('project_storage_geos_backfill_disabled', false)
  end

  around_perform do |job, block|
    # Ensures only one backfill job runs at a time
    ActiveRecord::Base.connection_pool.with_connection do |connection|
      next unless connection.get_advisory_lock(job.class.name)

      begin
        block.call
      ensure
        connection.release_advisory_lock(job.class.name)
      end
    end
  end

  rescue_from StandardError do |exception|
    Observability::Errors.capture_exception(exception)
  end

  def perform(limit: DEFAULT_LIMIT)
    started_at = Time.now.utc

    success = false
    processed_count = 0

    first_storage_id = nil
    last_storage_id  = nil

    loop do
      current_batch_size = [BATCH_SIZE, limit - processed_count].min
      break unless current_batch_size.positive?

      from_storage_id = last_storage_id&.next
      missing_project_storage_geos_batch = missing_project_storage_geos(from_storage_id:, limit: current_batch_size)
      break if missing_project_storage_geos_batch.empty?

      ProjectStorage::Geo.import(
        missing_project_storage_geos_batch,
        validate: false,
        on_duplicate_key_ignore: true,
      )

      minmax_storage_ids = missing_project_storage_geos_batch.map(&:storage_id).minmax
      first_storage_id ||= minmax_storage_ids.first
      last_storage_id    = minmax_storage_ids.last

      processed_count += missing_project_storage_geos_batch.size
      break if missing_project_storage_geos_batch.size < current_batch_size
    end

    success = true
    processed_count
  ensure
    finished_at = Time.now.utc

    CDO.log.info JSON.dump(
      namespace: 'project_storage_geos',
      event: 'backfill',
      success:,
      limit:,
      processed_count:,
      first_storage_id:,
      last_storage_id:,
      started_at:,
      finished_at:,
      duration: finished_at - started_at,
    )
  end

  private def missing_project_storage_geos(from_storage_id: nil, limit: BATCH_SIZE)
    ActiveRecord::Base.connected_to(role: :reporting) do
      unlocated_storages_batch = ProjectStorage.anonymous.without_geo.with_projects.order(:id).limit(limit)

      if from_storage_id
        unlocated_storages_batch = unlocated_storages_batch.
          optimizer_hints("INDEX(#{ProjectStorage.table_name} PRIMARY)").
          where(id: from_storage_id..)
      end

      unlocated_storage_ids_batch = unlocated_storages_batch.pluck(:id)
      return [] if unlocated_storage_ids_batch.empty?

      unlocated_storage_numbered_projects = Project.
        select(:id, :storage_id, :updated_ip).
        select('ROW_NUMBER() OVER (PARTITION BY storage_id ORDER BY id) AS per_storage_position').
        where(storage_id: unlocated_storage_ids_batch)

      Project.from(unlocated_storage_numbered_projects, Project.table_name).where(per_storage_position: 1).map do |project|
        location = Retryable.retryable(on: StandardError, tries: 2, sleep: 0.05) do
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
