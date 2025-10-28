class AddUuidToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :uuid, :string
    add_index :projects, :uuid, unique: true
  end
end
