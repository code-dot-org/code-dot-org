class CreateSurveyAnswers < ActiveRecord::Migration[5.0]
  def change
    create_table :survey_answers do |t|
      t.integer :user_id
      t.integer :form_id
      t.integer :submission_id
      t.string :question_id
      t.text :answer_value
      t.timestamps
    end

    change_column :survey_answers, :form_id, :bigint
    change_column :survey_answers, :submission_id, :bigint
  end
end
