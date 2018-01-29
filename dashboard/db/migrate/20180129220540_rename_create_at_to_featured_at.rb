class RenameCreateAtToFeaturedAt < ActiveRecord::Migration[5.0]
  def change
    rename_column :featured_projects, :created_at, :featured_at
  end
end
