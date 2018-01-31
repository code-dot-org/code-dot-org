class AddTimestampsToFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    remove_column :featured_projects, :created_at, :integer
    add_column :featured_projects, :featured_at, :datetime
  end
end
