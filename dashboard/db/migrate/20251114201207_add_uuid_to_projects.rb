class AddUuidToProjects < ActiveRecord::Migration[6.1]
  def up
    add_column :projects, :uuid, :string
    # Indexes on large tables, like this one in Production, must be added manually
    unless Rails.env.production?
      add_index :projects, :uuid, unique: true
    end
  end

  def down
    unless Rails.env.production?
      remove_index :projects, :uuid
    end
    remove_column :projects, :uuid
  end
end
