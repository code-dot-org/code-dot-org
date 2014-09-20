class RemoveConceptDescription < ActiveRecord::Migration
  def change
    remove_column :concepts, :description
  end
end
