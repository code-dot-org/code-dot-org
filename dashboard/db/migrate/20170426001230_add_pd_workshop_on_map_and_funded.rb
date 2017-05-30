class AddPdWorkshopOnMapAndFunded < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_workshops, :on_map, :boolean, comment: "Should this workshop appear on the 'Find a Workshop' map?"
    add_column :pd_workshops, :funded, :boolean, comment: "Should this workshop's attendees be reimbursed?"
  end
end
