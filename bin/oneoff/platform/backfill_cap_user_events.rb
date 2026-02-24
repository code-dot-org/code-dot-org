#!/usr/bin/env ruby

# This will write Cap::UserEvent records that happen before the first known
# one to backfill a lack of event recordkeeping.

# You should run beforehand to create the TSV:
# echo 'select id,JSON_EXTRACT(properties, "$.child_account_compliance_lock_out_date") from users where JSON_EXTRACT(properties, "$.child_account_compliance_lock_out_date") is not null;' \
#   | ./bin/mysql-client-dashboard-reporting > lockout_dates.tsv
unless File.exist?('lockout_dates.tsv')
  puts 'You need to generate lockout_dates.tsv.'
  puts 'Refer to the script itself in the first comment for the command'
  puts 'to run to pull the lockout dates out of the database.'
  exit 1
end

require_relative '../../../deployment'
require_relative '../../../lib/cdo/shared_constants'
require 'cdo/db'
require 'json'

# We cannot require the model easily, so we just repeat the event names
# that are found in dashboard/app/models/cap/user_event.rb
POLICY = 'CPA'

NAMES = [
  # Logged when a student requests parental permission for the first time.
  PARENT_EMAIL_SUBMIT = 'parent_email_submit'.freeze,
  # Logged when a student makes subsequent requests for parental permission.
  PARENT_EMAIL_UPDATE = 'parent_email_update'.freeze,
  # Logged when a student's compliance state is changed to "granted".
  PERMISSION_GRANTING = 'permission_granting'.freeze,
  # When a student enters the 'grace period', which is nobody prior to the events getting logged.
  GRACE_PERIOD_START = 'grace_period_start'.freeze,
  # Logged when a student's compliance state is changed to "locked".
  ACCOUNT_LOCKING = 'account_locking'.freeze,
  # Logged when a student's account is purged due to non-compliance with the CAP for more than 7 days.
  ACCOUNT_PURGING = 'account_purging'.freeze,
].freeze

# We will generate a list of possible records to make
records = []

# Open the normal database read-only
DASHBOARD_DB_READER = Cdo::Sequel.database_connection_pool CDO.dashboard_db_reader, CDO.dashboard_db_reader

# Get the starting date
# This will be finding anything that happened before the earliest recorded event
start_date = DASHBOARD_DB_READER[:cap_user_events].first&.[](:created_at) || DateTime.now
puts "Recording inferred events happening prior to: #{start_date}"
puts

# Get a listing of affected users
possible = DASHBOARD_DB_READER[:users].where(created_at: (..start_date))
affected = possible

parental_permissions = DASHBOARD_DB_READER[:parental_permission_requests].where(user_id: affected.select(:id)).order(Sequel.asc(:created_at))

# Add a CAP User Event for each of these
parental_permissions.each do |ppr|
  # New parental email
  # We no longer track this event in the table
  #records << {
  #  created_at: ppr[:created_at].iso8601,
  #  updated_at: ppr[:created_at].iso8601,
  #  policy: POLICY,
  #  name: PARENT_EMAIL_SUBMIT,
  #  user_id: ppr[:user_id],
  #  state_before: 'l',
  #  state_after: 's',
  #}
  #records = records[...-1] if DASHBOARD_DB_READER[:cap_user_events].where(policy: records[-1][:policy], name: records[-1][:name], user_id: records[-1][:user_id]).count > 0

  # Check to see if it has recorded a number of resends
  # We no longer track this event in this table
  #if ppr[:resends_sent] > 0
  #  # Updated parental email at least once... we lose the interim ones
  #  records << {
  #    created_at: ppr[:updated_at].iso8601,
  #    updated_at: ppr[:updated_at].iso8601,
  #    policy: POLICY,
  #    name: PARENT_EMAIL_UPDATE,
  #    user_id: ppr[:user_id],
  #    state_before: 's',
  #    state_after: 's',
  #  }
  #  records = records[...-1] if DASHBOARD_DB_READER[:cap_user_events].where(policy: records[-1][:policy], name: records[-1][:name], user_id: records[-1][:user_id]).count > 0
  #end

  # Now, look to see that they have the granted compliance state
  user = DASHBOARD_DB_READER[:users].where(id: ppr[:user_id]).first
  user_properties = JSON.parse(user[:properties])
  next unless user_properties['child_account_compliance_state'] == SharedConstants::CHILD_ACCOUNT_COMPLIANCE_STATES.PERMISSION_GRANTED
  records << {
    created_at: DateTime.parse(user_properties['child_account_compliance_state_last_updated']).iso8601,
    updated_at: DateTime.parse(user_properties['child_account_compliance_state_last_updated']).iso8601,
    policy: POLICY,
    name: PERMISSION_GRANTING,
    user_id: ppr[:user_id],
    state_before: 'l',
    state_after: 'g',
  }
  records = records[...-1] if DASHBOARD_DB_READER[:cap_user_events].where(policy: records[-1][:policy], name: records[-1][:name], user_id: records[-1][:user_id]).count > 0
end

# Now go through the lockout records
# These are exhaustive since there's no great way to find them if they have
# not participated in the lockout flow
if File.exist?('lockout_dates.tsv')
  File.open('lockout_dates.tsv').each do |line|
    # Remove newline and other whitespace
    line = line.strip
    # Skip the dashboard script output and anything that's not an outpul of mysql
    next unless line.include?("\t")
    # Skip the header
    next if line.include?("JSON")
    # Get the tuple
    user_id, lockout_date = line.split("\t").map {|value| JSON.parse(value)}

    # Write out a record for it
    records << {
      created_at: lockout_date,
      updated_at: lockout_date,
      policy: POLICY,
      name: ACCOUNT_LOCKING,
      user_id: user_id,
      state_before: nil,
      state_after: 'l',
    }
    records = records[...-1] if DASHBOARD_DB_READER[:cap_user_events].where(policy: records[-1][:policy], name: records[-1][:name], user_id: records[-1][:user_id]).count > 0
  end
end

# Print out the number of event records
puts "Discovered #{records.length} new event records."

KEYS = [:created_at, :updated_at].freeze

output = 'cpa-backfill-records-written.json'
if ARGV[0] == '1'
  puts
  puts "Writing"

  records.each do |data|
    KEYS.each do |key|
      data[key] = DateTime.parse(data[key])
    end
    DASHBOARD_DB[:cap_user_events] << data
  end

  puts
  puts "Writing '#{output}' with the records we wrote."
  puts "  Refer and verify this file afterward and compare with the one from the original run."
else
  output = 'cpa-backfill-records.json'
  puts
  puts "Writing '#{output}' with the records we intend to write."
  puts "  Refer and verify this file and then re-run the script and append '1' as an argument to commit these records."
end

# Write out the record information we intend to write
File.open(output, 'w+') do |f|
  records.each do |data|
    f.write(JSON.pretty_generate(data))
  end
end
