class CreatePdWorkshopSurveySubmissions < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_workshop_survey_submissions do |t|
      t.references :foorm_submission, index: {unique: true}, null: false
      t.references :user, null: false
      t.references :pd_session
      t.references :pd_workshop, null: false
      t.integer :day

      t.timestamps
    end
  end
end
