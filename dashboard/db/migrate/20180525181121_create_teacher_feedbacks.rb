class CreateTeacherFeedbacks < ActiveRecord::Migration[5.0]
  def change
    create_table :teacher_feedbacks do |t|
      t.text :comment
      t.integer :student_id
      t.integer :level_id
      t.integer :teacher_id

      t.timestamps
    end
    add_index :teacher_feedbacks, [:student_id, :level_id, :teacher_id], name: "index_feedback_on_student_and_level_and_teacher_id"
    add_index :teacher_feedbacks, [:student_id, :level_id], name: "index_feedback_on_student_and_level"
  end
end
