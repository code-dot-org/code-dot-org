class AddUniqueIndexToProgrammingEnvironmentOnName < ActiveRecord::Migration[5.2]
  def change
    add_index :programming_environments, :name, unique: true
  end
end
