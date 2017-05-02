class CreateCourses < ActiveRecord::Migration[5.0]
  def change
    create_table :courses do |t|
      t.string :name
      t.integer :plc_course_id
      t.text :properties

      t.timestamps
    end
  end
end
