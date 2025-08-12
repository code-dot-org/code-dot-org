class RemoveOldCourseVersionInstances < ActiveRecord::Migration[6.1]
  def up
    if Rails.env.development?
      deleted_count = CourseVersion.where.not(content_root_type: 'UnitGroup').delete_all
      puts "Deleted #{deleted_count} CourseVersion records."
    end
  end

  def down
  end
end
