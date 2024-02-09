# == Schema Information
#
# Table name: datablock_storage_tables
#
#  channel_id      :string(22)       not null, primary key
#  table_name      :string(768)      not null, primary key
#  columns         :json
#  is_shared_table :string(768)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
class DatablockStorageTable < ApplicationRecord
  self.primary_keys = :channel_id, :table_name
  has_many :records, autosave: true, class_name: 'DatablockStorageRecord', foreign_key: [:channel_id, :table_name]
  after_initialize -> {self.columns ||= ['id']}, if: :new_record?

  def self.add_shared_table(channel_id, table_name)
    unless DatablockStorageTable.exists?(channel_id: "shared", table_name: table_name)
      raise "Shared table '#{table_name}' does not exist"
    end
    DatablockStorageTable.create!(channel_id: channel_id, table_name: table_name, is_shared_table: true)
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
    # FIXME: is_shared_table, lookup that table and return its read_records instead
    return records
  end

  def create_records(record_jsons)
    # FIXME: is_shared_table, copy-on-write goes here

    # BEGIN;
    DatablockStorageRecord.transaction do
      # channel_id_quoted = Record.connection.quote(params[:channel_id])
      # table_name_quoted = Record.connection.quote(params[:table_name])

      # SELECT MIN(record_id) FROM unfirebase.records WHERE channel_id='shared' AND table_name='words' LIMIT 1 FOR UPDATE;
      # =>
      # DatablockStorageRecord.connection.execute("SELECT MIN(record_id) FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted} LIMIT 1 FOR UPDATE")
      # =>
      DatablockStorageRecord.where(channel_id: channel_id, table_name: table_name).lock.minimum(:record_id)

      # SELECT @id := IFNULL(MAX(record_id),0)+1 FROM unfirebase.records WHERE channel_id='shared' AND table_name='words';
      # =>
      # next_record_id = DatablockStorageRecord.connection.select_value("SELECT IFNULL(MAX(record_id),0)+1 FROM #{Record.table_name} WHERE channel_id=#{channel_id_quoted} AND table_name=#{table_name_quoted}")
      # =>
      max_record_id = DatablockStorageRecord.where(channel_id: channel_id, table_name: table_name).maximum(:record_id)
      next_record_id = (max_record_id || 0) + 1

      cols_in_records = Set.new
      record_jsons.each do |record_json|
        # We write the record_id into the JSON as well as storing it in its own column
        # only create_record and update_record should be at risk of modifying this
        record_json['id'] = next_record_id

        #   INSERT INTO unfirebase.records VALUES ('shared', 'words', @id, '{}');
        DatablockStorageRecord.create(channel_id: channel_id, table_name: table_name, record_id: next_record_id, record_json: record_json)

        cols_in_records.merge(record_json.keys)
        next_record_id += 1
      end

      # Preserve the old column's order while adding any new columns
      self.columns += (cols_in_records - columns).to_a
      save!
    end
    # COMMIT;
  end

  def update_record(record_id, record_json)
    # FIXME: is_shared_table, copy-on-write goes here

    record = records.find_by(record_id: record_id)
    return unless record

    record_json['id'] = record_id.to_i
    record.record_json = record_json
    record.save!

    # update the table columns with any new JSON fields
    self.columns += (record_json.keys.to_set - columns).to_a

    return record_json
  end

  def delete_record(record_id)
    records.find_by(record_id: record_id).delete
  end

  def import_csv(table_data_csv)
    # FIXME: is_shared_table, copy-on-write goes here

    records = CSV.parse(table_data_csv, headers: true).map(&:to_h)
    create_records(records)
  end

  def add_column(column_name)
    # FIXME: is_shared_table, copy-on-write goes here

    unless columns.include? column_name
      self.columns << column_name
    end
  end

  def delete_column(column_name)
    # FIXME: is_shared_table, copy-on-write goes here

    records.each do |record|
      record.record_json.delete(column_name)
    end

    self.columns.delete column_name
  end

  def rename_column(old_column_name, new_column_name)
    # FIXME: is_shared_table, copy-on-write goes here

    # First rename the column in all the JSON records
    records.each do |record|
      record.record_json[new_column_name] = record.record_json.delete(old_column_name)
    end

    # Second rename the column in the table definition
    self.columns = columns.map {|column| column == old_column_name ? new_column_name : column}
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

  def coerce_column(column_name, column_type)
    # FIXME: is_shared_table, copy-on-write goes here

    unless ['string', 'number', 'boolean'].include? column_type
      raise "column_type must be one of: string, number, boolean"
    end

    records.each do |record|
      # column type is one of: string, number, boolean, date
      record.record_json[column_name] = _coerce_type(record.record_json[column_name], column_type)
    end
  end
end
