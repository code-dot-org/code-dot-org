class AddTypeToPdWorkshopSurveys < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_workshop_surveys, :type, :string
  end
end
