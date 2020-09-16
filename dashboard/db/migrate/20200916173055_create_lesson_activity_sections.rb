class CreateLessonActivitySections < ActiveRecord::Migration[5.0]
  def change
    create_table :lesson_activity_sections do |t|
      t.integer :lesson_activity_id, null: false
      t.integer :position, null: false
      t.string :properties

      t.timestamps
    end
  end
end
