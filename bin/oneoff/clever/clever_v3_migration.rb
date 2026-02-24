#!/usr/bin/env ruby

require 'csv'

# This script creates Clever v3 AuthenticationOptions for existing teachers
# using their Clever v3 user IDs mapped from their legacy Clever v2 IDs provided
# in a Clever-generated CSV. The CSV must include both `legacy_id` and the
# corresponding `v3_user_id`. Only users with existing Clever v2
# AuthenticationOptions will be processed.
# Usage:
#   ./bin/oneoff/clever/clever_v3_migration.rb [dry-run|commit]
#
# If "commit" is provided as an argument, the script will perform the migration.
# Otherwise, it will run in dry-run mode and report what changes would be made.

do_dry_run = true
if ARGV[0] == "commit"
  do_dry_run = false
end

require_relative '../../../dashboard/config/environment'

csv_file_path = File.join(File.dirname(__FILE__), 'clever_v2_to_v3_ids.csv')
begin
  csv_data = CSV.read(csv_file_path, headers: true, col_sep: ",")
rescue
  puts "Problem reading given CSV file at #{csv_file_path}."
  exit 1
end

puts "Starting Clever v3 migration. Dry run mode: #{do_dry_run}"
migrated_count = 0
csv_data.each do |row|
  legacy_id = row['role_id']
  v3_user_id = row['user_id']
  next if legacy_id.nil? || v3_user_id.nil?
  auth_option = Services::Clever::V3AuthOptionBuilder.call(
    clever_v2_id: legacy_id,
    clever_v3_id: v3_user_id
  )
  if auth_option
    auth_option.save! unless do_dry_run
    migrated_count += 1
  end
end
puts "Total v3 AuthenticationOptions created: #{migrated_count}"
puts "Clever v3 migration completed. Dry run mode: #{do_dry_run}"
