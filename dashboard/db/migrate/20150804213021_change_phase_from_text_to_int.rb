class ChangePhaseFromTextToInt < ActiveRecord::Migration[4.2]
  def up
    change_column :workshops, :phase, :int
  end

  def down
    change_column :workshops, :phase, :text
  end
end
