class RemoveOldCourseVersionInstances < ActiveRecord::Migration[6.1]
  def up
    if Rails.env.development?
      CourseVersion.where.not(content_root_type: 'UnitGroup').delete_all
    end
  end

  def down
  end
end
