class AddKeysToChallenges < ActiveRecord::Migration[7.0]
  def change
    add_column :challenges, :key, :string
    add_column :challenges, :whiteboard_starter_image_key, :string
    add_index :challenges, :key, unique: true
  end
end
