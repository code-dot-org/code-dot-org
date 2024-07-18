class RemoveCategoryFromCourseOfferings < ActiveRecord::Migration[6.1]
  def up
    remove_column :course_offerings, :category
  end

  def down
  end
end
