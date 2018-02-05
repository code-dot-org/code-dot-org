class AddIndexToFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    remove_index :featured_projects, :storage_app_id
    add_index :featured_projects, :storage_app_id, unique: true
  end
end
