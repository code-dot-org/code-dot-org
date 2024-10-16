# This is a temporary table that allows some projects to be in F*rebase, and some
# to be in Datablock storage. Once all projects migrated to Datablock storage,
# we can remove this table.
class CreateProjectUseDatablockStorages < ActiveRecord::Migration[6.0]
  def change
    create_table :project_use_datablock_storages do |t|
      t.integer :project_id, null: false, index: true
      t.boolean :use_datablock_storage, default: false, null: false
    end
  end
end
