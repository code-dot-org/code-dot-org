class CreateDatablockStorageKvps < ActiveRecord::Migration[6.1]
  def change
    create_table :datablock_storage_kvps, primary_key: [:channel_id, :key] do |t|
      t.string :channel_id, limit: 22
      t.string :key, limit: 768
      t.json :value
    end
  end
end
