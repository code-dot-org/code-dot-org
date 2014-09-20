class CreateUserLevels < ActiveRecord::Migration
  def change
    create_table :user_levels do |t|
      t.references :user, null: false
      t.references :level, null: false
      t.integer :attempts, null: false, default: 0
      t.integer :stars, null: false, default: 0

      t.timestamps
    end

    add_index :user_levels, [:user_id,:level_id], unique: true

    # add some columns/keys to activities
    add_column :activities, :stars, :integer
    add_column :activities, :attempt, :integer
    add_column :activities, :time, :integer

    add_index :activities, [:user_id,:level_id]
  end
end
