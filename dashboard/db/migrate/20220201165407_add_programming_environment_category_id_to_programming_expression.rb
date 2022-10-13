class AddProgrammingEnvironmentCategoryIdToProgrammingExpression < ActiveRecord::Migration[5.2]
  def change
    add_column :programming_expressions, :programming_environment_category_id, :integer
    add_index :programming_expressions, :programming_environment_category_id, name: "index_programming_expressions_on_environment_category_id"
  end
end
