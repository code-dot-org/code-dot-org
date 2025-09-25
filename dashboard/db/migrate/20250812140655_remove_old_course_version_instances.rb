class RemoveOldCourseVersionInstances < ActiveRecord::Migration[6.1]
  def up
    if Rails.env.development?
      execute "DELETE FROM course_versions WHERE content_root_type != 'UnitGroup'"
    end
  end

  def down
  end
end
