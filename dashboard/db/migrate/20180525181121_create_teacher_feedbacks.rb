class CreateTeacherFeedbacks < ActiveRecord::Migration[5.0]
  def change
    create_table :teacher_feedbacks do |t|
      t.text :comment
      t.integer :student_id
      t.integer :level_id
      t.integer :teacher_id

      t.timestamps
    end
  end
end
