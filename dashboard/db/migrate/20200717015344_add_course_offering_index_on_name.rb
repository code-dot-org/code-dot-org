class AddCourseOfferingIndexOnName < ActiveRecord::Migration[5.0]
  def change
    add_index :course_offerings, :name, unique: true
  end
end
