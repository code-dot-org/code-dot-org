class CreateTeacherFeedbacks < ActiveRecord::Migration[5.0]
  def change
    create_table :teacher_feedbacks do |t|
      t.text :comment
      t.integer :student_id
      t.integer :level_id
      t.integer :section_id

      t.timestamps
    end

    add_index :teacher_feedbacks, [:student_id, :level_id, :section_id], name: "index_feedback_on_student_and_level_and_section_id"
  end
end
