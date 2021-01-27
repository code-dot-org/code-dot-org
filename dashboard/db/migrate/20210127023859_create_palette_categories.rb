class CreatePaletteCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :palette_categories do |t|
      t.string :key, null: false
      t.string :name, null: false
      t.string :color, null: false
      t.integer :lab_id, null: false

      t.timestamps
    end
  end
end
