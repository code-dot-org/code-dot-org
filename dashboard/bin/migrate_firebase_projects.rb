#!/usr/bin/env ruby

require 'firebase'
require 'json'

require_relative '../config/environment'

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
  # tables.table, and tables.records
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

# Figure out how to set up env to be able to insert into the sql database

# For each item in response.current_tables, add a shared table to datablock with the same name if valid
