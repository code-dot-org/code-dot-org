class AddPublishedStateToUnitGroup < ActiveRecord::Migration[5.2]
  def up
    add_column :unit_groups, :published_state, :string
    add_index :unit_groups, :published_state
  end

  def down
    remove_column :unit_groups, :published_state
  end
end
