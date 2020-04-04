class CreateLessonGroups < ActiveRecord::Migration[5.0]
  def change
    create_table :lesson_groups do |t|
      t.string :name
      t.integer :unit_id
      t.boolean :user_facing

      t.index :unit_id

      t.timestamps
    end
  end
end
