class CreateLessonGroups < ActiveRecord::Migration[5.0]
  def change
    create_table :lesson_groups do |t|
      t.string :name
      t.integer :script_id, null: false
      t.boolean :user_facing, null: false, default: true

      t.index :script_id

      t.timestamps
    end
  end
end
