class AddIsFeaturedToFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :featured_projects, :is_featured, :boolean
  end
end
