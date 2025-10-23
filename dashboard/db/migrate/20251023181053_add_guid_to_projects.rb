class AddGuidToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :guid, :string
    add_index :projects, :guid, unique: true
  end
end
