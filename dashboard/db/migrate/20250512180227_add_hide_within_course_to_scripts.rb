class AddHideWithinCourseToScripts < ActiveRecord::Migration[6.1]
  def change
    add_column :scripts, :hide_within_course, :boolean, default: false
  end
end
