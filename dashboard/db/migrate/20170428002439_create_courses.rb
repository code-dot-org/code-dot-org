class CreateCourses < ActiveRecord::Migration[5.0]
  def change
    create_table :courses do |t|
      t.string :name, index: true
      t.text :properties

      t.timestamps
    end

    add_column :plc_courses, :course_id, :integer
    add_foreign_key :plc_courses, :courses

    reversible do |dir|
      dir.up do
        Plc::Course.find_each do |plc_course|
          course = Course.create!(name: plc_course.name)
          plc_course.update!(course_id: course.id)
        end
      end
      dir.down do
        # do nothing on a down as we'll already have deleted the new table/column
      end
    end
  end
end
