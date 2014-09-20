class ReAddInstructionsToLevel < ActiveRecord::Migration
  def change
    add_column :levels, :instructions, :string
  end
end
