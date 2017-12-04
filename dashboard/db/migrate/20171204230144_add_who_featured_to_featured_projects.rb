class AddWhoFeaturedToFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :featured_projects, :who_featured_user_id, :integer
  end
end
