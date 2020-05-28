class AddOwnerToLevels < ActiveRecord::Migration[5.0]
  def change
    add_column :levels, :owner_id, :integer
  end
end
