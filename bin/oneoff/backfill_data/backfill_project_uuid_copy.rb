#!/usr/bin/env ruby
# Backfill projects.uuid (VARCHAR) using SecureRandom.uuid on MySQL 8.
# Usage: backfill_uuid_mysql.rb [-u] [--start-with=ID] [--end-with=ID] [--batch=100000] [--slice=1000] [--rps=2000]

require_relative '../../../dashboard/config/environment'
require 'optparse'
require 'benchmark'
require 'securerandom'

CDO.log = Logger.new($stdout)
ActiveRecord::Base.record_timestamps = false
ActiveRecord::Base.connection.disable_query_cache!

opts = {
  actually_update: false,
  start_with: 1,
  end_with: nil,
  batch: 100_000,   # IDs per range step (controls WHERE id BETWEEN ...)
  slice: 1_000,     # IDs per single UPDATE (size of CASE ... WHEN list)
  target_rps: 2_000, # rows/sec target; throttle between batches
  info_every: 10    # log every N range batches
}

OptionParser.new do |o|
  o.on('-u', '--actually-update', 'Perform the update (default: dry-run)') {opts[:actually_update] = true}
  o.on('-s N', '--start-with=N', Integer, 'Start project id (inclusive)')   {|v| opts[:start_with] = v}
  o.on('-e N', '--end-with=N', Integer, 'End project id (inclusive)')       {|v| opts[:end_with] = v}
  o.on('-b N', '--batch=N', Integer, 'IDs per range batch (default 100k)')  {|v| opts[:batch] = v}
  o.on('-x N', '--slice=N', Integer, 'IDs per UPDATE (default 1000)')       {|v| opts[:slice] = v}
  o.on('-r N', '--rps=N', Integer, 'Target rows/sec (default 2000)')        {|v| opts[:target_rps] = v}
  o.on('-h', '--help') {puts o; exit}
end.parse!

conn = ActiveRecord::Base.connection
abort("This script expects MySQL") unless conn.adapter_name.downcase.include?("mysql")

# Resolve ID range
min_id, max_id = Project.pluck(Arel.sql('MIN(id), MAX(id)')).first
start_id = [opts[:start_with], min_id].max
end_id   = opts[:end_with] ? [opts[:end_with], max_id].min : max_id

total_missing = Project.where(uuid: nil).count
CDO.log.info "Starting backfill: range=#{start_id}-#{end_id} missing=#{total_missing} " \
               "batch=#{opts[:batch]} slice=#{opts[:slice]} target_rps=#{opts[:target_rps]} " \
               "actually_update=#{opts[:actually_update]}"

def build_case_update_sql(table:, col:, id_col:, pairs:)
  # pairs: [[id, uuid_str], ...]
  whens = pairs.map {|id, uuid| "WHEN #{Integer(id)} THEN '#{uuid}'"}.join("\n")
  ids   = pairs.map {|id, _| Integer(id)}.join(",")
  <<~SQL
    UPDATE #{table}
    SET #{col} = CASE #{id_col}
      #{whens}
    END
    WHERE #{id_col} IN (#{ids}) AND #{col} IS NULL
  SQL
end

filled = 0
batches = 0
t0 = Time.now
current = start_id

while current <= end_id
  hi = [current + opts[:batch] - 1, end_id].min

  # Pull just the ids that still need uuid in this ID window
  ids = Project.where(id: current..hi, uuid: nil).pluck(:id)

  updated_in_range = 0
  elapsed_range = Benchmark.realtime do
    if opts[:actually_update]
      ids.each_slice(opts[:slice]) do |slice_ids|
        pairs = slice_ids.map {|pid| [pid, SecureRandom.uuid]}
        sql = build_case_update_sql(table: "projects", col: "uuid", id_col: "id", pairs: pairs)
        updated_in_range += conn.update(sql)
      end
    else
      updated_in_range = ids.size # dry-run estimate
    end
  end

  filled += updated_in_range
  batches += 1

  # Throttle to target rows/sec (sleep between range batches)
  target_seconds = updated_in_range.to_f / [opts[:target_rps], 1].max
  sleep_time = [target_seconds - elapsed_range, 0].max
  sleep(sleep_time) if sleep_time > 0

  if (batches % opts[:info_every]).zero?
    elapsed_total = Time.now - t0
    rps = filled.zero? ? 0.0 : (filled / elapsed_total)
    remaining = [total_missing - filled, 0].max
    eta_hours = rps > 0 ? (remaining / rps / 3600.0) : Float::INFINITY
    CDO.log.info "batch##{batches} ids[#{current}-#{hi}] " \
                   "updated=#{updated_in_range} " \
                   "filled=#{filled}/#{total_missing} " \
                   "(#{(filled * 100.0 / [total_missing, 1].max).round(2)}%) " \
                   "rps≈#{rps.round(1)} ETA≈#{eta_hours.round(1)}h"
  end

  current = hi + 1
end

elapsed_total = Time.now - t0
final_rps = filled.zero? ? 0.0 : (filled / elapsed_total)
CDO.log.info "DONE filled=#{filled}/#{total_missing} " \
               "elapsed=#{elapsed_total.round(1)}s rps≈#{final_rps.round(1)}"
