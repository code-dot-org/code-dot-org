class CreateLessonInsights < ActiveRecord::Migration[7.0]
  def change
    create_table :lesson_insights do |t|
      t.integer :lesson_id
      t.integer :student_id
      t.integer :section_id
      t.integer :teacher_id
      t.text :insight_json

      t.timestamps
    end

    add_index :lesson_insights, [:section_id, :lesson_id, :student_id], unique: true
  end
end
