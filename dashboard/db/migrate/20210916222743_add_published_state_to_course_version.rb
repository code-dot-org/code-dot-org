class AddPublishedStateToCourseVersion < ActiveRecord::Migration[5.2]
  def change
    add_column :course_versions, :published_state, :string, default: 'in_development'
  end
end
