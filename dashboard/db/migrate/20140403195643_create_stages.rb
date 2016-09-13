class CreateStages < ActiveRecord::Migration[4.2]
  def change
    create_table :stages do |t|
      t.string :name, null: false
      t.integer :position
      t.references :script, null: false

      t.timestamps
    end
  end
end
