class CreatePairedUserLevels < ActiveRecord::Migration
  def change
    create_table :paired_user_levels do |t|
      t.integer :driver_user_level_id
      t.integer :navigator_user_level_id

      t.timestamps null: false

      t.index :driver_user_level_id
      t.index :navigator_user_level_id
    end
  end
end
