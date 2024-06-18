#!/usr/bin/env ruby

require 'firebase'
require 'json'

require_relative '../config/environment'

def transform_to_datablock_tables(channel)
  tables = channel.dig("metadata", "tables")
  tables_records = channel.dig("storage", "tables")
  project_id = 1  # need to decrypt the channel to get this

  datablock_tables = []

  tables.each do |table_name, table_data|
    columns = table_data["columns"].values.map {|col| col["columnName"]}
    records = tables_records.dig(table_name, "records").compact.map {|record| JSON.parse(record)}

    datablock_table = {
      project_id: project_id,
      table_name: table_name,
      columns: columns,
      is_shared_table: nil,
      created_at: Time.now,
      updated_at: Time.now
    }

    datablock_records = records.map.with_index(1) do |record, record_id|
      {
        project_id: project_id,
        table_name: table_name,
        record_id: record_id,
        record_json: record
      }
    end

    datablock_tables << {table: datablock_table, records: datablock_records}
  end

  datablock_tables
end

# Get Firebase secret from environment variable
firebase_secret = ENV['FIREBASE_SECRET']
unless firebase_secret
  puts "FIREBASE_SECRET environment variable is not set"
  exit
end

# Initialize Firebase client
base_uri = 'https://cdo-v3-prod.firebaseio.com/'
firebase = Firebase::Client.new(base_uri, firebase_secret)

# First pass, going to take a single channel and convert it json objects that match
# the datablock_storage models
response = firebase.get("/v3/channels/put_the_channel_id_here")

if response.success?
  channel = response.body

  tables = transform_to_datablock_tables(channel)
  puts tables

else
  puts "Failed to get channel: #{response.code} #{response.body}"
end
# Figure out how to set up env to be able to insert into the sql database

# For each item in response.current_tables, add a shared table to datablock with the same name if valid