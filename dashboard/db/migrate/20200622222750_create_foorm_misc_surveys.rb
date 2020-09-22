class CreateFoormMiscSurveys < ActiveRecord::Migration[5.0]
  def change
    create_table :foorm_misc_surveys do |t|
      t.references :foorm_submission, index: {unique: true, name: 'index_misc_survey_foorm_submissions_on_foorm_id'}, null: false
      t.references :user
      t.string :misc_form_path

      t.timestamps
    end
  end
end
