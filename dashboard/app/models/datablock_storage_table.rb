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

  def self.add_shared_table(channel_id, table_name)
    unless DatablockStorageTable.exists?(channel_id: "shared", table_name: table_name)
      raise "Shared table '#{table_name}' does not exist"
    end
    DatablockStorageTable.create!(channel_id: channel_id, table_name: table_name, is_shared_table: true)
  end

  def create_records(record_jsons)
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

      record_jsons.each do |record_json|
        # We write the record_id into the JSON as well as storing it in its own column
        # only create_record and update_record should be at risk of modifying this
        record_json['id'] = next_record_id

        #   INSERT INTO unfirebase.records VALUES ('shared', 'words', @id, '{}');
        DatablockStorageRecord.create(channel_id: channel_id, table_name: table_name, record_id: next_record_id, record_json: record_json)

        next_record_id += 1
      end
    end
    # COMMIT;
  end
end
