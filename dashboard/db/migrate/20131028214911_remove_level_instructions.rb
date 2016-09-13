class RemoveLevelInstructions < ActiveRecord::Migration[4.2]
  def change
    remove_column :levels, :instructions
  end
end
