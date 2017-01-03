class CreateContainedLevels < ActiveRecord::Migration[5.0]
  def change
    create_table :contained_levels do |t|
      t.timestamps
      t.integer :level_group_level_id, null: false, index: true
      t.integer :contained_level_id, null: false, index: true
      t.string :contained_level_type, null: false
      t.integer :contained_level_page, null: false
      t.integer :contained_level_position, null: false
      t.text :contained_level_text
    end
  end
end
