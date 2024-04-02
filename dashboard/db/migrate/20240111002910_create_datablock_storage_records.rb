class CreateDatablockStorageRecords < ActiveRecord::Migration[6.1]
  def change
    # We use utf8mb4 because we want .table_name to support emoji
    create_table :datablock_storage_records, primary_key: [:project_id, :table_name, :record_id], charset: 'utf8mb4', collation: 'utf8mb4_bin' do |t|
      t.integer :project_id
      # this is part of the composite primary_key for datablock_storage_tables
      # and max key length in mysql is 3072 bytes, so 700 * 4-bytes per utf8 character
      t.string :table_name, limit: 700
      t.integer :record_id
      t.json :record_json
    end

    add_index :datablock_storage_records, :project_id
    add_index :datablock_storage_records, [:project_id, :table_name]
  end
end
