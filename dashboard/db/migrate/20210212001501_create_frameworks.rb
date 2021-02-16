class CreateFrameworks < ActiveRecord::Migration[5.2]
  def change
    create_table :frameworks do |t|
      t.string :shortcode, null: false
      t.string :name, null: false
      t.text :properties
      t.timestamps

      t.index :shortcode, unique: true
    end
  end
end
