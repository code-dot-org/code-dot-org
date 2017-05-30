class DropPlcEvaluationQuestionsAndPlcEvaluationAnswers < ActiveRecord::Migration[5.0]
  def change
    drop_table :plc_evaluation_questions
    drop_table :plc_evaluation_answers
  end
end
