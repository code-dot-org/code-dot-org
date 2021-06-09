class AddPublishedStateToScript < ActiveRecord::Migration[5.2]
  def change
    add_column :scripts, :published_state, :string
  end
end
