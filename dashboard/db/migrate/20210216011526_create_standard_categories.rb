class CreateStandardCategories < ActiveRecord::Migration[5.2]
  def change
    create_table :standard_categories do |t|
      t.string :shortcode, null: false
      t.integer :framework_id, null: false
      t.integer :parent_category_id, index: true
      t.string :category_type, null: false
      t.text :properties
      t.timestamps
      t.index [:framework_id, :shortcode], unique: true
    end
  end
end
