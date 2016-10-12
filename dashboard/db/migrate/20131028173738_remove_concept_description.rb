class RemoveConceptDescription < ActiveRecord::Migration[4.2]
  def change
    remove_column :concepts, :description
  end
end
