class AddPublishedStateToUnitGroup < ActiveRecord::Migration[5.2]
  def up
    execute <<-SQL
        ALTER TABLE unit_groups ADD published_state enum('in_development', 'pilot', 'beta', 'preview', 'stable');
    SQL
    add_index :unit_groups, :published_state
  end

  def down
    remove_column :unit_groups, :published_state
  end
end
