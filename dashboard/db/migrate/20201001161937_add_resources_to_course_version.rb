class AddResourcesToCourseVersion < ActiveRecord::Migration[5.0]
  def change
    add_column :resources, :course_version_id, :integer
    remove_index :resources, name: 'index_resources_on_key'
    add_index :resources, [:course_version_id, :key], unique: true
  end
end
