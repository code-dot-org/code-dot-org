class AddWhoseProjectToFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :featured_projects, :whose_project_user_id, :integer
  end
end
