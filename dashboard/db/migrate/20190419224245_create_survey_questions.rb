class CreateSurveyQuestions < ActiveRecord::Migration[5.0]
  def change
    create_table :survey_questions do |t|
      t.integer :form_id
      t.string :question_id
      t.text :preamble
      t.text :question_text
      t.string :answer_type
      t.text :answer_options
      t.integer :min_value
      t.integer :max_value
      t.timestamps
    end

    change_column :survey_questions, :form_id, :bigint
  end
end
