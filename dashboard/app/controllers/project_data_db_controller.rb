class ProjectDataDbController < ApplicationController
  # GET /datasets
  def index
    @project = Project.find_by_channel_id(params[:channel_id])
    @key_value_pairs = KeyValuePair.where(channel_id: params[:channel_id])
    @records = Record.where(channel_id: params[:channel_id])
    puts "####################################################"
  end

  def get_key_value
    render json: KeyValuePair.find(channel_id: params[:channel_id], key: params[:key])
  rescue
    # If the key doesn't exist, return value: null
    render json: {channel_id: params[:channel_id], key: params[:key], value: nil}
  end

  def set_key_value
    value = JSON.parse params[:value]

    if value.nil?
      # Setting a key to null deletes it
      KeyValuePair.delete_all(channel_id: params[:channel_id], key: params[:key])
    else
      # This should generate a single MySQL insert statement using the `ON DUPLICATE KEY UPDATE`
      # syntax. Should be faster than a find round-trip followed by an update or insert.
      # But we should check the SQL output to make sure its what we expect, since this is
      # mainly designed Rails-wise as a bulk insert method.
      KeyValuePair.upsert_all(
        [
          {channel_id: params[:channel_id], key: params[:key], value: value}
        ]
      )
    end

    # kvp = KeyValuePair.create(channel_id: params[:channel_id], key: params[:key], value: params[:value])
    # render :json => kvp.as_json

    render json: {key: params[:key], value: params[:value]}
  end

  def create_record
  end

  def read_records
    records = Record.where(channel_id: params[:channel_id], table_name: params[:table_name])

    # FIXME: what should we return to indicate that table_name doesn't exist?
    #
    # This condition is detected, currently trying to do readRecords('tabledoesntexist', {}) results in:
    # ERROR: Line: 1: You tried to read records from a table called "nope" but that table doesn't exist in this app

    render json: records
  end

  def update_record
    record = Record.find_by(channel_id: params[:channel_id], table_name: params[:table_name], record_id: params[:record_id])
    if record
      record.json = JSON.parse params[:json]
      record.save!
      render json: record
    else
      render json: null
    end
  end

  def delete_record
    Record.where(channel_id: params[:channel_id], table_name: params[:table_name], record_id: params[:record_id]).delete_all
  end
end
