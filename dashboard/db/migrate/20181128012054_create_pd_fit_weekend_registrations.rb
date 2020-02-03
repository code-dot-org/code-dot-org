class CreatePdFitWeekendRegistrations < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_fit_weekend_registrations do |t|
      t.references :pd_application, index: true
      t.string :registration_year, null: false, index: true
      t.text :form_data

      t.timestamps null: false
    end
  end
end
