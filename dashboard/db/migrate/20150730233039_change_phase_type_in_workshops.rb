class ChangePhaseTypeInWorkshops < ActiveRecord::Migration
  def change
    change_column :workshops, :phase, :integer
  end
end
