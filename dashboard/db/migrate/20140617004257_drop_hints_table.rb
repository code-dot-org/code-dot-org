class DropHintsTable < ActiveRecord::Migration[4.2]
  def change
    drop_table :hints
  end
end
