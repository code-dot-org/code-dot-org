class DropPdWorkshopSurveyTable < ActiveRecord::Migration[6.1]
  def change
    drop_table :pd_workshop_surveys if ActiveRecord::Base.connection.table_exists? :pd_workshop_surveys
  end
end
