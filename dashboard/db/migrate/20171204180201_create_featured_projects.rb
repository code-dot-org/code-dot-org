class CreateFeaturedProjects < ActiveRecord::Migration[5.0]
  def change
    create_table :featured_projects do |t|
      t.string :project_id

      t.timestamps
    end
  end
end
