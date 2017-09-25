class AddRegionalParterToPdWorkshops < ActiveRecord::Migration[5.0]
  def change
    add_reference :pd_workshops, :regional_partner, foreign_key: true
  end
end
