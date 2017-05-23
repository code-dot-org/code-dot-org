class AddCourseIdToSections < ActiveRecord::Migration[5.0]
  def change
    add_column :sections, :course_id, :integer, after: :script_id
    add_foreign_key :sections, :courses
  end
end
