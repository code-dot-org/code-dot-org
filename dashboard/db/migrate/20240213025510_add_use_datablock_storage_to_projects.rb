class AddUseDatablockStorageToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :use_datablock_storage, :boolean, default: false, null: false
  end
end
