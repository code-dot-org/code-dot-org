class DatablockStorageController < ApplicationController
  # FIXME: implement validate_channel_id, see below
  before_action :validate_channel_id
  before_action :authenticate_user!

  ##########################################################
  #   Debug View                                           #
  ##########################################################
  def index
    @project = Project.find_by_channel_id(params[:channel_id])
    @key_value_pairs = DatablockStorageKvp.where(channel_id: params[:channel_id])
    @records = DatablockStorageRecord.where(channel_id: params[:channel_id])
    @tables = DatablockStorageTable.where(channel_id: params[:channel_id])
    puts "####################################################"
  end

  ##########################################################
  #   Key-Value-Pair API                                   #
  ##########################################################

  def set_key_value
    raise "value must be less than 4096 bytes" if params[:value].length > 4096
    value = JSON.parse params[:value]
    DatablockStorageKvp.set_kvp params[:channel_id], params[:key], value
    render json: {key: params[:key], value: value}
  end

  def get_key_value
    kvp = DatablockStorageKvp.find_by(channel_id: params[:channel_id], key: params[:key])
    render json: kvp ? JSON.parse(kvp.value).to_json : nil
  end

  def delete_key_value
    key = params[:key]
    DatablockStorageKvp.where(channel_id: params[:channel_id], key: key).delete_all

    render json: true
  end

  def get_key_values
    # SELECT key, value FROM datablock_storage_kvps WHERE channel_id='{params[:channel_id]}';
    kvps = DatablockStorageKvp.
      where(channel_id: params[:channel_id]).
      select(:key, :value).
      to_h {|kvp| [kvp.key, JSON.parse(kvp.value)]}

    render json: kvps
  end

  def populate_key_values
    key_values_json = JSON.parse params[:key_values_json]
    raise "key_values_json must be a hash" unless key_values_json.is_a? Hash
    DatablockStorageKvp.set_kvps(params[:channel_id], key_values_json)
    render json: true
  end

  ##########################################################
  #   Table API                                            #
  ##########################################################

  def create_table
    table_or_create

    render json: true
  end

  def add_shared_table
    DatablockStorageTable.add_shared_table params[:channel_id], params[:table_name]
  end

  def import_csv
    table = table_or_create
    table.import_csv params[:table_data_csv]
    table.save!

    render json: true
  end

  def clear_table
    table_name = params[:table_name]
    DatablockStorageRecord.where(channel_id: params[:channel_id], table_name: table_name).delete_all

    render json: true
  end

  def delete_table
    where_table.delete_all
    DatablockStorageRecord.where(channel_id: params[:channel_id], table_name: params[:table_name]).delete_all

    render json: true
  end

  def get_table_names
    # SELECT DISTINCT table_name FROM datablock_storage_records WHERE channel_id='{params[:channel_id]}';
    render json: DatablockStorageRecord.where(channel_id: params[:channel_id]).select(:table_name).distinct.pluck(:table_name)
  end

  def populate_tables
    tables_json = JSON.parse params[:tables_json]
    DatablockStorageTable.populate_tables params[:channel_id], tables_json
    render json: true
  end

  ##########################################################
  #   Table Column API                                     #
  ##########################################################

  def add_column
    table = find_table
    table.add_column params[:column_name]
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

  def delete_column
    table = find_table
    table.delete_column params[:column_name]
    table.save!

    render json: true
  end

  def get_columns_for_table
    table = find_table
    render json: table.get_columns
  end

  ##########################################################
  #   Table Record API                                     #
  ##########################################################

  def create_record
    raise "record_json must be less than 4096 bytes" if params[:record_json].length > 4096
    record_json = JSON.parse params[:record_json]

    table = table_or_create
    table.create_records [record_json]
    table.save!

    render json: record_json
  end

  def read_records
    # FIXME: its weird that we pass in :is_shared_table here, that's a vestige of
    # the Firebase model, we should probably remove it, since we are going to
    # be examining Table.is_shared for lookups
    channel_id = params[:is_shared_table] == 'true' ? 'shared' : params[:channel_id]

    table = find_table

    # FIXME: what should we return to indicate that table_name doesn't exist?
    #
    # This condition is detected, currently trying to do readRecords('tabledoesntexist', {}) results in:
    # ERROR: Line: 1: You tried to read records from a table called "nope" but that table doesn't exist in this app

    render json: table.read_records.map(&:record_json)
  end

  def update_record
    raise "record_json must be less than 4096 bytes" if params[:record_json].length > 4096

    table = find_table
    record_json = table.update_record params[:record_id], JSON.parse(params[:record_json])
    table.save!

    render json: record_json
  end

  def delete_record
    table = find_table
    table.delete_record params[:record_id]
    table.save!
    render json: nil
  end

  ##########################################################
  #   Channel API                                          #
  ##########################################################

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
