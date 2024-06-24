#!/usr/bin/env ruby

require 'firebase'
require 'json'

require_relative '../config/environment'

def get_project_id(channel_id)
  storage_decrypt_channel_id(channel_id)[1]
end

def transform_to_datablock_tables(channel, channel_id)
  tables = channel.dig("metadata", "tables")
  tables_records = channel.dig("storage", "tables")
  project_id = get_project_id(channel_id)

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
  #channel
  tables = transform_to_datablock_tables(channel, channel_id)
  tables
end

# Figure out how to set up env to be able to insert into the sql database

# For each item in response.current_tables, add a shared table to datablock with the same name if valid
