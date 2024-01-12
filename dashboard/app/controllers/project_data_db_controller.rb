class ProjectDataDbController < ApplicationController
  # FIXME: implement validate_channel_id, see below
  before_action :validate_channel_id
  before_action :authenticate_user!

  # GET /datasets
  def index
    @project = Project.find_by_channel_id(params[:channel_id])
    @key_value_pairs = KeyValuePair.where(channel_id: params[:channel_id])
    @records = Record.where(channel_id: params[:channel_id])
    puts "####################################################"
  end

  def get_key_value
    kvp = KeyValuePair.find_by(channel_id: params[:channel_id], key: params[:key])
    render json: kvp ? kvp.value.to_json : nil
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

    record = nil

    # BEGIN;
    Record.transaction do
      # channel_id_quoted = Record.connection.quote(params[:channel_id])
      # table_name_quoted = Record.connection.quote(params[:table_name])
      json = JSON.parse params[:json]

      # SELECT MIN(record_id) FROM unfirebase.records WHERE channel_id='shared' AND table_name='words' LIMIT 1 FOR UPDATE;
      # =>
      # Record.connection.execute("SELECT MIN(record_id) FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted} LIMIT 1 FOR UPDATE")
      # =>
      Record.where(channel_id: params[:channel_id], table_name: params[:table_name]).lock.minimum(:record_id)

      # SELECT @id := IFNULL(MAX(record_id),0)+1 FROM unfirebase.records WHERE channel_id='shared' AND table_name='words';
      # =>
      # next_record_id = Record.connection.select_value("SELECT IFNULL(MAX(record_id),0)+1 FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted}")
      # =>
      max_record_id = Record.where(channel_id: params[:channel_id], table_name: params[:table_name]).maximum(:record_id)
      next_record_id = (max_record_id || 0) + 1

      #   INSERT INTO unfirebase.records VALUES ('shared', 'words', @id, '{}');
      record = Record.create(channel_id: params[:channel_id], table_name: params[:table_name], record_id: next_record_id, json: json)
    end
    # COMMIT;

    render json: record
  end

  # This would require MySQL option MULTI_STATEMENTS set on the connection, which
  # has lots of pitfalls and isn't particularly well supported with the mysql2 gem
  # See: https://github.com/rails/rails/issues/31569
  #
  # def create_record_one_round_trip
  #   channel_id_quoted = Record.connection.quote(params[:channel_id])
  #   table_name_quoted = Record.connection.quote(params[:table_name])
  #   json_quoted  = Record.connection.quote JSON.parse params[:json]
  #   record = Record.find_by_sql(<<-SQL
  #     BEGIN;
  #       SELECT MIN(record_id) FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted} LIMIT 1 FOR UPDATE;
  #       SELECT @id := IFNULL(MAX(record_id),0)+1 FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted};
  #       INSERT INTO #{Record.table_name} VALUES (#{channel_id_quoted}, #{table_name_quoted}, @id, #{json_quoted}});
  #     END;
  #     SELECT * FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted} AND record_id=@id;
  #   SQL)

  #   render json: record
  # end

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

  private

  def validate_channel_id
    # FIXME: make sure that the channel_id refers to an applab or weblab project

    # This may be of interest:
    # begin
    #   _, project_id = storage_decrypt_channel_id(params[:channel_id]) if params[:channel_id]
    # rescue ArgumentError, OpenSSL::Cipher::CipherError
    #   # continue as normal, as we only use this value for stats.
    # end
  end
end
