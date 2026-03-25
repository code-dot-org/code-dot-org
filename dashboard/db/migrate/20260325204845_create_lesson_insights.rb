class CreateLessonInsights < ActiveRecord::Migration[7.0]
  def change
    create_table :lesson_insights do |t|
      t.integer :lesson_id,  null: false
      t.integer :student_id, null: false
      t.integer :section_id, null: false
      t.integer :unit_id,    null: false
      t.text    :insight_json, null: false   # raw JSON string from AI

      t.timestamps
    end

    add_index :lesson_insights, [:section_id, :unit_id, :lesson_id, :student_id], unique: true, name: 'index_lesson_insights_on_section_id_unit_id_lesson_id_student_id'
  end
end
