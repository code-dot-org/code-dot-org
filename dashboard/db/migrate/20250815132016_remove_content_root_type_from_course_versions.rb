class RemoveContentRootTypeFromCourseVersions < ActiveRecord::Migration[6.1]
  def up
    remove_index :course_versions, name: "index_course_versions_on_content_root_type_and_content_root_id"
    remove_index :course_versions, name: "index_course_versions_on_offering_id_and_key_and_type"
    add_index :course_versions, [:course_offering_id, :key], name: "index_course_versions_on_offering_id_and_key", unique: true
    add_index :course_versions, :content_root_id
    remove_column :course_versions, :content_root_type
  end

  def down
    add_column :course_versions, :content_root_type, :string, null: false, default: "UnitGroup"
    remove_index :course_versions, :content_root_id
    remove_index :course_versions, name: "index_course_versions_on_offering_id_and_key"
    add_index :course_versions, [:course_offering_id, :key, :content_root_type], name: "index_course_versions_on_offering_id_and_key_and_type", unique: true
    add_index :course_versions, [:content_root_type, :content_root_id], name: "index_course_versions_on_content_root_type_and_content_root_id"
  end
end
