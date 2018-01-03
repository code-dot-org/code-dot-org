class AddWorkshopToPdApplicationApplicationBase < ActiveRecord::Migration[5.0]
  def change
    add_reference :pd_applications, :pd_workshop, foreign_key: true
  end
end
