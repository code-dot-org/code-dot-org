class RemoveLevelInstructions < ActiveRecord::Migration
  def change
    remove_column :levels, :instructions
  end
end
