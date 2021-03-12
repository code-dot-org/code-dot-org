class ChangeResourceCourseVersionIdToNonNullable < ActiveRecord::Migration[5.2]
  def up
    if [:development, :adhoc, :test].include? rack_env
      Resource.where(course_version_id: nil).destroy_all
    end
    change_column :resources, :course_version_id, :integer, null: false
  end

  def down
    change_column :resources, :course_version_id, :integer, null: true
  end
end
