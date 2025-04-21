class AddOriginalUnitGroupToUnit < ActiveRecord::Migration[6.1]
  def up
    add_column :scripts, :original_unit_group_id, :integer
    add_foreign_key :scripts, :unit_groups, column: :original_unit_group_id
    add_index :scripts, :original_unit_group_id
  end

  def down
    remove_foreign_key :scripts, column: :original_unit_group_id
    remove_index :scripts, :original_unit_group_id
    remove_column :scripts, :original_unit_group_id
  end
end
