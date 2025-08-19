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

sections_processed = 0
sections_not_processed = 0

Section.with_deleted.where(course_id: nil).where.not(script_id: nil).each do |section|
  ActiveRecord::Base.transaction do
    CDO.log.info "Processing section #{section.id}"

    # Find the script associated with the section and add the course_id
    unit = Unit.find_by(id: section.script_id)
    section.update!(course_id: unit.original_unit_group_id) if unit

    sections_processed += 1

    raise ActiveRecord::Rollback unless options[:actually_update]
  rescue ActiveRecord::Rollback
    # Ignore these during the dry runs
  rescue => exception
    CDO.log.error "Could not process section #{section.id}"
    CDO.log.error exception
    sections_not_processed += 1
  end
end

CDO.log.info "Script completed"
CDO.log.info "#{sections_processed} sections were processed, #{sections_not_processed} experienced errors"
