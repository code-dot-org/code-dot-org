#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'

# This script backfills the section table to add course_ids to old sections that have a script but no course.

CDO.log = Logger.new($stdout)
ActiveRecord::Base.record_timestamps = false

options = {actually_update: false, start_with: 1}
OptionParser.new do |opts|
  opts.banner = "Usage: #{File.basename(__FILE__)} [options]"
  opts.on('-u', '--actually-update', 'Actually perform the update.') do
    options[:actually_update] = true
  end
  opts.on('-sSTART', '--start-with=START', Integer, 'Start with section ID START.') do |s|
    options[:start_with] = s
  end
  opts.on('-h', '--help', 'Add -u to perform the update.') do
    puts opts
    exit
  end
end.parse!
CDO.log.info "Called with options: #{options}"

BATCH_SIZE = 100
INFO_INTERVAL = 1_000

sections_processed = 0
sections_not_processed = 0

Section.with_deleted.where(course_id: nil).where.not(script_id: nil).find_each(batch_size: BATCH_SIZE, start: options[:start_with]) do |section|
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

    raise ActiveRecord::Rollback unless options[:actually_update]
  end
rescue => exception
  CDO.log.error "Could not process section #{section.id}"
  CDO.log.error exception
  sections_not_processed += 1
end

CDO.log.info "Script completed"
CDO.log.info "#{sections_processed} sections were processed, #{sections_not_processed} experienced errors"
