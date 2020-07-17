class AddContentRootToCourseVersion < ActiveRecord::Migration[5.0]
  def change
    add_reference :course_versions, :content_root, polymorphic: true
  end
end
