class CreateLessonFeedbacks < ActiveRecord::Migration[6.1]
  def change
    create_table :lesson_feedbacks do |t|
      t.integer :teacher_id
      t.integer :student_id
      t.bigint :section_id
      t.integer :lesson_id
      t.text :saved_feedback
      t.text :submitted_feedback
      t.datetime :submitted_at
      t.json :resources

      t.timestamps
    end
  end
end
