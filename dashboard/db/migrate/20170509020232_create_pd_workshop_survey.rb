class CreatePdWorkshopSurvey < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_workshop_surveys do |t|
      t.references :pd_enrollment, null: false, index: true, unique: true
      t.text :form_data, null: false

      t.timestamps null: false
    end
  end
end
