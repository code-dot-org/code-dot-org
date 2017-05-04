class CreateCourses < ActiveRecord::Migration[5.0]
  def up
    create_table :courses do |t|
      t.string :name
      t.text :properties
      t.integer :plc_course_id, index: true, foreign_key: true

      t.timestamps
    end

    Plc::Course.all.each do |plc_course|
      Course.create!(name: plc_course.name, plc_course_id: plc_course.id)
    end
  end

  def down
    drop_table :courses
  end
end
