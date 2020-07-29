#!/usr/bin/env ruby

require 'sequel'
require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'
require_relative './poste_urls_constants'

# This script is a dry-run unless we change DRY_RUN to false
DRY_RUN = true

if DRY_RUN
  puts "DRY RUN..."
else
  puts "Starting update..."
end

DB.transaction do
  # mark all poste_urls that are not in urls_to_keep as deleted_at = now
  # this will take a long time to run as it iterates over the entire poste_urls table
  urls_kept = []
  deleted_at_time = DateTime.now
  DB[:poste_urls].each do |poste_url|
    if !POSTE_URLS_TO_KEEP.include?(poste_url[:id])
      begin
        DB[:poste_urls].where(id: poste_url[:id]).update(deleted_at: deleted_at_time)
      rescue => e
        # continue on exception
        puts "Hit exception #{e.message} deprecating url with id #{poste_url[:id]}"
      end
    else
      urls_kept << poste_url[:url]
    end
  end

  if DRY_RUN
    puts "Dry Run complete! Would have kept #{urls_kept.count} urls:"
    puts urls_kept
    puts "Rolling back..."
    raise Sequel::Rollback
  else
    puts "Update complete! Kept #{urls_kept.count} urls"
  end
end
