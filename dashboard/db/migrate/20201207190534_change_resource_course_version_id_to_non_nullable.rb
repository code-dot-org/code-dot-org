class ChangeResourceCourseVersionIdToNonNullable < ActiveRecord::Migration[5.2]
  def change
    change_column :resources, :course_version_id, :integer, null: false
  end
end
