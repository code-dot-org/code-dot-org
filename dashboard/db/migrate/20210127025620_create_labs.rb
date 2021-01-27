class CreateLabs < ActiveRecord::Migration[5.2]
  def change
    create_table :labs do |t|
      t.string :key, null: false
      t.string :name, null: false
      t.text :properties

      t.timestamps
    end
  end
end
