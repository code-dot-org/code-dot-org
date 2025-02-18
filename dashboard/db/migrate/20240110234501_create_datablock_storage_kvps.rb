class CreateDatablockStorageKvps < ActiveRecord::Migration[6.1]
  def change
    # We use utf8mb4 because we want .string to support emoji
    create_table :datablock_storage_kvps, primary_key: [:project_id, :key], charset: 'utf8mb4', collation: 'utf8mb4_bin' do |t|
      t.integer :project_id
      # this is part of the composite primary_key and max key length in mysql is 3072 bytes,
      # so 700 * 4-bytes per utf8 character.
      t.string :key, limit: 700
      t.json :value
    end

    add_index :datablock_storage_kvps, :project_id
  end
end
