class CreateProgrammingMethods < ActiveRecord::Migration[5.2]
  def change
    create_table :programming_methods do |t|
      t.integer :programming_class_id
      t.string :key
      t.integer :position
      t.string :name
      t.text :content
      t.text :parameters
      t.text :examples
      t.string :syntax
      t.string :external_link

      t.timestamps

      t.index [:key, :programming_class_id], unique: true
    end
  end
end
