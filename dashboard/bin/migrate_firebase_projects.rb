#!/usr/bin/env ruby

require 'firebase'
require 'json'

require_relative '../config/environment'

def set_active_record_connection_pool_size(pool_size)
  ActiveRecord::Base.connection_pool.disconnect!
  ActiveRecord::Base.establish_connection(
    ActiveRecord::Base.configurations[Rails.env].merge('pool' => pool_size)
  )
end

set_active_record_connection_pool_size(10)

# Don't use more workers than we have connections in our SQL connection pool.
# NUM_PARALLEL_WORKERS = 1
NUM_PARALLEL_WORKERS = ActiveRecord::Base.connection_pool.size

def get_project_id(channel_id)
  storage_decrypt_channel_id(channel_id)[1]
end

def fetch_datablock_tables(channel, project_id)
  datablock_tables = []
  tables = channel.dig("metadata", "tables") || {}
  tables.each do |table_name, table_data|
    columns = table_data["columns"].values.map {|col| col["columnName"]}
    json_records = channel.dig("storage", "tables", table_name, "records") || []

    if json_records.is_a? Hash
      # Most storage.tables.TABLE_NAME.records are arrays [record_json,...], but some of
      # them are stored as objects/hashes instead ({record_id => record_json, ...}).
      json_records = json_records.values
    end

    records = json_records.compact.map {|record| JSON.parse(record)}

    datablock_table = {
      project_id: project_id,
      table_name: table_name,
      columns: columns,
      is_shared_table: nil,
      created_at: Time.now,
      updated_at: Time.now
    }

    datablock_records = records.map do |record|
      {
        project_id: project_id,
        table_name: table_name,
        record_id: record["id"],
        record_json: record
      }
    end

    datablock_tables << {table: datablock_table, records: datablock_records}
  end

  datablock_tables
end

def fetch_datablock_kvps(channel, project_id)
  kvps = channel.dig("storage", "keys") || []
  kvps.map do |key, value|
    {
      project_id: project_id,
      key: key,
      value: JSON.parse(value)
    }
  end
end

def insert_datablock_tables(tables)
  tables.each do |table|
    DatablockStorageTable.create!(table[:table])
    DatablockStorageRecord.insert_all!(table[:records]) unless table[:records].empty?
  end
end

def insert_datablock_kvps(kvps)
  kvps.each do |kvp|
    DatablockStorageKvp.create!(kvp)
  end
end

def firebase_get(path)
  base_uri = "https://#{CDO.firebase_name}.firebaseio.com/"
  firebase_secret = ENV['FIREBASE_SECRET'] || CDO.firebase_secret
  raise "FIREBASE_SECRET not defined" unless firebase_secret
  firebase = Firebase::Client.new base_uri, firebase_secret
  response = firebase.get(path)
  raise "Error fetching #{path} from Firebase: #{response.code}" unless response.success?
  response.body
end

def firebase_get_channel(channel_id)
  firebase_get("/v3/channels/#{channel_id}")
end

def migrate(channel_id)
  channel = firebase_get_channel(channel_id)
  project_id = get_project_id(channel_id)
  tables = fetch_datablock_tables(channel, project_id)
  kvps = fetch_datablock_kvps(channel, project_id)
  ActiveRecord::Base.transaction do
    insert_datablock_tables(tables)
    insert_datablock_kvps(kvps)
  end
end

def success_filename(log_filename_prefix)
  "#{log_filename_prefix}.success"
end

def fail_filename(log_filename_prefix)
  "#{log_filename_prefix}.fail"
end

METRICS_LOGGING_INTERVAL_S = 60
class MetricsTracker
  def initialize(total_count = 0, failed_count = 0, succeeded_count = 0)
    @start_time = Time.now
    @last_time = @start_time

    @succeeded_count = 0
    @failed_count = 0

    @total_count = total_count
    @total_failed_count = failed_count
    @total_succeeded_count = succeeded_count

    # First logging interval is shorter than METRICS_LOGGING_INTERVAL_S
    # to give immediate feedback on rate
    @logging_interval_s = 5

    if failed_count || succeeded_count
      puts "Resuming from previous run: #{win_lose_string}"
    end
  end

  def failed
    @failed_count += 1
    print "❌"
  end

  def succeeded
    @succeeded_count += 1
    print "🟢"
  end

  def percent_complete
    total_processed = @total_succeeded_count + @total_failed_count
    percent = (total_processed.to_f / @total_count) * 100
    format("%.2f", percent) + "%"
  end

  def win_lose_string
    "#{@total_succeeded_count} succeeded, #{@total_failed_count} failed, #{percent_complete} complete"
  end

  def print_metrics
    now = Time.now
    elapsed = now - @last_time
    # if its been more than N seconds, we print metrics...
    if elapsed > @logging_interval_s
      @logging_interval_s = METRICS_LOGGING_INTERVAL_S
      processed = @succeeded_count + @failed_count
      processing_rate = processed / elapsed

      @total_succeeded_count += @succeeded_count
      @total_failed_count += @failed_count
      total_processed = @total_succeeded_count + @total_failed_count

      seconds_remaining = (@total_count - total_processed) / processing_rate
      days_remaining = format('%.2f', seconds_remaining / 86400)

      puts
      puts "migrated #{total_processed} of #{@total_count}, #{format('%.1f', processing_rate)} channels/s, ~#{days_remaining} days remaining, #{win_lose_string}"
      puts

      # Reset metrics for next sampling period
      @succeeded_count = 0
      @failed_count = 0
      @last_time = now
    end
  end
end

def stream_results_to_logs(log_filename_prefix, pool, results, count, failed_count, succeeded_count)
  succeeded_log = File.open(success_filename(log_filename_prefix), 'a+')
  succeeded_log.sync = true

  failed_log = File.open(fail_filename(log_filename_prefix), 'a+')
  failed_log.sync = true

  exception_log = File.open("#{log_filename_prefix}.exceptions", 'a+')
  exception_log.sync = true

  metrics_tracker = MetricsTracker.new(count, failed_count, succeeded_count)

  log_results = -> do
    loop do
      channel_id, success, exception = results.pop(non_block: true)

      if success
        metrics_tracker.succeeded
        succeeded_log.puts(channel_id)
      else
        metrics_tracker.failed
        failed_log.puts(channel_id)
        exception_log.puts("Exception migrating #{channel_id}")
        exception_log.puts("#{exception.class}: #{exception.message}")
        exception_log.puts(exception.backtrace)
        exception_log.puts
      end
    end
  rescue ThreadError
    # queue.pop(non_block: true) raises ThreadError if the queue is empty
  end

  until pool.shutdown?
    log_results.call
    metrics_tracker.print_metrics
    sleep 0.1
  end
  puts "pool shutdown, draining results queue"
  log_results.call
ensure
  succeeded_log.close
  failed_log.close
  exception_log.close
end

def migrate_all(channel_ids, log_filename_prefix: "firebase-channel-ids.txt", count: 0, failed_count: 0, succeeded_count: 0)
  puts "Running with #{NUM_PARALLEL_WORKERS} parallel workers"

  pool = Concurrent::FixedThreadPool.new(NUM_PARALLEL_WORKERS)

  results = Queue.new

  puts "Building task queue..."
  channel_ids.each do |channel_id|
    pool.post do
      migrate(channel_id)
      results.push [channel_id, true]
    rescue => exception
      results.push [channel_id, false, exception]
    end
  end
  puts "done building task queue, starting migration"
  puts

  pool.shutdown
  stream_results_to_logs(log_filename_prefix, pool, results, count, failed_count, succeeded_count)
  pool.wait_for_termination
ensure
  # This is particularly useful because ctrl-c from within irb
  # doesn't kill the thread pool, which makes repl-driven dev hard.
  unless pool.shutdown?
    puts "migrate_all() interrupted, killing thread pool"
    pool.shutdown
    pool.kill
    pool.wait_for_termination
  end
end

def load_channel_ids(filename)
  Set.new(File.readlines(filename).map(&:strip))
rescue Errno::ENOENT
  puts "Warning: couldn't read #{filename}"
  Set.new
end

def migrate_from_file(filename)
  puts "Migrating channel_ids from #{filename}"
  channel_ids = load_channel_ids(filename)
  failed_channel_ids = load_channel_ids(fail_filename(filename))
  succeeded_channel_ids = load_channel_ids(success_filename(filename))

  puts "Num Total channel_ids: #{channel_ids.length}"
  puts "Num Failed channel_ids: #{failed_channel_ids.length}"
  puts "Num Succeeded channel_ids: #{succeeded_channel_ids.length}"
  puts

  count = channel_ids.length
  failed_count = failed_channel_ids.length
  succeeded_count = succeeded_channel_ids.length

  channel_ids -= failed_channel_ids
  channel_ids -= succeeded_channel_ids

  puts "Num channel_ids left to process: #{channel_ids.length}"
  migrate_all(channel_ids, log_filename_prefix: filename, count: count, failed_count: failed_count, succeeded_count: succeeded_count)
end

if $PROGRAM_NAME == __FILE__
  id_filename = ARGV[0] || 'firebase-channel-ids.txt'
  migrate_from_file(id_filename)
end
