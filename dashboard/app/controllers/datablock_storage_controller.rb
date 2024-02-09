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
    DatablockStorageKvp.set_kvp(params[:channel_id], params[:key], value)
    render json: {key: params[:key], value: value}
  end

  def create_record
    # FIXME: the current approach does a number of round-trips,
    # but our original was a single SQL block with no round-trips
    # So even though our current code sort-of looks similar, it may
    # be significantly slower, requiring multiple trips to the DB.
    # Can we rewrite it to be a single-trip, as it was designed for?

    # Here's the SQL block we have to replicate:
    #
    # BEGIN;
    #   SELECT MIN(record_id) FROM unfirebase.records WHERE channel_id='shared' AND table_name='words' LIMIT 1 FOR UPDATE;
    #   SELECT @id := IFNULL(MAX(record_id),0)+1 FROM unfirebase.records WHERE channel_id='shared' AND table_name='words';

    #   INSERT INTO unfirebase.records VALUES ('shared', 'words', @id, '{}');
    # COMMIT;

    raise "record_json must be less than 4096 bytes" if params[:record_json].length > 4096
    record_json = JSON.parse params[:record_json]

    table = DatablockStorageTable.where(channel_id: params[:channel_id], table_name: params[:table_name]).first_or_create
    table.create_records([record_json])

    render json: record_json
  end

  # This would require MySQL option MULTI_STATEMENTS set on the connection, which
  # has lots of pitfalls and isn't particularly well supported with the mysql2 gem
  # See: https://github.com/rails/rails/issues/31569
  #
  # def create_record_one_round_trip
  #   channel_id_quoted = Record.connection.quote(params[:channel_id])
  #   table_name_quoted = Record.connection.quote(params[:table_name])
  #   json_quoted  = Record.connection.quote JSON.parse params[:json]
  #   record_json = Record.find_by_sql(<<-SQL
  #     BEGIN;
  #       SELECT MIN(record_id) FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted} LIMIT 1 FOR UPDATE;
  #       SELECT @id := IFNULL(MAX(record_id),0)+1 FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted};
  #       INSERT INTO #{Record.table_name} VALUES (#{channel_id_quoted}, #{table_name_quoted}, @id, #{json_quoted}});
  #     END;
  #     SELECT * FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted} AND record_id=@id;
  #   SQL)

  #   render json: record_json
  # end

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

    table = DatablockStorageTable.find([params[:channel_id], params[:table_name]])
    record_json = table.update_record(params[:record_id], JSON.parse(params[:record_json]))
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
    table_name = params[:table_name]
    table = DatablockStorageTable.where(channel_id: params[:channel_id], table_name: table_name).first_or_create
    table.save!

    render json: true
  end

  def delete_table
    table_name = params[:table_name]
    DatablockStorageTable.where(channel_id: params[:channel_id], table_name: table_name).delete_all
    DatablockStorageRecord.where(channel_id: params[:channel_id], table_name: table_name).delete_all

    render json: true
  end

  def clear_table
    table_name = params[:table_name]
    DatablockStorageRecord.where(channel_id: params[:channel_id], table_name: table_name).delete_all

    render json: true
  end

  def add_column
    column_name = params[:column_name]

    table = DatablockStorageTable.find([params[:channel_id], params[:table_name]])
    unless table.columns.include? column_name
      table.columns << column_name
      table.save!
    end

    render json: true
  end

  def delete_column
    table = DatablockStorageTable.find([params[:channel_id], params[:table_name]])
    table.delete_column(params[:column_name])
    table.save!

    render json: true
  end

  def rename_column
    table = DatablockStorageTable.find([params[:channel_id], params[:table_name]])
    table.rename_column(params[:old_column_name], params[:new_column_name])
    table.save!

    render json: true
  end

  def _coerce_type(value, column_type)
    case column_type
    when 'string'
      value.to_s
    when 'number'
      value.to_f
    when 'boolean'
      value.to_b
    end
  end

  def coerce_column
    table_name = params[:table_name]
    column_name = params[:column_name]
    column_type = params[:column_type]

    unless ['string', 'number', 'boolean'].include? column_type
      raise "column_type must be one of: string, number, boolean"
    end

    DatablockStorageRecord.where(channel_id: params[:channel_id], table_name: table_name).each do |record|
      # column type is one of: string, number, boolean, date
      record.record_json[column_name] = _coerce_type(record.record_json[column_name], column_type)
      record.save!
    end

    render json: true
  end

  def import_csv
    records = CSV.parse(params[:table_data_csv], headers: true).map(&:to_h)
    table = DatablockStorageTable.where(channel_id: params[:channel_id], table_name: params[:table_name]).first_or_create
    table.create_records(records)

    render json: true
  end

  def delete_key_value
    key = params[:key]
    DatablockStorageKvp.where(channel_id: params[:channel_id], key: key).delete_all

    render json: true
  end

  def populate_tables
    tables_json = JSON.parse(params[:tables_json])
    tables_json.each do |table_name, records|
      table = DatablockStorageTable.where(channel_id: params[:channel_id], table_name: table_name).first_or_create
      table.create_records(records)
    end
    render json: true
  end

  def populate_key_values
    key_values_json = JSON.parse(params[:key_values_json])
    raise "key_values_json must be a hash" unless key_values_json.is_a? Hash
    DatablockStorageKvp.set_kvps(params[:channel_id], key_values_json)
    render json: true
  end

  def get_columns_for_table
    table = DatablockStorageTable.find([params[:channel_id], params[:table_name]])
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
    DatablockStorageTable.add_shared_table(params[:channel_id], params[:table_name])
  end

  private

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
