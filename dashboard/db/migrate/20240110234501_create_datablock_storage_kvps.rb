class CreateDatablockStorageKvps < ActiveRecord::Migration[6.1]
  def change
    create_table :datablock_storage_kvps, primary_key: [:project_id, :key] do |t|
      t.integer :project_id
      t.string :key, limit: 768
      t.json :value
    end
  end
end
