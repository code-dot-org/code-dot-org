class AddTimestampsToFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    remove_column :featured_projects, :who_featured_user_id, :integer
    add_column :featured_projects, :unfeatured_at, :datetime
  end
end
