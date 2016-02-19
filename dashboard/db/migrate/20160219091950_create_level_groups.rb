class CreateLevelGroups < ActiveRecord::Migration
  def change
    create_table :level_groups do |t|
      t.integer :game_id
      t.string :name
      t.datetime :created_at
      t.datetime :updated_at
      t.string :level_num
      t.integer :ideal_level_source_id
      t.integer :solution_level_source_id
      t.integer :user_id
      t.text :properties
      t.string :type
      t.string :md5
      t.boolean :published

      t.timestamps null: false
    end
  end
end
