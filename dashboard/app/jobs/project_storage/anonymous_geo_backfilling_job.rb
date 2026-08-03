# frozen_string_literal: true

require 'cdo/geocoder'

class ProjectStorage::AnonymousGeoBackfillingJob < ApplicationJob
  DEFAULT_LIMIT = 100_000
  BATCH_SIZE = 1000

  queue_as CDO.active_job_queues[:low_priority]

  rescue_from StandardError do |exception|
    Observability::Errors.capture_exception(exception)
  end

  before_perform do
    throw :abort if DCDO.get('project_storage_geos_backfill_disabled', false)
  end

  around_perform do |job, block|
    ActiveRecord::Base.connection_pool.with_connection do |connection|
      next unless connection.get_advisory_lock(job.class.name)

      begin
        block.call
      ensure
        connection.release_advisory_lock(job.class.name)
      end
    end
  end

  def perform(limit: DEFAULT_LIMIT)
    started_at = Time.now.utc
    success = false

    processed_count = 0
    imported_count  = 0

    last_processed_storage_id = nil
    while processed_count < limit
      missing_project_storage_geos_batch = missing_project_storage_geos(
        from_storage_id: last_processed_storage_id.to_i.next,
        limit: [BATCH_SIZE, limit - processed_count].min,
      )
      break if missing_project_storage_geos_batch.empty?

      import_result = ProjectStorage::Geo.import(
        missing_project_storage_geos_batch,
        validate: false,
        on_duplicate_key_ignore: true,
      )

      imported_count  += import_result.num_inserts
      processed_count += missing_project_storage_geos_batch.size

      last_processed_storage_id = missing_project_storage_geos_batch.map(&:storage_id).max
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
      imported_count:,
      last_processed_storage_id:,
      started_at:,
      finished_at:,
      duration: finished_at - started_at,
    )
  end

  private def unlocated_storages
    ActiveRecord::Base.connected_to(role: :reporting) do
      ProjectStorage.
        where(user_id: nil).
        # LEFT OUTER JOIN project_storage_geos geo ON geo.storage_id = user_project_storage_ids.id WHERE geo.id IS NULL
        where.missing(:geo).
        # WHERE EXISTS (SELECT projects.* FROM projects WHERE projects.storage_id = user_project_storage_ids.id)
        where(Project.where(Project.arel_table[:storage_id].eq(ProjectStorage.arel_table[:id])).arel.exists)
    end
  end

  private def missing_project_storage_geos(from_storage_id: 1, limit: BATCH_SIZE)
    ActiveRecord::Base.connected_to(role: :reporting) do
      unlocated_storage_ids_batch = unlocated_storages.where(id: from_storage_id..).order(:id).limit(limit).pluck(:id)
      return [] if unlocated_storage_ids_batch.empty?

      unlocated_storage_numbered_projects = Project.
        select(:id, :storage_id, :updated_ip).
        select('ROW_NUMBER() OVER (PARTITION BY storage_id ORDER BY id) AS per_storage_position').
        where(storage_id: unlocated_storage_ids_batch)

      Project.from(unlocated_storage_numbered_projects, Project.table_name).where(per_storage_position: 1).map do |project|
        location = Geocoder.find(project.updated_ip)

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
