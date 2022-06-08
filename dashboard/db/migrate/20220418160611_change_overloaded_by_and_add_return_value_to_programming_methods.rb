class ChangeOverloadedByAndAddReturnValueToProgrammingMethods < ActiveRecord::Migration[6.0]
  def change
    rename_column :programming_methods, :overloaded_by, :overload_of
    add_column :programming_methods, :return_value, :string
    add_index :programming_methods, [:programming_class_id, :overload_of], name: 'index_programming_methods_on_class_id_and_overload_of'
  end
end
