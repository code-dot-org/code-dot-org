class AddNameFieldToPdWorkshops < ActiveRecord::Migration[6.1]
  def change
    add_column :pd_workshops, :name, :string
  end
end
