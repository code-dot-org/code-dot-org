class RemoveHiddenFromScript < ActiveRecord::Migration[5.2]
  def change
    remove_column :scripts, :hidden, :boolean
  end
end
