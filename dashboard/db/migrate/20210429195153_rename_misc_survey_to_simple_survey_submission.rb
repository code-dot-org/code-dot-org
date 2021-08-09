class RenameMiscSurveyToSimpleSurveySubmission < ActiveRecord::Migration[5.2]
  def change
    rename_table :foorm_misc_surveys, :foorm_simple_survey_submissions

    # This index was manually named when it was added,
    # and needs to be manually updated to be changed here.
    rename_index :foorm_simple_survey_submissions,
      'index_misc_survey_foorm_submissions_on_foorm_id',
      'index_foorm_simple_survey_submissions_on_foorm_submission_id'
  end
end
