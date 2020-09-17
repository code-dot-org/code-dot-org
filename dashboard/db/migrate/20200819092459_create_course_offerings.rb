class CreateCourseOfferings < ActiveRecord::Migration[5.0]
  def change
    create_table :course_offerings do |t|
      t.string :key, null: false
      t.string :display_name, null: false
      t.text :properties

      t.timestamps

      t.index :key, unique: true
    end
  end
end
