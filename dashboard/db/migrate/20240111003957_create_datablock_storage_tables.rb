class CreateDatablockStorageTables < ActiveRecord::Migration[6.1]
  def change
    create_table :datablock_storage_tables, primary_key: [:project_id, :table_name] do |t|
      t.integer :project_id
      t.string :table_name, limit: 768
      t.json :columns
      t.string :is_shared_table, limit: 768

      t.timestamps
    end
  end
end
