class CreateCourseOfferings < ActiveRecord::Migration[5.0]
  def change
    create_table :course_offerings do |t|
      t.string :name
      t.text :properties

      t.timestamps
    end
  end
end
