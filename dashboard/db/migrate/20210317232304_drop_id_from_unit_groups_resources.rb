class DropIdFromUnitGroupsResources < ActiveRecord::Migration[5.2]
  def change
    remove_column :unit_groups_resources, :id
  end
end
