class SimplifyPdSurveyQuestions < ActiveRecord::Migration[5.0]
  def up
    drop_table :pd_survey_questions

    create_table :pd_survey_questions do |t|
      t.integer :form_id, index: true
      t.text :questions, null: false, comment: 'JSON Question data for this JotForm form.'

      t.timestamps
    end
  end

  def down
    drop_table :pd_survey_questions

    create_table :pd_survey_questions do |t|
      t.integer :form_id, index: true
      t.string :question_id, index: true
      t.string :question_text

      t.timestamps
    end
  end
end
