class AddContainedLevelToLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :levels, :contained_level_id, :integer
    add_index :levels, :contained_level_id
  end
end
