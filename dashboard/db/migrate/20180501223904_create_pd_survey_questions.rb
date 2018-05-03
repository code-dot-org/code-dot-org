class CreatePdSurveyQuestions < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_survey_questions do |t|
      t.integer :form_id, index: true
      t.string :question_id, index: true
      t.string :question_text

      t.timestamps
    end
  end
end
