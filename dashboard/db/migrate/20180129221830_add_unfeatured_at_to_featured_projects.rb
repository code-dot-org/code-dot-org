class AddUnfeaturedAtToFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :featured_projects, :unfeatured_at, :datetime
  end
end
