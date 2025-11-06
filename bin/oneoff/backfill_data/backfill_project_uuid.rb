#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'

# This script backfills the projects table to add uuids to old projects.

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

projects_processed = 0
projects_not_processed = 0

Project.where(uuid: nil).find_each(batch_size: BATCH_SIZE, start: options[:start_with]) do |project|
  # Be kind to the database by limiting to 1000 sections processed per second
  sleep 0.001

  ActiveRecord::Base.transaction do
    CDO.log.info "Processing project #{project.id}" if project.id % INFO_INTERVAL == 0

    project.update(uuid: SecureRandom.uuid)
    projects_processed += 1

    raise ActiveRecord::Rollback unless options[:actually_update]
  end
rescue => exception
  CDO.log.error "Could not process project #{project.id}"
  CDO.log.error exception
  projects_not_processed += 1
end

CDO.log.info "Script completed"
CDO.log.info "#{projects_processed} sections were processed, #{projects_not_processed} experienced errors"
