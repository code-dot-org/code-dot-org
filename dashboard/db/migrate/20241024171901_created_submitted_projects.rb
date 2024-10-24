class CreatedSubmittedProjects < ActiveRecord::Migration[6.1]
  def change
    # use utf8mb4 to support emojis
    create_table :submitted_projects, charset: 'utf8mb4', collation: 'utf8mb4_bin' do |t|
      t.integer :project_id
      t.string :description
      t.datetime :declined_at
      t.timestamps
    end

    add_index :submitted_projects, :project_id, unique: true
    add_index :submitted_projects, :declined_at
  end
end
