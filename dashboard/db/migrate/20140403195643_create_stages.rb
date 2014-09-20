class CreateStages < ActiveRecord::Migration
  def change
    create_table :stages do |t|
      t.string :name, null: false
      t.integer :position
      t.references :script, null: false

      t.timestamps
    end
  end
end
