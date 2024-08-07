class DropProjectUseDatablockStorageTable < ActiveRecord::Migration[6.1]
  def change
    drop_table :project_use_datablock_storages if ActiveRecord::Base.connection.table_exists? :project_use_datablock_storages
  end
end
