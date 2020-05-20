class CreateParentLevelsChildLevels < ActiveRecord::Migration[5.0]
  def change
    create_table :parent_levels_child_levels do |t|
      t.integer :parent_level_id, null: false, index: true
      t.integer :child_level_id, null: false, index: true
      t.integer :position
    end
  end
end
