class FixProjectsIndex < ActiveRecord::Migration[6.0]
  def up
    return if Rails.env.production?

    existing_index = indexes('projects').select {|i| i.name == "storage_apps_project_type_index"}.first
    if existing_index.lengths.blank?
      remove_index :projects, :project_type
      add_index :projects, :project_type, length: 191, name: 'storage_apps_project_type_index'
    end
  end

  def down
  end
end
