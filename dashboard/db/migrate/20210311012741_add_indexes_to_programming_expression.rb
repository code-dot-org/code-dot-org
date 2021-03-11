class AddIndexesToProgrammingExpression < ActiveRecord::Migration[5.2]
  def change
    add_index :programming_expressions, [:name, :category], type: :fulltext
    add_index :programming_expressions, [:key, :programming_environment_id], unique: true, name: 'key_programming_environment'
  end
end
