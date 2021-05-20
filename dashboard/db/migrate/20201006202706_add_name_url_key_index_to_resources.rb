class AddNameUrlKeyIndexToResources < ActiveRecord::Migration[5.0]
  def change
    add_index :resources, [:name, :url], type: :fulltext
  end
end
