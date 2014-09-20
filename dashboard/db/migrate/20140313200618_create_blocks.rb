class CreateBlocks < ActiveRecord::Migration
  def change
    create_table :blocks do |t|
      t.string :name, null: false
      t.string :xml, limit: 20000, null: false

      t.timestamps
    end
  end
end
