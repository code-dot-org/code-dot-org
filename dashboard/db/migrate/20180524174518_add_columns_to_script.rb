class AddColumnsToScript < ActiveRecord::Migration[5.0]
  def change
    add_column :scripts, :new_name, :string
    add_index :scripts, :new_name, unique: true
    add_column :scripts, :family_name, :string
    add_index :scripts, :family_name
  end
end
