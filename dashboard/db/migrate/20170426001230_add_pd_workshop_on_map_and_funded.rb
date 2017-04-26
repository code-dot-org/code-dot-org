class AddPdWorkshopOnMapAndFunded < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_workshops, :on_map, :boolean
    add_column :pd_workshops, :funded, :boolean
  end
end
