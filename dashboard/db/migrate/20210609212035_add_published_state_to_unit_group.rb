class AddPublishedStateToUnitGroup < ActiveRecord::Migration[5.2]
  def change
    add_column :unit_groups, :published_state, :string
  end
end
