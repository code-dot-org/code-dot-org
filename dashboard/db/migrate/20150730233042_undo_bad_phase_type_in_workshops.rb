class UndoBadPhaseTypeInWorkshops < ActiveRecord::Migration[4.2]
  def up
    change_column :workshops, :phase, :text
  end
end
