class CreateLibraries < ActiveRecord::Migration[5.0]
  def change
    create_table :libraries do |t|
      t.string :name, null: false
      t.text :contents
      t.timestamps null: false
    end
  end
end
