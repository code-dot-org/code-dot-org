class AddUnitGroupToUserLevels < ActiveRecord::Migration[6.1]
  def change
    add_column :user_levels, :unit_group_id, :integer
  end
end
