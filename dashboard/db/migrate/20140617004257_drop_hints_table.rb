class DropHintsTable < ActiveRecord::Migration
  def change
    drop_table :hints
  end
end
