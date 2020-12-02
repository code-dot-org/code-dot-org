#!/usr/bin/env ruby

require 'sequel'
require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'
require_relative './poste_urls_constants'

# mark all poste_urls that are not in urls_to_keep as deleted_at = now
# this will take a long time to run as it updates the entire poste_urls table

# Production database has a global max query execution timeout setting. This 5 minute setting can be used
# to override the timeout for a specific session or query.
MAX_EXECUTION_TIME_SEC = 300

# Connection to write to Pegasus production database.
PEGASUS_DB_WRITER = sequel_connect(
  CDO.pegasus_db_writer,
  CDO.pegasus_db_reader,
  query_timeout: MAX_EXECUTION_TIME_SEC
)

puts "Starting update..."

PEGASUS_DB_WRITER[:poste_urls].update(deleted_at: DateTime.now)

puts "Marked all urls as deleted..."

PEGASUS_DB_WRITER[:poste_urls].where(id: POSTE_URLS_TO_KEEP).update(deleted_at: nil)

puts "Un-deleted specific urls. Update complete!"
