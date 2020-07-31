#!/usr/bin/env ruby

require 'sequel'
require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'
require_relative './poste_urls_constants'

puts "Starting update..."
# mark all poste_urls that are not in urls_to_keep as deleted_at = now
# this will take a long time to run as it iterates over the entire poste_urls table
urls_kept_count = 0
deleted_at_time = DateTime.now

DB[:poste_urls].each do |poste_url|
  if !POSTE_URLS_TO_KEEP.include?(poste_url[:id])
    begin
      DB[:poste_urls].where(id: poste_url[:id]).update(deleted_at: deleted_at_time)
    rescue => e
      # Continue on exception. We can go back and fix errors later, we don't need to update everything in one shot.
      puts "Hit exception #{e.message} deprecating url with id #{poste_url[:id]}"
    end
  else
    urls_kept_count += 1
  end
end

puts "Update complete! Did not deprecate #{urls_kept_count} urls."
