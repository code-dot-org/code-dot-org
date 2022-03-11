class CreateProgrammingExpressionMethod < ActiveRecord::Migration[5.2]
  def change
    create_table :programming_expression_methods do |t|
      t.integer :programming_expression_id, null: false
      t.string :key, null: false
      t.string :name
      t.string :syntax
      t.string :external_link
      t.text :parameters
      t.text :examples

      t.index [:key, :programming_expression_id], unique: true, name: 'index_programming_expression_methods_on_key_and_expression_id'

      t.timestamps
    end
  end
end
