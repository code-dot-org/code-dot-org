class CreatePuzzleRatings < ActiveRecord::Migration[4.2]
  def change
    create_table :puzzle_ratings do |t|
      t.references :user
      t.integer :script_id
      t.integer :level_id
      t.integer :rating

      t.timestamps null: false
    end

    add_index :puzzle_ratings, [:script_id, :level_id]
    add_index :puzzle_ratings, [:user_id, :script_id, :level_id], unique: true
  end
end
