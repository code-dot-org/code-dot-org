class CreateDatablockStorageTables < ActiveRecord::Migration[6.1]
  def change
    # We use utf8mb4 because we want .table_name to support emoji
    create_table :datablock_storage_tables, primary_key: [:project_id, :table_name], charset: 'utf8mb4', collation: 'utf8mb4_bin' do |t|
      t.integer :project_id
      # this is part of the composite primary_key and max key length in mysql is 3072 bytes * 4-bytes per utf8 character
      t.string :table_name, limit: 700
      t.json :columns
      t.string :is_shared_table, limit: 700

      t.timestamps
    end

    add_index :datablock_storage_tables, :project_id
  end
end
