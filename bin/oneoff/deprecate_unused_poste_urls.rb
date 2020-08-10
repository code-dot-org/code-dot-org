#!/usr/bin/env ruby

require 'sequel'
require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'
require_relative './poste_urls_constants'

# mark all poste_urls that are not in urls_to_keep as deleted_at = now
# this will take a long time to run as it updates the entire poste_urls table
puts "Starting update..."

DB[:poste_urls].update(deleted_at: DateTime.now)

puts "Marked all urls as deleted..."

DB[:poste_urls].where(id: POSTE_URLS_TO_KEEP).update(deleted_at: nil)

puts "Un-deleted specific urls. Update complete!"
