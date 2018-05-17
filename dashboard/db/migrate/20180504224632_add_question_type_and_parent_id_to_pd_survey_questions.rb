class AddQuestionTypeAndParentIdToPdSurveyQuestions < ActiveRecord::Migration[5.0]
  def change
    change_table :pd_survey_questions do |t|
      t.column :question_type, :string, null: false

      t.column :question_name, :string, null: false,
        comment: 'Unique name to identify a question within a form, but not as strong as id since it can change'

      t.column :order, :integer, null: false,
        comment: 'Order the question appears on the form, starting with 1'
    end

    change_column_null :pd_survey_questions, :form_id, false
    change_column_null :pd_survey_questions, :question_id, false
    change_column_null :pd_survey_questions, :question_text, false

    reversible do |dir|
      dir.up do
        change_column :pd_survey_questions, :question_text, :text, null: false
      end
      dir.down do
        change_column :pd_survey_questions, :question_text, :string, null: true
      end
    end
  end
end
