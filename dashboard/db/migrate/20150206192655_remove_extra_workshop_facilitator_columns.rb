class RemoveExtraWorkshopFacilitatorColumns < ActiveRecord::Migration
  def change
    remove_index :facilitators_workshops, :facilitators_id
    remove_column :facilitators_workshops, :facilitators_id
    remove_index :facilitators_workshops, :workshops_id
    remove_column :facilitators_workshops, :workshops_id
  end
end
