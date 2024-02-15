class CreateDatablockStorageRecords < ActiveRecord::Migration[6.1]
  def change
    create_table :datablock_storage_records, primary_key: [:project_id, :table_name, :record_id] do |t|
      t.integer :project_id
      t.string :table_name, limit: 768
      t.integer :record_id
      t.json :record_json
    end
    add_index :datablock_storage_records, [:project_id, :table_name]
  end
end
