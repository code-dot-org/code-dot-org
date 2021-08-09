#!/usr/bin/env ruby
require_relative '../../cron/only_one'
abort 'Script already running' unless only_one_running?(__FILE__)

require_relative '../../../lib/cdo/redshift'
require_relative '../../../dashboard/config/environment'

# Gets all unique string keys added to the i18n_string_tracking_events table
# over the last N days.
# @param day_count [Integer]
# @return [Array<String>]
def get_string_keys_from_tracking_events(day_count = 7)
  redshift_client = RedshiftClient.instance

  query = <<~SQL.squish
    SELECT DISTINCT string_key
    FROM analysis.i18n_string_tracking_events
    WHERE environment = 'production'
    AND created_at >= current_timestamp - interval '#{day_count} days'
  SQL

  redshift_client.exec(query).map {|row| row['string_key']}
end
