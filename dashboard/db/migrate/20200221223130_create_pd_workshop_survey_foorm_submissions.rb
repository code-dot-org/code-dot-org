class CreatePdWorkshopSurveyFoormSubmissions < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_workshop_survey_foorm_submissions do |t|
      t.references :foorm_submission, index: {unique: true, name: 'index_workshop_survey_foorm_submissions_on_foorm_id'}, null: false
      t.references :user, null: false
      t.references :pd_session
      t.references :pd_workshop, null: false
      t.integer :day

      t.timestamps
    end
  end
end
