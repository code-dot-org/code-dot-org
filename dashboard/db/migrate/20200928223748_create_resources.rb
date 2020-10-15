class CreateResources < ActiveRecord::Migration[5.0]
  def change
    create_table :resources do |t|
      t.string :name
      t.string :url, null: false
      t.string :key, null: false
      t.string :properties

      t.index :key, unique: true

      t.timestamps
    end
  end
end
