class AddKeyToSkills < ActiveRecord::Migration[6.1]
  def change
    add_column :skills, :key, :string, null: false
    add_index :skills, :key, unique: true
  end
end
