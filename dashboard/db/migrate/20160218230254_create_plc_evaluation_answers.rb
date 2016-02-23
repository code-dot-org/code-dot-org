class CreatePlcEvaluationAnswers < ActiveRecord::Migration
  def up
    drop_table :plc_evaluation_answers if ActiveRecord::Base.connection.table_exists? :plc_evaluation_answers

    create_table :plc_evaluation_answers do |t|
      t.string :answer
      t.references :plc_evaluation_question, index: true
      t.references :plc_task, index: true

      t.timestamps null: false
    end
  end

  def down
    drop_table :plc_evaluation_answers
  end
end
