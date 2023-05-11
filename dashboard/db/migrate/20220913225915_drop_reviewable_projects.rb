class DropReviewableProjects < ActiveRecord::Migration[6.0]
  def change
    drop_table :reviewable_projects
  end
end
