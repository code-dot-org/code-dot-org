class AddPublishedStateToScript < ActiveRecord::Migration[5.2]
  def up
    execute <<-SQL
        ALTER TABLE scripts ADD published_state enum('in_development', 'pilot', 'beta', 'preview', 'stable');
    SQL
    add_index :scripts, :published_state
  end

  def down
    remove_column :scripts, :published_state
  end
end
