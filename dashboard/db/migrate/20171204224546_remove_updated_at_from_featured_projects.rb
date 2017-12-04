class RemoveUpdatedAtFromFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    remove_column :featured_projects, :updated_at, :datetime
  end
end
