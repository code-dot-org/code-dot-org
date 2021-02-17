class CreateProgrammingExpressions < ActiveRecord::Migration[5.2]
  def change
    create_table :programming_expressions do |t|
      t.string :name, null: false
      t.string :category
      t.text :properties

      t.timestamps
    end
  end
end
