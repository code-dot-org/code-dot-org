class CreatePlcEvaluationQuestions < ActiveRecord::Migration
  def change
    create_table :plc_evaluation_questions do |t|
      t.references :professional_learning_course, index: {name: 'plc_evaluation_plc_index'}, foreign_key: true
      t.string :question

      t.timestamps null: false
    end
  end
end
