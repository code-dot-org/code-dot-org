class AddKeyToObjectives < ActiveRecord::Migration[5.2]
  def change
    add_column :objectives, :key, :string
    add_index :objectives, :key, unique: true
  end
end
