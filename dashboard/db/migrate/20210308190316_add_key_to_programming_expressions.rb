class AddKeyToProgrammingExpressions < ActiveRecord::Migration[5.2]
  def change
    add_column :programming_expressions, :key, :string, null: false
  end
end
