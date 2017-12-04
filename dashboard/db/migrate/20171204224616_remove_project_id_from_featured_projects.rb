class RemoveProjectIdFromFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    remove_column :featured_projects, :project_id, :string
  end
end
