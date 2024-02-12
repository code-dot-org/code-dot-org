class AddStatusToFeaturedProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :featured_projects, :status, :string, default: "saved"
  end
end
