class AddPropertiesToPdWorkshops < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_workshops, :properties, :text
  end
end
