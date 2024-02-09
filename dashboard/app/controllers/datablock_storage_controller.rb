class DatablockStorageController < ApplicationController
  # FIXME: implement validate_channel_id, see below
  before_action :validate_channel_id
  before_action :authenticate_user!

  # GET /datasets
  def index
    @project = Project.find_by_channel_id(params[:channel_id])
    @key_value_pairs = DatablockStorageKvp.where(channel_id: params[:channel_id])
    @records = DatablockStorageRecord.where(channel_id: params[:channel_id])
    @tables = DatablockStorageTable.where(channel_id: params[:channel_id])
    puts "####################################################"
  end

  def get_key_value
    kvp = DatablockStorageKvp.find_by(channel_id: params[:channel_id], key: params[:key])
    render json: kvp ? JSON.parse(kvp.value).to_json : nil
  end

  def set_key_value
    raise "value must be less than 4096 bytes" if params[:value].length > 4096
    value = JSON.parse params[:value]
    DatablockStorageKvp.set_kvp params[:channel_id], params[:key], value
    render json: {key: params[:key], value: value}
  end

  def create_record
    raise "record_json must be less than 4096 bytes" if params[:record_json].length > 4096
    record_json = JSON.parse params[:record_json]

    table = table_or_create
    table.create_records [record_json]
    table.save!

    render json: record_json
  end

  def read_records
    channel_id = params[:is_shared_table] == 'true' ? 'shared' : params[:channel_id]
    records = DatablockStorageRecord.where(channel_id: channel_id, table_name: params[:table_name])

    # FIXME: what should we return to indicate that table_name doesn't exist?
    #
    # This condition is detected, currently trying to do readRecords('tabledoesntexist', {}) results in:
    # ERROR: Line: 1: You tried to read records from a table called "nope" but that table doesn't exist in this app

    render json: records.map(&:record_json)
  end

  def update_record
    raise "record_json must be less than 4096 bytes" if params[:record_json].length > 4096

    table = find_table
    record_json = table.update_record params[:record_id], JSON.parse(params[:record_json])
    table.save!

    render json: record_json
  end

  def delete_record
    DatablockStorageRecord.where(channel_id: params[:channel_id], table_name: params[:table_name], record_id: params[:record_id]).delete_all
    render json: nil
  end

  #### METHODS USED BY THE DATASET BROWSER FOR LOADING/BROWSING DATA ####

  def get_table_names
    # SELECT DISTINCT table_name FROM datablock_storage_records WHERE channel_id='{params[:channel_id]}';
    render json: DatablockStorageRecord.where(channel_id: params[:channel_id]).select(:table_name).distinct.pluck(:table_name)
  end

  def get_key_values
    # SELECT key, value FROM datablock_storage_kvps WHERE channel_id='{params[:channel_id]}';
    kvps = DatablockStorageKvp.
      where(channel_id: params[:channel_id]).
      select(:key, :value).
      to_h {|kvp| [kvp.key, JSON.parse(kvp.value)]}

    render json: kvps
  end

  #### METHODS USED BY THE DATASET BROWSER FOR CREATING/MANIUPULATING DATA ####

  def create_table
    table_or_create

    render json: true
  end

  def delete_table
    where_table.delete_all
    DatablockStorageRecord.where(channel_id: params[:channel_id], table_name: params[:table_name]).delete_all

    render json: true
  end

  def clear_table
    table_name = params[:table_name]
    DatablockStorageRecord.where(channel_id: params[:channel_id], table_name: table_name).delete_all

    render json: true
  end

  def add_column
    table = find_table
    table.add_column params[:column_name]
    table.save!

    render json: true
  end

  def delete_column
    table = find_table
    table.delete_column params[:column_name]
    table.save!

    render json: true
  end

  def rename_column
    table = find_table
    table.rename_column params[:old_column_name], params[:new_column_name]
    table.save!

    render json: true
  end

  def coerce_column
    table = find_table
    table.coerce_column params[:column_name], params[:column_type]
    table.save!

    render json: true
  end

  def import_csv
    table = table_or_create
    table.import_csv params[:table_data_csv]
    table.save!

    render json: true
  end

  def delete_key_value
    key = params[:key]
    DatablockStorageKvp.where(channel_id: params[:channel_id], key: key).delete_all

    render json: true
  end

  def populate_tables
    tables_json = JSON.parse params[:tables_json]
    tables_json.each do |table_name, records|
      table = DatablockStorageTable.where(channel_id: params[:channel_id], table_name: table_name).first_or_create
      table.create_records records
    end
    render json: true
  end

  def populate_key_values
    key_values_json = JSON.parse params[:key_values_json]
    raise "key_values_json must be a hash" unless key_values_json.is_a? Hash
    DatablockStorageKvp.set_kvps(params[:channel_id], key_values_json)
    render json: true
  end

  def get_columns_for_table
    table = find_table
    render json: table.columns
  end

  # Returns true if validation checks pass
  def channel_exists
    render json: true
  end

  # deletes the entire channel in firebase
  # used only one place, applab.js config.afterClearPuzzle()
  def clear_all_data
    # FIXME: unfirebase, do we have an index on channel_id alone?
    DatablockStorageTable.where(channel_id: params[:channel_id]).delete_all
    # FIXME: unfirebase, do we have an index on channel_id alone?
    DatablockStorageKvp.where(channel_id: params[:channel_id]).delete_all
    # FIXME: unfirebase, do we have an index on channel_id alone?
    DatablockStorageRecord.where(channel_id: params[:channel_id]).delete_all

    render json: true
  end

  def add_shared_table
    DatablockStorageTable.add_shared_table params[:channel_id], params[:table_name]
  end

  private

  def find_table
    DatablockStorageTable.find([params[:channel_id], params[:table_name]])
  end

  def where_table
    DatablockStorageTable.where(channel_id: params[:channel_id], table_name: params[:table_name])
  end

  def table_or_create
    where_table.first_or_create
  end

  def validate_channel_id
    # FIXME: make sure that the channel_id refers to an applab or weblab project

    # This may be of interest:
    # begin
    #   _, project_id = storage_decrypt_channel_id(params[:channel_id]) if params[:channel_id]
    # rescue ArgumentError, OpenSSL::Cipher::CipherError
    #   # continue as normal, as we only use this value for stats.
    # end

    # For performance, we should probably validate this once, and then set a cookie
    # on the user session, similar to how authenticate_user works
  end
end
