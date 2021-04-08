class DropIdFromScriptsResources < ActiveRecord::Migration[5.2]
  def change
    remove_column :scripts_resources, :id
  end
end
