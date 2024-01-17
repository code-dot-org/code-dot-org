class CreateDatablockStorageRecords < ActiveRecord::Migration[6.1]
  def change
    create_table :datablock_storage_records, primary_key: [:channel_id, :table_name, :record_id] do |t|
      t.string :channel_id, limit: 22
      t.string :table_name, limit: 768
      t.integer :record_id
      t.json :record_json
    end
    add_index :datablock_storage_records, [:channel_id, :table_name]
  end
end
