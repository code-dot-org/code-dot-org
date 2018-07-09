class AddLastSubmissionIdToSurveyQuestions < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_survey_questions, :last_submission_id, :integer, limit: 8, comment:
      'Last successfully processed submission id. Sync will only pull submissions with ids greater than this value.'
  end
end
