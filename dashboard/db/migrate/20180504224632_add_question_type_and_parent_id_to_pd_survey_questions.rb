class AddQuestionTypeAndParentIdToPdSurveyQuestions < ActiveRecord::Migration[5.0]
  def change
    change_table :pd_survey_questions do |t|
      t.column :question_type, :string, null: false

      t.column :parent_id, :integer, null: true,
        comment: 'Parent pd_survey_question id for hierarchical question types, such as matrices.'
    end

    change_column_null :pd_survey_questions, :form_id, false
    change_column_null :pd_survey_questions, :question_id, false
    change_column_null :pd_survey_questions, :question_text, false
  end
end
