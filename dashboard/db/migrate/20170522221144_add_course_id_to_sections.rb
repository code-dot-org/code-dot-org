class AddCourseIdToSections < ActiveRecord::Migration[5.0]
  def change
    add_column :sections, :course_id, :integer
  end
end
