class CreateStudentWorkEvaluationSummaries < ActiveRecord::Migration[6.1]
  def change
    create_table :student_work_evaluation_summaries do |t|
      t.bigint :student_work_evaluation_id, null: false
      t.bigint :student_work_evaluation_summary_id, null: false

      t.timestamps
    end

    add_foreign_key :student_work_evaluation_summaries, :student_work_evaluations, column: :student_work_evaluation_id
    add_foreign_key :student_work_evaluation_summaries, :student_work_evaluations, column: :student_work_evaluation_summary_id
  end
end
