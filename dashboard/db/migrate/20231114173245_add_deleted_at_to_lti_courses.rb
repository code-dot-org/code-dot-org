class AddDeletedAtToLtiCourses < ActiveRecord::Migration[6.1]
  def change
    add_column :lti_courses, :deleted_at, :datetime
    add_index :lti_courses, :deleted_at
  end
end
