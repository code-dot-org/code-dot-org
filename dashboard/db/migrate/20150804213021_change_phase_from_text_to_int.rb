class ChangePhaseFromTextToInt < ActiveRecord::Migration
  def up
    change_column :workshops, :phase, :int
  end
  def down
    change_column :workshops, :phase, :text
  end
end
