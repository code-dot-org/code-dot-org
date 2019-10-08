#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'

# Script to backfill workshops, that were migrated from Workshop to Pd::Workshop,
# with their start & stop dates, to prevent them from showing up in dashboards
# because their states appear to be STATE_NOT_STARTED.

ActiveRecord::Base.transaction do
  cutoff_date = Date.new(2019, 2, 28)
  total_problems = 0
  total_updated = 0
  total_skipped = 0

  oldest_updated = Date.today
  newest_updated = Date.new(1944, 12, 12)

  Pd::Workshop.where(started_at: nil, ended_at: nil).each do |w|
    starting_date = w.workshop_starting_date
    ending_date = w.workshop_ending_date

    if starting_date.nil? || ending_date.nil?
      puts "Workshop #{w.id} had problem with starting/ending dates."
      total_problems += 1
    elsif starting_date < cutoff_date
      puts "Update workshop #{w.id} gets new dates of #{starting_date} - #{ending_date}"

      w.started_at = starting_date
      w.ended_at = ending_date
      w.save!

      total_updated += 1

      oldest_updated = starting_date if starting_date < oldest_updated
      newest_updated = starting_date if starting_date > newest_updated
    else
      total_skipped += 1
    end
  end

  puts "Total updated: #{total_updated}.  Total skipped: #{total_skipped}.  Total problems: #{total_problems}"
  puts "Oldest updated: #{oldest_updated}.  Newest updated: #{newest_updated}."

  # This script is a dry-run unless we comment out this last line
  raise ActiveRecord::Rollback.new, "Intentional rollback"
end
