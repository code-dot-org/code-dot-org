class CreateDatablockStorageLibraryManifest < ActiveRecord::Migration[6.1]
  def change
    create_table :datablock_storage_library_manifest do |t|
      t.json :library_manifest
      t.integer :singleton_guard, null: false
      t.timestamps
    end
    add_index :datablock_storage_library_manifest, :singleton_guard, unique: true
  end
end
