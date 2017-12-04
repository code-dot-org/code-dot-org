class AddStorageAppsIdToFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :featured_projects, :storage_app_id, :integer
  end
end
