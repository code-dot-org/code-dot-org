class UndoBadPhaseTypeInWorkshops < ActiveRecord::Migration
  def up
    change_column :workshops, :phase, :text
  end
end
