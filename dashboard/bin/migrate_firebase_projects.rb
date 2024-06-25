#!/usr/bin/env ruby

require 'firebase'
require 'json'

require_relative '../config/environment'

NUM_PARALLEL_WORKERS = 1

def get_project_id(channel_id)
  storage_decrypt_channel_id(channel_id)[1]
end

def fetch_datablock_tables(channel, project_id)
  tables = channel.dig("metadata", "tables")
  tables_records = channel.dig("storage", "tables")

  datablock_tables = []

  tables.each do |table_name, table_data|
    columns = table_data["columns"].values.map {|col| col["columnName"]}
    json_records = tables_records.dig(table_name, "records")
    records = json_records ? json_records.compact.map {|record| JSON.parse(record)} : []

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
  kvps = channel.dig("storage", "keys")
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

def stream_results_to_logs(log_filename_prefix, pool, results)
  succeeded_log = File.open(success_filename(log_filename_prefix), 'a+')
  failed_log = File.open(fail_filename(log_filename_prefix), 'a+')
  exception_log = File.open("#{log_filename_prefix}.exceptions", 'a+')

  log_results = -> do
    loop do
      channel_id, success, exception = results.pop(non_block: true)

      if success
        succeeded_log.puts(channel_id)
      else
        failed_log.puts(channel_id)
        exception_log.puts("Exception migrating #{channel_id}")
        exception_log.puts(exception.message)
        exception_log.puts(exception.backtrace)
        exception_log.puts
      end
    end
  rescue ThreadError
    # queue.pop(non_block: true) raises ThreadError if the queue is empty
  end

  until pool.shutdown?
    log_results.call
    sleep 0.1
  end
  puts "pool shutdown, draining results queue"
  log_results.call
ensure
  succeeded_log.close
  failed_log.close
  exception_log.close
end

def migrate_all(channel_ids, log_filename_prefix = "firebase-channel-ids.txt")
  pool = Concurrent::FixedThreadPool.new(NUM_PARALLEL_WORKERS)

  results = Queue.new

  channel_ids.each do |channel_id|
    pool.post do
      migrate(channel_id)
      puts "SUCCESS: #{channel_id}"
      results.push [channel_id, true]
    rescue => exception
      puts "FAILURE: #{channel_id}"
      results.push [channel_id, false, exception]
    end
  end

  pool.shutdown
  stream_results_to_logs(log_filename_prefix, pool, results)
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

  channel_ids -= failed_channel_ids
  channel_ids -= succeeded_channel_ids

  puts "Num channel_ids left to process: #{channel_ids.length}"
  migrate_all(channel_ids)
end

if $PROGRAM_NAME == __FILE__
  id_filename = ARGV[0] || 'firebase-channel-ids.txt'
  migrate_from_file(id_filename)
end
