class AddConvertedPdWorkshopToWorkshop < ActiveRecord::Migration[5.0]
  def change
    add_reference :workshops, :pd_workshop, foreign_key: true
  end
end
