class CreatePlcEvaluationAnswers < ActiveRecord::Migration
  def change
    create_table :plc_evaluation_answers do |t|
      t.references :plc_evaluation_question, index: {name: 'plc_answer_question_index'}
      t.string :answer
      t.references :professional_learning_task, index: {name: 'plc_answer_plc_index'}

      t.timestamps null: false
    end
  end
end
