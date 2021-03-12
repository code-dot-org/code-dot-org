class AddCourseVersionsToCourseOffering < ActiveRecord::Migration[5.0]
  def change
    add_reference :course_versions, :course_offering
    add_index :course_versions, [:course_offering_id, :key], unique: true
  end
end
