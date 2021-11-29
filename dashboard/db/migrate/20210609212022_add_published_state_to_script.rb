class AddPublishedStateToScript < ActiveRecord::Migration[5.2]
  def up
    add_column :scripts, :published_state, :string
    add_index :scripts, :published_state
  end

  def down
    remove_column :scripts, :published_state
  end
end
