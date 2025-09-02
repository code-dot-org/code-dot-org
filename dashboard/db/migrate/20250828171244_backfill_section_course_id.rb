class BackfillSectionCourseId < ActiveRecord::Migration[6.1]
  BATCH_SIZE = 100
  INFO_INTERVAL = 1_000
  def up
    return if Rails.env.production? || Rails.env.test?

    CDO.log = Logger.new($stdout)
    ActiveRecord::Base.record_timestamps = false

    sections_processed = 0
    sections_not_processed = 0

    Section.with_deleted.where(course_id: nil).where.not(script_id: nil).find_each(batch_size: BATCH_SIZE) do |section|
      # Be kind to the database by limiting to 1000 sections processed per second
      sleep 0.001

      ActiveRecord::Base.transaction do
        CDO.log.info "Processing section #{section.id}" if section.id % INFO_INTERVAL == 0

        # Find the script associated with the section and add the course_id
        unit = Unit.find_by(id: section.script_id)
        if unit&.original_unit_group_id
          section.update_columns(course_id: unit.original_unit_group_id)
        else
          # unassign if the section's script_id does not correspond to a valid unit or course
          section.update_columns(script_id: nil)
        end

        sections_processed += 1
      end
    rescue => exception
      CDO.log.error "Could not process section #{section.id}"
      CDO.log.error exception
      sections_not_processed += 1
    end

    CDO.log.info "backfill completed"
    CDO.log.info "#{sections_processed} sections were processed, #{sections_not_processed} experienced errors"
  end
end
