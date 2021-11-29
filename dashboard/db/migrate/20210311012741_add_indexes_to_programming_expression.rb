class AddIndexesToProgrammingExpression < ActiveRecord::Migration[5.2]
  def change
    add_index :programming_expressions, [:name, :category], type: :fulltext
    add_index :programming_expressions, [:programming_environment_id, :key], unique: true, name: 'programming_environment_key'
  end
end
