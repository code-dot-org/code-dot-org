class CreateBlocks < ActiveRecord::Migration[5.0]
  def change
    create_table :blocks do |t|
      t.string :name
      t.string :level_type
      t.text :category
      t.text :config
      t.text :helper_code

      t.timestamps
    end
  end
end
