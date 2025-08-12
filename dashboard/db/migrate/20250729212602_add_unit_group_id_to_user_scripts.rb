class AddUnitGroupIdToUserScripts < ActiveRecord::Migration[6.1]
  def change
    add_column :user_scripts, :unit_group_id, :integer
  end
end
