class DropSurveyAnswers < ActiveRecord::Migration[5.2]
  def change
    drop_table :survey_answers
    drop_table :survey_questions
  end
end
