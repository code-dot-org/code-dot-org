class CreateBlocks < ActiveRecord::Migration[5.0]
  def change
    create_table :blocks do |t|
      t.string :name
      t.string :level_type
      t.text :properties

      t.timestamps
    end
  end
end
