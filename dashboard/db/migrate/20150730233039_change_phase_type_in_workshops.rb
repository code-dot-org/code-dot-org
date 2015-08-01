class ChangePhaseTypeInWorkshops < ActiveRecord::Migration
  def up
    change_column :workshops, :phase, :integer
  end

  def down
    change_column :workshops, :phase, :text
  end
end
