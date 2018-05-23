class IncreaseFormIdLimitAndAddUniqueConstraintToPdSurveyQuestions < ActiveRecord::Migration[5.0]
  def up
    change_column :pd_survey_questions, :form_id, :integer, limit: 8
    remove_index :pd_survey_questions, :form_id
    add_index :pd_survey_questions, :form_id, unique: true
  end

  def down
    remove_index :pd_survey_questions, :form_id
    change_column :pd_survey_questions, :form_id, :integer
    add_index :pd_survey_questions, :form_id
  end
end
