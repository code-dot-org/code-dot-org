class ReAddInstructionsToLevel < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :instructions, :string
  end
end
