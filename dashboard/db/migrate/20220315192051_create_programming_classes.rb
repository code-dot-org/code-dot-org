class CreateProgrammingClasses < ActiveRecord::Migration[5.2]
  def change
    create_table :programming_classes do |t|
      t.integer :programming_environment_id
      t.integer :programming_environment_category_id
      t.string :key
      t.string :name
      t.text :content
      t.text :fields
      t.text :examples
      t.text :tips
      t.string :syntax
      t.string :external_documentation

      t.timestamps

      t.index [:key, :programming_environment_id], unique: true
      t.index [:key, :programming_environment_category_id], unique: true, name: 'index_programming_classes_on_key_and_category_id'
    end
  end
end
