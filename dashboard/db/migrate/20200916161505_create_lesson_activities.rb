class CreateLessonActivities < ActiveRecord::Migration[5.0]
  def change
    create_table :lesson_activities do |t|
      t.integer :lesson_id, null: false, index: true
      t.integer :position, null: false
      t.string :properties

      t.timestamps
    end
  end
end
