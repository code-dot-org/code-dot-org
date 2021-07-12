class AddPublishedStateToCourseVersions < ActiveRecord::Migration[5.2]
  def change
    add_column :course_versions, :published_state, :string
  end
end
