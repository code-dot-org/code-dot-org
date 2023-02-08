class UpdateCourseVersionIndex < ActiveRecord::Migration[6.0]
  def up
    add_index :course_versions, [:course_offering_id, :key, :content_root_type], unique: true, name: 'index_course_versions_on_offering_id_and_key_and_type'
    remove_index :course_versions, [:course_offering_id, :key]
  end

  def down
    add_index :course_versions, [:course_offering_id, :key], unique: true
    remove_index :course_versions, [:course_offering_id, :key, :content_root_type]
  end
end
