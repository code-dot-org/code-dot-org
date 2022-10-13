class AddOverloadedByToProgrammingMethods < ActiveRecord::Migration[5.2]
  def change
    add_column :programming_methods, :overloaded_by, :string
  end
end
