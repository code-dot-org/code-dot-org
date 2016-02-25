class CreatePlcEvaluationQuestions < ActiveRecord::Migration
  def up
    drop_table :plc_evaluation_questions if ActiveRecord::Base.connection.table_exists? :plc_evaluation_question

    create_table :plc_evaluation_questions do |t|
      t.string :question
      t.references :plc_course, index: true

      t.timestamps null: false
    end
  end

  def down
    drop_table :plc_evaluation_questions
  end
end
